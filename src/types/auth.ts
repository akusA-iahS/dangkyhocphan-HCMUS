/** Error codes the hcmus.online auth server may return */
export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_LOCKED"
  | "ACCOUNT_EXPIRED"
  | "RATE_LIMITED"
  | "SESSION_EXISTS"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

/** Human-readable messages keyed by error code */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: "Invalid credentials. Please try again.",
  ACCOUNT_LOCKED:   "Account is locked. Contact your administrator.",
  ACCOUNT_EXPIRED:  "Account has expired. Please renew your credentials.",
  RATE_LIMITED:     "Too many login attempts. Wait a moment and try again.",
  SESSION_EXISTS:   "You are already logged in from another session.",
  SERVER_ERROR:     "Authentication server is unavailable. Try again shortly.",
  NETWORK_ERROR:    "Cannot reach the authentication server. Check your connection.",
  TIMEOUT:          "Login request timed out. Please try again.",
  UNKNOWN:          "An unexpected error occurred. Please try again.",
};

/** Successful login response from the server */
export interface LoginSuccess {
  success: true;
  token: string;
  user: {
    studentId: string;
    name: string;
  };
}

/** Failed login response from the server */
export interface LoginFailure {
  success: false;
  error: {
    code: AuthErrorCode;
    message: string;
  };
}

export type LoginResponse = LoginSuccess | LoginFailure;

/** What our store exposes after a login attempt */
export interface LoginResult {
  ok: boolean;
  errorCode?: AuthErrorCode;
  errorMessage?: string;
}
