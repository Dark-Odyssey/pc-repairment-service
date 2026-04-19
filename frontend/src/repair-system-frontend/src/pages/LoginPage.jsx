import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const authHighlights = [
  {
    title: "Kontrola nad zleceniami",
    description: "Aktualizuj statusy napraw, diagnozy i terminy w jednym miejscu.",
  },
  {
    title: "Szybki kontakt z klientem",
    description: "Wysyłaj jasne informacje o postępie bez chaosu i zbędnych telefonów.",
  },
  {
    title: "Historia serwisowa",
    description: "Miej pod ręką pełny przebieg każdej naprawy oraz dane urządzeń.",
  },
];

const authStats = [
  { value: "24/7", label: "dostęp do panelu" },
  { value: "1 panel", label: "cały proces napraw" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("idle");
  const [loginError, setLoginError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setLoginError("Wypełnij wszystkie pola.");
      return;
    }
    
    setLoginStatus("loading");
    setLoginError("");

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Nieprawidłowy adres e-mail lub hasło.");
      }

      const data = await response.json();
      
      const userResponse = await fetch('/api/v1/user/', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error("Nie udało się pobrać danych użytkownika.");
      }
      
      const userData = await userResponse.json();
      login(data.token, userData);
      setLoginStatus("success");
      
      if (userData.role === "admin") {
        navigate("/dashboard/admin");
      } else if (userData.role === "worker") {
        navigate("/dashboard/worker");
      } else {
        navigate("/");
      }
    } catch (err) {
      setLoginError(err.message);
      setLoginStatus("error");
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className="auth-shell">
          <section className="auth-showcase">
            <div className="auth-brand">
              <img src={logo} alt="RepairFlow logo" className="auth-logo" />
              <span>RepairFlow</span>
            </div>

            <Link to="/" className="auth-back-link">
              Wróć na stronę główną
            </Link>

            <h1>Zaloguj się do centrum obsługi napraw</h1>
            <p className="auth-intro">
              Zarządzaj zleceniami z jednego przejrzystego miejsca.
            </p>

            <div className="auth-stats">
              {authStats.map((item) => (
                <div className="auth-stat" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="auth-highlights">
              {authHighlights.map((item) => (
                <article className="auth-highlight" key={item.title}>
                  <span className="auth-highlight-mark"></span>
                  <div>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="auth-form-panel">
            <div className="auth-form-card">
              <h2>Witamy ponownie</h2>
              <p className="auth-form-copy">
                Użyj adresu e-mail, aby przejść do panelu serwisowego.
              </p>

              <form className="auth-form" onSubmit={handleLogin}>
                {loginError && <div className="search-error" style={{marginTop: 0, marginBottom: '14px'}}>{loginError}</div>}
                {loginStatus === 'success' && <div className="search-result" style={{marginTop: 0, marginBottom: '14px', padding: '16px', color: 'green', borderColor: 'green'}}>Zalogowano pomyślnie! Trwa przekierowywanie...</div>}
                
                <label className="auth-field">
                  <span>Adres e-mail</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="serwis@repairflow.pl"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span>Hasło</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Wpisz swoje hasło"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>

                <div className="auth-form-row">
                  <label className="auth-checkbox">
                    <input type="checkbox" name="remember" />
                    <span>Pamiętaj mnie</span>
                  </label>

                  <a href="#">
                    Potrzebujesz pomocy?
                  </a>
                </div>

                <button type="submit" className="btn auth-submit-btn" disabled={loginStatus === 'loading' || loginStatus === 'success'}>
                  {loginStatus === 'loading' ? 'Logowanie...' : 'Zaloguj do panelu'}
                </button>
              </form>

              <div className="auth-divider">
                <span>lub</span>
              </div>

              <Link to="/" className="auth-secondary-btn">
                Wróć do strony głównej
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
