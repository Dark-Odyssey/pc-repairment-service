import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const authHighlights = [
  {
    title: 'Kontrola nad zleceniami',
    description: 'Aktualizuj statusy napraw, diagnozy i terminy w jednym miejscu.',
  },
  {
    title: 'Szybki kontakt z klientem',
    description: 'Wysyłaj jasne informacje o postępie bez chaosu i zbędnych telefonów.',
  },
  {
    title: 'Historia serwisowa',
    description: 'Miej pod ręką pełny przebieg każdej naprawy oraz dane urządzeń.',
  },
];

const authStats = [
  { value: '24/7', label: 'dostęp do panelu' },
  { value: '1 panel', label: 'cały proces napraw' },
];

export default function AuthShowcase({
  title,
  intro,
  backTo = '/',
  backLabel = 'Wróć na stronę główną',
}) {
  return (
    <section className="auth-showcase">
      <div className="auth-brand">
        <img src={logo} alt="RepairFlow logo" className="auth-logo" />
        <span>RepairFlow</span>
      </div>

      <Link to={backTo} className="auth-back-link">
        {backLabel}
      </Link>

      <h1>{title}</h1>
      <p className="auth-intro">{intro}</p>

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
  );
}
