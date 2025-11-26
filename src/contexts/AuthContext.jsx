import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("authToken");
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("authToken", "mock-token-" + Date.now());
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = (emailOrPhone, password) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Find user by email or phone
    const foundUser = users.find(
      (u) =>
        (u.email === emailOrPhone || u.phone === emailOrPhone) &&
        u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    }

    return {
      success: false,
      message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    };
  };

  const signup = (userData) => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if email or phone already exists
    const existingUser = users.find(
      (u) => u.email === userData.email || u.phone === userData.phone
    );

    if (existingUser) {
      return {
        success: false,
        message:
          existingUser.email === userData.email
            ? "البريد الإلكتروني مستخدم بالفعل"
            : "رقم الجوال مستخدم بالفعل",
      };
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString(),
    };

    // Save user
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Don't auto login - user needs to log in manually
    return { success: true, email: newUser.email };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Optionally clear remembered email on logout
    // Uncomment if you want to clear it:
    // localStorage.removeItem("rememberedEmail");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
