use actix_web::{post, web, HttpResponse, Responder};
use serde_json::json;

// This is a dummy handler to allow the project to compile.
// It will not be called by the `execute_code` RPC dispatcher.
#[post("/rpc_search_web_dummy")]
pub async fn rpc_handler(body: web::Json<serde_json::Value>) -> impl Responder {
    HttpResponse::BadRequest().json(json!({
        "jsonrpc": "2.0",
        "error": { "code": -32601, "message": "Method 'search_web' is not implemented" },
        "id": body.get("id")
    }))
}