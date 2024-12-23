import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GlobalContext = createContext();

export const useGlobalContext = () => {
  return useContext(GlobalContext); // Fixed incorrect `globalContext` reference
};

const GlobalProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState(true);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          setIsLoggedIn(false);
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          "https://receipts-auth.vercel.app/auth/auth/user/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          await AsyncStorage.removeItem("token");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [authState]);

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        user,
        isLoading,
        setIsLoggedIn,
        setUser,
        authState,
        setAuthState
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;