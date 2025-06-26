// Utility functions for handling authentication issues

export function hasCorruptedAuthData(): boolean {
  try {
    // Check if there are any Supabase auth keys in storage
    const supabaseKeys = Object.keys(localStorage).filter(
      (key) =>
        key.startsWith("sb-") ||
        key.includes("supabase") ||
        key.includes("auth"),
    );

    // If there are auth keys but no valid session, it's likely corrupted
    if (supabaseKeys.length > 0) {
      // Try to parse the auth token
      const authKey = Object.keys(localStorage).find(
        (key) =>
          key.includes("auth-token") && key.includes("fmriyqnwzeenkvlmukdk"),
      );

      if (authKey) {
        try {
          const authData = JSON.parse(localStorage.getItem(authKey) || "{}");
          // If token exists but is expired or malformed, it's corrupted
          if (authData.access_token && authData.expires_at) {
            const expiresAt = new Date(authData.expires_at * 1000);
            const now = new Date();
            if (expiresAt < now) {
              console.log("Auth token has expired");
              return true;
            }
          }
        } catch (e) {
          console.log("Auth token is malformed");
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking auth data:", error);
    return false;
  }
}

export function clearCorruptedAuthData() {
  try {
    // Clear all possible Supabase auth keys from localStorage
    const keysToRemove = [
      "supabase.auth.token",
      "supabase.auth.refreshToken",
      "supabase.session",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Clear any keys that start with 'sb-' (Supabase prefix)
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-")) {
        localStorage.removeItem(key);
      }
    });

    // Clear any keys that contain 'supabase' or 'auth'
    Object.keys(localStorage).forEach((key) => {
      if (key.includes("supabase") || key.includes("auth")) {
        localStorage.removeItem(key);
      }
    });

    // Also clear sessionStorage
    Object.keys(sessionStorage).forEach((key) => {
      if (
        key.startsWith("sb-") ||
        key.includes("supabase") ||
        key.includes("auth")
      ) {
        sessionStorage.removeItem(key);
      }
    });

    console.log("Cleared all authentication data from storage");
    return true;
  } catch (error) {
    console.error("Error clearing auth data:", error);
    return false;
  }
}

export function isAuthError(error: any): boolean {
  if (!error) return false;

  const authErrorMessages = [
    "Invalid Refresh Token",
    "Refresh Token Not Found",
    "AuthApiError",
    "JWT expired",
    "Invalid JWT",
    "Session not found",
  ];

  const errorMessage = error.message || error.toString();
  return authErrorMessages.some((msg) => errorMessage.includes(msg));
}

export function handleAuthError(error: any): boolean {
  if (isAuthError(error)) {
    console.log("Authentication error detected:", error.message);
    clearCorruptedAuthData();
    return true;
  }
  return false;
}
