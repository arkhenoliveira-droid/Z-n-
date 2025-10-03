use anyhow::{anyhow, Context, Result};
use std::sync::Arc;
use tokio::time::{timeout, Duration};
use wasmtime::{Config, Engine, Linker, Module, Store};
use wasmtime_wasi::{WasiCtxBuilder, WasiCtx};
use std::io::Write;

const DEFAULT_MAX_FUEL: u64 = 10_000_000;
use crate::protocol::ExecuteCodeResult;

const DEFAULT_MAX_MEMORY: u64 = 64 * 1024 * 1024; // bytes
const DEFAULT_TIMEOUT_MS: u64 = 5_000;

pub async fn execute_wasm(
    wasm: &[u8],
    max_fuel: Option<u64>,
    max_memory: Option<u64>,
    timeout_ms: Option<u64>,
) -> Result<ExecuteCodeResult> {
    // Configure engine
    let mut config = Config::new();
    config.consume_fuel(true);
    // restrict features if desired:
    config.wasm_backtrace_details(wasmtime::WasmBacktraceDetails::Enable);

    let engine = Engine::new(&config)?;

    // Build WASI with buffered stdout/stderr
    let mut stdout_buf = Vec::new();
    let mut stderr_buf = Vec::new();

    // create wasi context that writes to our buffers via pipe-like wrappers
    let wasi = WasiCtxBuilder::new()
        .inherit_env()? // optional: you can remove to tighten isolation
        .stdout(Box::new(writer_to_vec::Writer(&mut stdout_buf)))
        .stderr(Box::new(writer_to_vec::Writer(&mut stderr_buf)))
        .build();

    let mut store = Store::new(&engine, wasi);

    // set fuel
    let fuel = max_fuel.unwrap_or(DEFAULT_MAX_FUEL);
    store.add_fuel(fuel).context("setting fuel")?;

    // compile module
    let module = Module::from_binary(&engine, wasm).context("parsing wasm module")?;

    let mut linker = Linker::new(&engine);
    wasmtime_wasi::add_to_linker(&mut linker, |s| s).context("adding wasi to linker")?;

    // instantiate
    let instance = linker.instantiate(&mut store, &module).context("instantiating module")?;

    // get _start fn
    let start = instance
        .get_func(&mut store, "_start")
        .ok_or_else(|| anyhow!("module does not export _start"))?
        .typed::<(), (), _>(&store)
        .context("typing _start")?;

    let timeout_dur = Duration::from_millis(timeout_ms.unwrap_or(DEFAULT_TIMEOUT_MS));

    // run with timeout
    let run = async {
        match start.call_async(&mut store, ()).await {
            Ok(()) => Ok(()),
            Err(trap) => {
                // trap could be user abort, panic, or memory error
                Err(anyhow!("Wasm trap: {}", trap))
            }
        }
    };

    let timed_out = match timeout(timeout_dur, run).await {
        Ok(Ok(())) => false,
        Ok(Err(e)) => {
            // finished with trap
            log::warn!("Wasm finished with trap: {}", e);
            false
        }
        Err(_) => {
            // timeout — interrupt the store
            if let Ok(handle) = store.interrupt_handle() {
                handle.interrupt();
            }
            true
        }
    };

    let fuel_used = store.fuel_consumed().ok();

    // read buffers
    let stdout = String::from_utf8_lossy(&stdout_buf).to_string();
    let stderr = String::from_utf8_lossy(&stderr_buf).to_string();

    let exit_code = if timed_out { 1 } else { 0 };

    Ok(ExecuteCodeResult {
        stdout,
        stderr,
        exit_code,
        timed_out,
        fuel_used,
    })
}

// tiny helper to adapt Vec<u8> writer into Write trait object for wasi
mod writer_to_vec {
    use std::io::{Result as IoResult, Write};

    pub struct Writer<'a>(pub &'a mut Vec<u8>);

    impl<'a> Write for Writer<'a> {
        fn write(&mut self, buf: &[u8]) -> IoResult<usize> {
            self.0.extend_from_slice(buf);
            Ok(buf.len())
        }
        fn flush(&mut self) -> IoResult<()> {
            Ok(())
        }
    }
}