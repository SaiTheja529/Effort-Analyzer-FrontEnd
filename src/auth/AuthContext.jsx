import { createContext, useContext, useEffect, useState } from "react";
import { clearToken, getStoredUser, getToken, setToken, storeUser } from "./token";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState("");
  const [user, setUserState] = useState(null);

  useEffect(() => {
    setTokenState(getToken());
    setUserState(getStoredUser());
  }, []);

  const login = (newToken, userData) => {
    setToken(newToken);
    storeUser(userData);
    setTokenState(newToken);
    setUserState(userData);
  };

  const logout = () => {
    clearToken();
    setTokenState("");
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
