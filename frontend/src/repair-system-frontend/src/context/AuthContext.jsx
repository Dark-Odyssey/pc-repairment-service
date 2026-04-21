import { createContext, useContext, useEffect, useRef, useState } from 'react';

const AuthContext = createContext();
const ACCESS_TOKEN_STORAGE_KEY = 'repairflow_access_token';
const CSRF_COOKIE_NAME = 'x_csrf_token';
const REFRESH_ENDPOINT = '/api/v1/auth/refresh';

export const useAuth = () => useContext(AuthContext);

function readCookieValue(name, source = document.cookie) {
  const value = `; ${source}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

async function readScopedCookie(name) {
  const directCookie = readCookieValue(name);
  if (directCookie) {
    return directCookie;
  }

  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    let settled = false;

    const finish = (value) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeoutId);
      iframe.remove();
      resolve(value);
    };

    const tryReadCookie = () => {
      try {
        const cookieString = iframe.contentWindow?.document?.cookie || '';
        finish(readCookieValue(name, cookieString));
      } catch {
        finish(null);
      }
    };

    const timeoutId = window.setTimeout(() => {
      tryReadCookie();
    }, 1500);

    iframe.style.display = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.onload = tryReadCookie;
    iframe.onerror = () => finish(null);
    iframe.src = `${REFRESH_ENDPOINT}?cookie_probe=${Date.now()}`;
    document.body.appendChild(iframe);
  });
}

function getStoredToken() {
  return window.sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

function setStoredToken(value) {
  if (value) {
    window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, value);
    return;
  }

  window.sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);
  const refreshPromiseRef = useRef(null);

  const clearAuthState = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  const performRefreshToken = async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      const csrf = await readScopedCookie(CSRF_COOKIE_NAME);
      if (!csrf) {
        return null;
      }

      try {
        const response = await fetch(REFRESH_ENDPOINT, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            X_CSRF_TOKEN: csrf,
          },
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        setStoredToken(data.token);
        setToken(data.token);
        return data.token;
      } catch (error) {
        console.error('Failed to refresh access token:', error);
        return null;
      }
    })().finally(() => {
      refreshPromiseRef.current = null;
    });

    return refreshPromiseRef.current;
  };

  const fetchCurrentUser = async (accessToken) => {
    const response = await fetch('/api/v1/user/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  };

  const authFetch = async (input, init = {}) => {
    let currentToken = token || getStoredToken();
    if (!currentToken) {
      currentToken = await performRefreshToken();
    }

    if (!currentToken) {
      clearAuthState();
      throw new Error('Not authenticated');
    }

    const sendRequest = async (accessToken) => {
      const headers = new Headers(init.headers || {});
      headers.set('Authorization', `Bearer ${accessToken}`);

      return fetch(input, {
        ...init,
        headers,
      });
    };

    let response = await sendRequest(currentToken);

    if (response.status === 401) {
      const refreshedToken = await performRefreshToken();
      if (!refreshedToken) {
        clearAuthState();
        return response;
      }

      response = await sendRequest(refreshedToken);
      if (response.status === 401) {
        clearAuthState();
      }
    }

    return response;
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      let currentToken = getStoredToken();
      if (!currentToken) {
        currentToken = await performRefreshToken();
      }

      if (currentToken) {
        try {
          let currentUser = await fetchCurrentUser(currentToken);

          if (!currentUser) {
            const refreshedToken = await performRefreshToken();
            if (refreshedToken) {
              currentUser = await fetchCurrentUser(refreshedToken);
            }
          }

          if (isMounted) {
            if (currentUser) {
              setUser(currentUser);
            } else {
              clearAuthState();
            }
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          if (isMounted) {
            clearAuthState();
          }
        }
      } else if (isMounted) {
        clearAuthState();
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (newToken, userData) => {
    setStoredToken(newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      const csrf = await readScopedCookie(CSRF_COOKIE_NAME);
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: csrf
          ? {
              X_CSRF_TOKEN: csrf,
            }
          : {},
      });
    } catch (error) {
      console.error('Failed to logout cleanly:', error);
    } finally {
      clearAuthState();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch, refreshAccessToken: performRefreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};
