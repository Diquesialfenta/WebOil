// Utility functions for handling authentication issues

export function clearCorruptedAuthData() {
  try {
    // Clear all possible Supabase auth keys from localStorage
    const keysToRemove = [
      "supabase.auth.token",
      "sb-fmriyqnwzeenkvlmukdk-auth-token",
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
