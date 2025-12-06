import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";

/**
 * Authentication Context
 *
 * Manages user authentication state and provides authentication methods.
 * All authentication operations use the real API endpoints.
 */

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Load user from localStorage on initialization
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Check if user is authenticated based on token presence
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("authToken");
  });

  // Loading state for async operations
  const [loading, setLoading] = useState(false);

  /**
   * Fetch user profile from API
   * Called when component mounts if token exists
   */
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (token && !user) {
        try {
          setLoading(true);
          const response = await apiService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            // Token might be invalid, clear it
            localStorage.removeItem("authToken");
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, []);

  /**
   * Login user
   * POST /auth/login
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Object} - { success: boolean, message: string, user?: Object }
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiService.login(email, password);

      if (response.success) {
        // apiService.login already stored token and user in localStorage
        // Extract user data from response or load from localStorage
        let userData = null;

        // Try to get user from response data
        if (response.data?.user) {
          userData = response.data.user;
        } else if (response.data && response.data.id && !response.data.token) {
          // If response.data is the user object itself (without token property)
          userData = response.data;
        }

        // Fallback: load from localStorage (apiService already stored it)
        if (!userData) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              userData = JSON.parse(storedUser);
            } catch (e) {
              console.error("Error parsing stored user:", e);
            }
          }
        }

        // Update state with user data
        if (userData) {
          setUser(userData);
        }

        // Verify token is stored and set authenticated state
        const token = localStorage.getItem("authToken");
        if (token) {
          setIsAuthenticated(true);
        }

        return {
          success: true,
          user: userData,
          message: response.message || "Login successful",
        };
      } else {
        return {
          success: false,
          message: response.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "An error occurred during login. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   * POST /auth/register
   * @param {Object} userData - User registration data
   * @returns {Object} - { success: boolean, message: string, email?: string }
   */
  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.register(userData);

      if (response.success) {
        // Registration successful, but user needs to verify
        return {
          success: true,
          email: userData.email,
          message:
            response.message ||
            "Registration successful. Please verify your email.",
        };
      } else {
        return {
          success: false,
          message: response.message || "Registration failed",
          errors: response.errors || {},
        };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: "An error occurred during registration. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify phone/email with OTP
   * POST /auth/verify
   * @param {string} email - User's email
   * @param {string} code - Verification code
   * @returns {Object} - { success: boolean, message: string, user?: Object }
   */
  const verifyPhone = async (email, code) => {
    try {
      setLoading(true);
      const response = await apiService.verifyPhone(email, code);

      if (response.success) {
        // Store user data if provided
        const userData = response.data?.user || response.data;
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
        return {
          success: true,
          user: userData,
          message: response.message || "Verification successful",
        };
      } else {
        return {
          success: false,
          message: response.message || "Verification failed",
        };
      }
    } catch (error) {
      console.error("Verification error:", error);
      return {
        success: false,
        message: "An error occurred during verification. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   * POST /auth/logout
   */
  const logout = async () => {
    try {
      setLoading(true);
      // Call API logout endpoint
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local state regardless of API response
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setLoading(false);
    }
  };

  /**
   * Update user profile
   * POST /auth/edit-profile
   * @param {Object} profileData - Profile update data
   * @returns {Object} - { success: boolean, message: string, user?: Object }
   */
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await apiService.updateProfile(profileData);

      if (response.success) {
        const userData = response.data;
        setUser(userData);
        return {
          success: true,
          user: userData,
          message: response.message || "Profile updated successfully",
        };
      } else {
        return {
          success: false,
          message: response.message || "Failed to update profile",
          errors: response.errors || {},
        };
      }
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        message: "An error occurred while updating profile. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change user password
   * POST /auth/change-password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Password confirmation
   * @returns {Object} - { success: boolean, message: string }
   */
  const changePassword = async (
    currentPassword,
    newPassword,
    confirmPassword
  ) => {
    try {
      setLoading(true);
      const response = await apiService.changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );

      return {
        success: response.success,
        message:
          response.message ||
          (response.success
            ? "Password changed successfully"
            : "Failed to change password"),
        errors: response.errors || {},
      };
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        message: "An error occurred while changing password. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send password reset OTP
   * POST /auth/reset-password/send-otp
   * @param {string} email - User's email
   * @returns {Object} - { success: boolean, message: string }
   */
  const sendResetOTP = async (email) => {
    try {
      setLoading(true);
      const response = await apiService.sendResetOTP(email);
      return {
        success: response.success,
        message:
          response.message ||
          (response.success ? "OTP sent successfully" : "Failed to send OTP"),
      };
    } catch (error) {
      console.error("Send reset OTP error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify password reset OTP
   * POST /auth/reset-password/verify-otp
   * @param {string} email - User's email
   * @param {string} code - OTP code
   * @returns {Object} - { success: boolean, message: string, resetToken?: string }
   */
  const verifyResetOTP = async (email, code) => {
    try {
      setLoading(true);
      const response = await apiService.verifyResetOTP(email, code);

      if (response.success) {
        return {
          success: true,
          resetToken: response.data?.reset_token || response.data?.token,
          message: response.message || "OTP verified successfully",
        };
      } else {
        return {
          success: false,
          message: response.message || "OTP verification failed",
        };
      }
    } catch (error) {
      console.error("Verify reset OTP error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set new password after OTP verification
   * POST /auth/reset-password/set-new-password
   * @param {string} resetToken - Reset token from verify-otp
   * @param {string} password - New password
   * @param {string} passwordConfirmation - Password confirmation
   * @returns {Object} - { success: boolean, message: string }
   */
  const setNewPassword = async (resetToken, password, passwordConfirmation) => {
    try {
      setLoading(true);
      const response = await apiService.setNewPassword(
        resetToken,
        password,
        passwordConfirmation
      );

      return {
        success: response.success,
        message:
          response.message ||
          (response.success
            ? "Password reset successfully"
            : "Failed to reset password"),
        errors: response.errors || {},
      };
    } catch (error) {
      console.error("Set new password error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete user account
   * DELETE /auth/delete-account
   * @returns {Object} - { success: boolean, message: string }
   */
  const deleteAccount = async () => {
    try {
      setLoading(true);
      const response = await apiService.deleteAccount();

      if (response.success) {
        // Clear local state
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }

      return {
        success: response.success,
        message:
          response.message ||
          (response.success
            ? "Account deleted successfully"
            : "Failed to delete account"),
      };
    } catch (error) {
      console.error("Delete account error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        verifyPhone,
        logout,
        updateProfile,
        changePassword,
        sendResetOTP,
        verifyResetOTP,
        setNewPassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
