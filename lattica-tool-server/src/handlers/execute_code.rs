use actix_web::{post, web, HttpResponse, Responder};
use serde_json::json;
use crate::protocol::{ExecuteCodeParams, ExecuteCodeResult};
use crate::sandbox::wasm_executor::execute_wasm;
use anyhow::Context;
use std::sync::Arc;

#[post("/rpc")]
pub async fn rpc_handler(body: web::Json<serde_json::Value>) -> impl Responder {
    let method = body.get("method")
        .and_then(|m| m.as_str())
        .unwrap_or_default();

    match method {
        "execute_code" => handle_execute_code(body.clone()).await,
        _ => HttpResponse::BadRequest().json(json!( {
            "jsonrpc": "2.0",
            "error": { "code": -32601, "message": "Method not found" },
            "id": body.get("id")
        })),
    }
}

async fn handle_execute_code(payload: web::Json<serde_json::Value>) -> HttpResponse {
    let id = payload.get("id").cloned();

    let params: ExecuteCodeParams = match serde_json::from_value(payload["params"].clone()) {
        Ok(p) => p,
        Err(e) => {
            log::warn!("Invalid params for execute_code: {}", e);
            return HttpResponse::Ok().json(json!( {
                "jsonrpc": "2.0",
                "error": { "code": -32602, "message": format!("Invalid params: {}", e) },
                "id": id
            }));
        }
    };

    // simple guard
    if params.code.trim().is_empty() {
        return HttpResponse::Ok().json(json!({
            "jsonrpc": "2.0",
            "error": { "code": -32002, "message": "Empty code payload" },
            "id": id
        }));
    }

    // Compile to Wasm
    let wasm_bytes = match compile_to_wasm(&params).await {
        Ok(b) => b,
        Err(e) => {
            log::error!("Compilation error: {:?}", e);
            return HttpResponse::Ok().json(json!({
                "jsonrpc": "2.0",
                "result": {
                    "stdout": "",
                    "stderr": format!("Compilation error: {}", e),
                    "exit_code": 1,
                    "timed_out": false,
                    "fuel_used": null
                },
                "id": id
            }));
        }
    };

    // Execute
    let exec_res = execute_wasm(
        &wasm_bytes,
        params.max_fuel,
        params.max_memory,
        params.timeout_ms,
    ).await;

    match exec_res {
        Ok(res) => HttpResponse::Ok().json(json!({
            "jsonrpc": "2.0",
            "result": res,
            "id": id
        })),
        Err(e) => {
            log::error!("Execution failure: {:?}", e);
            HttpResponse::InternalServerError().json(json!({
                "jsonrpc": "2.0",
                "error": { "code": -32603, "message": format!("Execution failure: {}", e) },
                "id": id
            }))
        }
    }
}

/// Compile Rust source to wasm32-wasi using rustc in a tempdir.
/// You may replace with `cargo` build if you prefer project-style builds.
async fn compile_to_wasm(params: &ExecuteCodeParams) -> anyhow::Result<Vec<u8>> {
    if params.language.to_lowercase() != "rust" {
        anyhow::bail!("Unsupported language: {}", params.language);
    }

    let dir = tempfile::tempdir().context("creating temp dir")?;
    let src_path = dir.path().join("main.rs");
    std::fs::write(&src_path, &params.code).context("writing source file")?;

    // rustc invocation
    let out_path = dir.path().join("out.wasm");
    let rustc = std::env::var("RUSTC_PATH").unwrap_or_else(|_| "rustc".into());

    let mut cmd = tokio::process::Command::new(rustc);
    cmd.args(&[
        "--edition=2021",
        "-C", "opt-level=z",
        "-C", "panic=abort",
        "--target", "wasm32-wasi",
        src_path.to_str().unwrap(),
        "-o",
        out_path.to_str().unwrap(),
    ]);
    // give the compiler a short environment
    cmd.env_clear();
    // allow PATH for rustc; if you ship a builder image, set RUSTC_PATH explicitly

    let output = cmd.output().await.context("spawning rustc")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        anyhow::bail!("rustc failed: {}", stderr);
    }

    let wasm = tokio::fs::read(out_path).await.context("reading wasm output")?;
    Ok(wasm)
}