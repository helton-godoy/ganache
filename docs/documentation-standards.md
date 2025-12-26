# Documentation Standards

This document defines the mandatory documentation standards for the Ganache project, supporting our **Semi-Automated Documentation Strategy**.

## 1. Principles

1. **Single Source of Truth**: Code is the source. Documentation is generated.
2. **Semantic Links**: We use `@ref [Story-ID]` to link implementation to requirements.
3. **Validation First**: If you don't document, the build fails.

## 2. Rust (Backend)

Every public item (`pub fn`, `struct`, `enum`, `trait`) MUST have a doc block with the following sections:

```rust
/// # Purpose
/// Brief explanation of what this item does.
///
/// # Arguments
/// * `arg1` - Description
///
/// # Returns
/// * `Result<...>` - Description of success/error
///
/// # Panic
/// Description of panic conditions (or "Never")
///
/// @ref Story-X.Y - Context
pub fn example() {}
```

## 3. React (Frontend)

Every exported component MUST have a JSDoc block:

```tsx
/**
 * @description Description of the component.
 *
 * @param props.label - Description of prop
 * @returns JSX Element
 *
 * @ref Story-X.Y - Context
 */
export function Component() {}
```

## 4. Traceability

Use the `@ref` tag in any comment to link code to a User Story.

Syntax: `@ref Story-ID - Context`
Example: `// @ref Story-4.2 - ACL validation logic`

## 5. Automation

- **Extraction**: `bmad-sync.sh` runs automatically on commit/push to update `docs/api/*` and `docs/components/*`.
- **Validation**: `bmad-validate.sh` (CI) ensures all public code is documented.
