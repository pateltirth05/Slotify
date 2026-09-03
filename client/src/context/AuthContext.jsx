import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import api from "../services/api.js";
import { loginUser } from "../services/authService.js";

const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // Restore logged-in user when the application starts
  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/users/me");

        setUser(response.data.user);
      } catch (error) {
        console.error("Restore user error:", error);

        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);


  const login = async (credentials) => {
    const data = await loginUser(credentials);

    localStorage.setItem("token", data.token);

    setUser(data.user);

    return data;
  };


  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};