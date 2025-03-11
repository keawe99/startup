// loginService.js

/**
 * Sends a login request to the backend API.
 * @param {object} formData - The login form data (username/email, password).
 * @returns {Promise<object>} - A promise that resolves with the user data or rejects with an error.
 */
export async function loginUser(formData) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Login failed");
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Login service error:", error);
    throw new Error("Network error or server unavailable"); // More general error for user
  }
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
