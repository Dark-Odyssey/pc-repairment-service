import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthShowcase from '../components/AuthShowcase';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [retryPassword, setRetryPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setStatus('error');
      setMessage('Brakuje tokenu resetu hasla w adresie strony.');
      return;
    }

    if (!newPassword || !retryPassword) {
      setStatus('error');
      setMessage('Wypelnij oba pola hasla.');
      return;
    }

    if (newPassword !== retryPassword) {
      setStatus('error');
      setMessage('Hasla nie sa identyczne.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(`/api/v1/auth/new-password?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_password: newPassword,
          retry_password: retryPassword,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Nie udalo sie ustawic nowego hasla.';

        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            errorMessage = Array.isArray(errorData.detail)
              ? errorData.detail.map((item) => item.msg || 'Blad walidacji').join(', ')
              : errorData.detail;
          }
        } catch {
          // ignore malformed error payload
        }

        throw new Error(errorMessage);
      }

      setStatus('success');
      setMessage('Nowe haslo zostalo zapisane. Mozesz przejsc do logowania.');
      setNewPassword('');
      setRetryPassword('');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Wystapil blad podczas zapisu nowego hasla.');
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className="auth-shell">
          <AuthShowcase
            title="Ustaw nowe haslo i wroc do pracy"
            intro="Zadbaj o bezpieczny dostep do systemu i ustaw nowe haslo zgodne z wymaganiami aplikacji."
            backTo="/login"
            backLabel="Wroc do logowania"
          />

          <section className="auth-form-panel">
            <div className="auth-form-card">
              <p className="auth-form-eyebrow">Nowe haslo</p>
              <h2>Wprowadzenie nowego hasla</h2>
              <p className="auth-form-copy">
                Podaj nowe haslo i potwierdz je ponownie. Haslo powinno miec od 8 do 20 znakow.
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

                {!token && (
                  <div className="search-error" style={{ marginTop: 0, marginBottom: '14px' }}>
                    Ten link nie zawiera tokenu resetu hasla. Otworz poprawny link z wiadomosci e-mail.
                  </div>
                )}

                <label className="auth-field">
                  <span>Nowe haslo</span>
                  <input
                    type="password"
                    name="new-password"
                    placeholder="Wpisz nowe haslo"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span>Powtorz nowe haslo</span>
                  <input
                    type="password"
                    name="retry-password"
                    placeholder="Powtorz nowe haslo"
                    autoComplete="new-password"
                    value={retryPassword}
                    onChange={(event) => setRetryPassword(event.target.value)}
                  />
                </label>

                <button type="submit" className="btn auth-submit-btn" disabled={status === 'loading' || status === 'success' || !token}>
                  {status === 'loading' ? 'Zapisywanie...' : 'Zapisz nowe haslo'}
                </button>
              </form>

              <div className="auth-divider">
                <span>lub</span>
              </div>

              <Link to="/login" className="auth-secondary-btn">
                Wroc do logowania
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
