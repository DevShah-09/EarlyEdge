# Feature: Authentication and Profile

## Purpose

Provides hospital-user registration, login, session persistence, protected navigation, logout, and editable Supabase user metadata.

## Implementation

- Signup page: `frontend/src/pages/SignUp.jsx`.
- Login page: `frontend/src/pages/LoginPage.jsx`.
- Profile page: `frontend/src/pages/ProfilePage.jsx`.
- Session state: `frontend/src/context/AuthContext.jsx`.
- Route gate: `frontend/src/components/common/ProtectedRoute.jsx`.
- Backend registration: `backend/routers/auth.py`.

## Registration flow

1. The signup form collects name, email, password, hospital name/type, and designation.
2. It posts to `/api/auth/register`.
3. FastAPI creates a Supabase Admin client using `SUPABASE_SERVICE_ROLE_KEY`.
4. `auth.admin.create_user` creates and auto-confirms the account.
5. Hospital/profile fields are stored in `user_metadata`, with role fixed to `hospital_admin`.
6. The browser signs in with password via the normal Supabase JS client and navigates to the dashboard.

Backend Admin Auth is used so registration does not wait for email confirmation. This is convenient for a prototype but should be paired with hospital verification/approval for production.

## Login and session lifecycle

`AuthContext` calls `supabase.auth.getSession()` at mount and subscribes to `onAuthStateChange`. Login calls `signInWithPassword`; logout calls `signOut`. `ProtectedRoute` shows a loader during session discovery and redirects unauthenticated visitors to `/login`.

The profile page updates user metadata directly with `supabase.auth.updateUser`. No application profile table exists, so profile fields live only in Auth metadata.

## Configuration

Frontend requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Registration additionally requires backend `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

Signup resolves the API base as `VITE_API_BASE_URL`, then `VITE_API_URL`, then localhost. Other services use only `VITE_API_URL`.

## Security limitations

Protected routes do not secure the API. Although Axios attaches the Supabase JWT, FastAPI does not validate it or use the user/hospital ID. There is no role enforcement, tenant isolation, rate limiting, password policy in repository code, or invitation/approval workflow. See [Security and safety](../security-and-safety.md).
