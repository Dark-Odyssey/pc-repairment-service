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
      setMessage('Brakuje tokenu resetu hasła w adresie strony.');
      return;
    }

    if (!newPassword || !retryPassword) {
      setStatus('error');
      setMessage('Wypełnij oba pola hasła.');
      return;
    }

    if (newPassword !== retryPassword) {
      setStatus('error');
      setMessage('Hasła nie są identyczne.');
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
        let errorMessage = 'Nie udało się ustawić nowego hasła.';

        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            errorMessage = Array.isArray(errorData.detail)
              ? errorData.detail.map((item) => item.msg || 'Błąd walidacji').join(', ')
              : errorData.detail;
          }
        } catch {
          // ignore malformed error payload
        }

        throw new Error(errorMessage);
      }

      setStatus('success');
      setMessage('Nowe hasło zostało zapisane. Możesz przejść do logowania.');
      setNewPassword('');
      setRetryPassword('');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Wystąpił błąd podczas zapisu nowego hasła.');
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className="auth-shell">
          <AuthShowcase
            title="Ustaw nowe hasło i wróć do pracy"
            intro="Zadbaj o bezpieczny dostęp do systemu i ustaw nowe hasło zgodne z wymaganiami aplikacji."
            backTo="/login"
            backLabel="Wróć do logowania"
          />

          <section className="auth-form-panel">
            <div className="auth-form-card">
              <p className="auth-form-eyebrow">Nowe hasło</p>
              <h2>Wprowadzenie nowego hasła</h2>
              <p className="auth-form-copy">
                Podaj nowe hasło i potwierdź je ponownie. Hasło powinno mieć od 8 do 20 znaków.
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
                    Ten link nie zawiera tokenu resetu hasła. Otwórz poprawny link z wiadomości e-mail.
                  </div>
                )}

                <label className="auth-field">
                  <span>Nowe hasło</span>
                  <input
                    type="password"
                    name="new-password"
                    placeholder="Wpisz nowe hasło"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span>Powtórz nowe hasło</span>
                  <input
                    type="password"
                    name="retry-password"
                    placeholder="Powtórz nowe hasło"
                    autoComplete="new-password"
                    value={retryPassword}
                    onChange={(event) => setRetryPassword(event.target.value)}
                  />
                </label>

                <button type="submit" className="btn auth-submit-btn" disabled={status === 'loading' || status === 'success' || !token}>
                  {status === 'loading' ? 'Zapisywanie...' : 'Zapisz nowe hasło'}
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
