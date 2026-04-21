import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShowcase from '../components/AuthShowcase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      setStatus('error');
      setMessage('Wpisz adres e-mail.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(`/api/v1/auth/password-reset?email=${encodeURIComponent(email)}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Nie udało się wysłać linku do resetu hasła.');
      }

      setStatus('success');
      setMessage('Jeśli konto istnieje, link do resetu hasła został wysłany na podany adres e-mail.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Wystąpił błąd podczas wysyłania formularza.');
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className="auth-shell">
          <AuthShowcase
            title="Odzyskaj dostęp do swojego konta"
            intro="Podaj adres e-mail, a przygotujemy dalsze kroki do bezpiecznego ustawienia nowego hasła."
            backTo="/login"
            backLabel="Wróć do logowania"
          />

          <section className="auth-form-panel">
            <div className="auth-form-card">
              <p className="auth-form-eyebrow">Reset hasła</p>
              <h2>Odzyskanie hasła</h2>
              <p className="auth-form-copy">
                Wpisz adres e-mail przypisany do konta pracownika, administratora albo klienta.
              </p>

              <form className="auth-form" onSubmit={handleSubmit}>
                {message && (
                  <div
                    className={status === 'success' ? 'search-result' : 'search-error'}
                    style={status === 'success' ? { marginTop: 0, marginBottom: '14px', padding: '16px', color: 'green', borderColor: 'green' } : { marginTop: 0, marginBottom: '14px' }}
                  >
                    {message}
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

                <button type="submit" className="btn auth-submit-btn" disabled={status === 'loading' || status === 'success'}>
                  {status === 'loading' ? 'Wysyłanie...' : 'Wyślij link do resetu'}
                </button>
              </form>

              <div className="auth-divider">
                <span>lub</span>
              </div>

              <Link to="/login" className="auth-secondary-btn">
                Wróć do logowania
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
