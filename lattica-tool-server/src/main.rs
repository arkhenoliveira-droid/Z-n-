use actix_web::{App, HttpServer, middleware::Logger};
mod handlers;
mod protocol;
mod sandbox;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logging
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    // Configuration: bind address, port
    let bind_addr = std::env::var("LISTEN_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".into());

    log::info!("Starting Lattica tool server on {}", bind_addr);

    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default())
            .configure(handlers::configure)
    })
    .bind(bind_addr)?
    .run()
    .await
}