import logo from "./assets/logo.png";

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

function LoginPage({ onHelpClick }) {
  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className="auth-shell">
          <section className="auth-showcase">
            <div className="auth-brand">
              <img src={logo} alt="RepairFlow logo" className="auth-logo" />
              <span>RepairFlow</span>
            </div>

            <a href="#home" className="auth-back-link">
              Wróć na stronę główną
            </a>

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

              <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
                <label className="auth-field">
                  <span>Adres e-mail</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="serwis@repairflow.pl"
                    autoComplete="email"
                  />
                </label>

                <label className="auth-field">
                  <span>Hasło</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Wpisz swoje hasło"
                    autoComplete="current-password"
                  />
                </label>

                <div className="auth-form-row">
                  <label className="auth-checkbox">
                    <input type="checkbox" name="remember" />
                    <span>Pamiętaj mnie</span>
                  </label>

                  <a href="#contact" onClick={onHelpClick}>
                    Potrzebujesz pomocy?
                  </a>
                </div>

                <button type="submit" className="btn auth-submit-btn">
                  Zaloguj do panelu
                </button>
              </form>

              <div className="auth-divider">
                <span>lub</span>
              </div>

              <a href="#home" className="auth-secondary-btn">
                Wróć do strony głównej
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
