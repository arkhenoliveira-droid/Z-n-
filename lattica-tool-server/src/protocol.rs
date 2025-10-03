use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct ExecuteCodeParams {
    /// The source code in a supported language (currently only Rust)
    pub language: String,
    /// The raw source code string
    pub code: String,
    /// Optional per‑run limits (overrides defaults)
    #[serde(default)]
    pub max_fuel: Option<u64>,
    #[serde(default)]
    pub max_memory: Option<u64>,
    #[serde(default)]
    pub timeout_ms: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct ExecuteCodeResult {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
    pub timed_out: bool,
    pub fuel_used: Option<u64>,
}