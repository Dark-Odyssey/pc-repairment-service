import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShowcase from '../components/AuthShowcase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState('idle');
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setLoginError('Wypelnij wszystkie pola.');
      return;
    }

    setLoginStatus('loading');
    setLoginError('');

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Nieprawidlowy adres e-mail lub haslo.');
      }

      const data = await response.json();

      const userResponse = await fetch('/api/v1/user/', {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Nie udalo sie pobrac danych uzytkownika.');
      }

      const userData = await userResponse.json();

      login(data.token, userData);
      setLoginStatus('success');

      if (userData.role === 'Admin') {
        navigate('/dashboard/admin');
      } else if (userData.role === 'Worker') {
        navigate('/dashboard/worker');
      } else {
        navigate('/status');
      }
    } catch (error) {
      setLoginError(error.message || 'Wystapil blad logowania.');
      setLoginStatus('error');
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className="auth-shell">
          <AuthShowcase
            title="Zaloguj sie do centrum obslugi napraw"
            intro="Zarzadzaj zleceniami z jednego przejrzystego miejsca."
          />

          <section className="auth-form-panel">
            <div className="auth-form-card">
              <h2>Witamy ponownie</h2>
              <p className="auth-form-copy">
                Uzyj adresu e-mail, aby przejsc do panelu serwisowego.
              </p>

              <form className="auth-form" onSubmit={handleLogin}>
                {loginError && (
                  <div className="search-error" style={{ marginTop: 0, marginBottom: '14px' }}>
                    {loginError}
                  </div>
                )}
                {loginStatus === 'success' && (
                  <div className="search-result" style={{ marginTop: 0, marginBottom: '14px', padding: '16px', color: 'green', borderColor: 'green' }}>
                    Zalogowano pomyslnie. Trwa przekierowywanie...
                  </div>
                )}

                <label className="auth-field">
                  <span>Adres e-mail</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="serwis@repairflow.pl"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span>Haslo</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Wpisz swoje haslo"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>

                <div className="auth-form-row">
                  <label className="auth-checkbox">
                    <input type="checkbox" name="remember" />
                    <span>Pamietaj mnie</span>
                  </label>

                  <Link to="/odzyskanie-hasla">
                    Nie pamietasz hasla?
                  </Link>
                </div>

                <button type="submit" className="btn auth-submit-btn" disabled={loginStatus === 'loading' || loginStatus === 'success'}>
                  {loginStatus === 'loading' ? 'Logowanie...' : 'Zaloguj do panelu'}
                </button>
              </form>

              <div className="auth-divider">
                <span>lub</span>
              </div>

              <Link to="/" className="auth-secondary-btn">
                Wroc do strony glownej
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
