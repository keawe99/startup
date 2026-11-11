// loginService.js

/**
 * Login step 1: check the username and password.
 * Resolves with { mfaRequired | mfaSetupRequired, challengeToken }. The login
 * cookie is only issued after the authenticator code step (see mfaPage.jsx).
 * Rejects with an Error whose message is safe to show to the user.
 */
export async function loginUser(formData) {
  let response;
  try {
    response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  } catch {
    throw new Error("Network error, check your connection and try again.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Incorrect username or password."
        : data.msg || "Login failed, try again.",
    );
  }
  return data;
}

/**
 * Logs out a user by sending a request to the backend API.
 * @returns {Promise<void>} - A promise that resolves when the logout is successful or rejects with an error.
 */
export async function logoutUser() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Logout failed");
    }
  } catch (error) {
    console.error("Logout service error:", error);
    throw new Error("Network error or server unavailable");
  }
}
