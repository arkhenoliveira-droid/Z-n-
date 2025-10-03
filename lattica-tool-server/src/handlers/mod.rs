pub mod search_web;
pub mod execute_code;

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    // Note: The execute_code handler uses a wildcard `rpc` endpoint.
    // The dummy search_web handler is registered on a different path
    // to avoid conflicts, but the main dispatcher in execute_code.rs
    // will handle routing for the "execute_code" method.
    cfg.service(execute_code::rpc_handler);
    cfg.service(search_web::rpc_handler);
}