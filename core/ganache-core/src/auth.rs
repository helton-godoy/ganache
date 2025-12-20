use axum::{
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
};

/// Simple authenticated user extractor for configuration change tracking
///
/// This extractor reads the username from the `X-Auth-User` HTTP header.
/// If the header is not present or invalid, it defaults to "system" for
/// backward compatibility.
///
/// # Usage
///
/// Add `AuthenticatedUser` as a parameter to any Axum handler:
///
/// ```rust,ignore
/// async fn my_handler(user: AuthenticatedUser, Json(payload): Json<MyPayload>) {
///     println!("User: {}", user.username);
/// }
/// ```
///
/// # Note
///
/// This is a **placeholder implementation** until a full authentication system
/// (OAuth2, JWT, session-based auth, etc.) is implemented in a future story.
/// The current implementation trusts the client to send the correct header.
///
/// @ref Story-3.1 - Git-backed configuration engine with user attribution
#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    /// Username extracted from X-Auth-User header, or "system" if not present
    pub username: String,
}

impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, String);

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // Extract username from X-Auth-User header
        // Falls back to "system" if header is missing or invalid
        let username = parts
            .headers
            .get("X-Auth-User")
            .and_then(|h| h.to_str().ok())
            .map(|s| s.to_string())
            .unwrap_or_else(|| "system".to_string());

        Ok(AuthenticatedUser { username })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{HeaderValue, Request};

    #[tokio::test]
    async fn test_extract_user_from_header() {
        let req = Request::builder()
            .header("X-Auth-User", "testuser")
            .body(Body::empty())
            .unwrap();

        let (mut parts, _body) = req.into_parts();
        let user = AuthenticatedUser::from_request_parts(&mut parts, &())
            .await
            .unwrap();

        assert_eq!(user.username, "testuser");
    }

    #[tokio::test]
    async fn test_defaults_to_system_when_header_missing() {
        let req = Request::builder().body(Body::empty()).unwrap();

        let (mut parts, _body) = req.into_parts();
        let user = AuthenticatedUser::from_request_parts(&mut parts, &())
            .await
            .unwrap();

        assert_eq!(user.username, "system");
    }

    #[tokio::test]
    async fn test_defaults_to_system_when_header_invalid() {
        let mut req = Request::builder().body(Body::empty()).unwrap();

        // Insert invalid UTF-8 header value
        req.headers_mut().insert(
            "X-Auth-User",
            HeaderValue::from_bytes(&[0xFF, 0xFE]).unwrap(),
        );

        let (mut parts, _body) = req.into_parts();
        let user = AuthenticatedUser::from_request_parts(&mut parts, &())
            .await
            .unwrap();

        assert_eq!(user.username, "system");
    }
}
