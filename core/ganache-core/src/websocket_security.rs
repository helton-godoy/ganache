/// WebSocket handler for real-time security event streaming
///
/// # Purpose
/// Provides WebSocket endpoint for streaming security events to frontend dashboard
///
/// @ref Story-5.4 - WebSocket streaming implementation
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::response::IntoResponse;
use futures::{sink::SinkExt, stream::StreamExt};
use serde_json;

use ganache_lib::SecurityEventService;

/// O broadcast_event não é mais necessário aqui pois o SecurityEventService cuida disso
/// ao adicionar um evento.

/// WebSocket upgrade handler
///
/// # Purpose
/// Handles WebSocket upgrade and starts event streaming
///
/// @ref Story-5.4 - WebSocket endpoint
#[utoipa::path(
    get,
    path = "/api/v1/security/events/ws",
    responses(
        (status = 101, description = "WebSocket connection established"),
        (status = 401, description = "Authentication required")
    )
)]
pub async fn ws_security_events(
    ws: WebSocketUpgrade,
    _user: crate::auth::AuthenticatedUser,
) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

/// Handle WebSocket connection
///
/// # Purpose
/// Manages WebSocket connection lifecycle, sends events and heartbeats
///
/// @ref Story-5.4 - WebSocket connection handler
async fn handle_socket(socket: WebSocket) {
    let (mut sender, mut receiver) = socket.split();
    let mut rx = SecurityEventService::subscribe();

    // Spawn task to send events to client
    let mut send_task = tokio::spawn(async move {
        while let Ok(event) = rx.recv().await {
            if let Ok(event_json) = serde_json::to_string(&event) {
                if sender.send(Message::Text(event_json.into())).await.is_err() {
                    break;
                }
            }
        }
    });

    // Spawn task to receive messages from client (for pong/close)
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Close(_) => break,
                Message::Ping(_data) => {
                    // Echo back pong
                    tracing::debug!("Received ping, sending pong");
                }
                _ => {}
            }
        }
    });

    // Wait for either task to finish
    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    }

    tracing::info!("WebSocket connection closed");
}
