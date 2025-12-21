/// WebSocket handler for real-time security event streaming
///
/// # Purpose
/// Provides WebSocket endpoint for streaming security events to frontend dashboard
///
/// @ref Story-5.4 - WebSocket streaming implementation
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::response::IntoResponse;
use futures::{sink::SinkExt, stream::StreamExt};
use tokio::sync::broadcast;
use once_cell::sync::Lazy;
use serde_json;
use ganache_api::models::security::SecurityEvent;

/// Global broadcast channel for security events
static EVENT_BROADCASTER: Lazy<broadcast::Sender<String>> = Lazy::new(|| {
    let (tx, _) = broadcast::channel(100);
tx
});

/// Broadcast a security event to all connected WebSocket clients
///
/// # Purpose
/// Sends event JSON to all subscribed WebSocket connections
///
/// @ref Story-5.4 - Event broadcasting
pub fn broadcast_event(event: &SecurityEvent) {
    if let Ok(json) = serde_json::to_string(event) {
        let _ = EVENT_BROADCASTER.send(json);
    }
}

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
    let mut rx = EVENT_BROADCASTER.subscribe();

    // Spawn task to send events to client
    let mut send_task = tokio::spawn(async move {
        while let Ok(event_json) = rx.recv().await {
            if sender
                .send(Message::Text(event_json.into()))
                .await
                .is_err()
            {
                break;
            }
        }
    });

    // Spawn task to receive messages from client (for pong/close)
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Close(_) => break,
                Message::Ping(data) => {
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
