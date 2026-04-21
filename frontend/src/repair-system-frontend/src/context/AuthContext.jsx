import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const performRefreshToken = async () => {
    const csrf = getCookie('x_csrf_token');
    if (!csrf) return null;
    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'X_CSRF_TOKEN': csrf
        }
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        return data.token;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      let currentToken = token;
      if (!currentToken) {
        currentToken = await performRefreshToken();
      }
      if (currentToken) {
        try {
          const response = await fetch('/api/v1/user/', {
            headers: {
              'Authorization': `Bearer ${currentToken}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (isMounted) setUser(data);
          } else {
            if (isMounted) {
              setToken(null);
              setUser(null);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      }
      if (isMounted) setLoading(false);
    };
    initAuth();
    return () => { isMounted = false; };
  }, []);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    const csrf = getCookie('x_csrf_token');
    fetch('/api/v1/auth/logout', { 
      method: 'POST',
      headers: {
        'X_CSRF_TOKEN': csrf || ''
      }
    }).catch(() => {});
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
