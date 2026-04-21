import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const authHighlights = [
  {
    title: 'Kontrola nad zleceniami',
    description: 'Aktualizuj statusy napraw, diagnozy i terminy w jednym miejscu.',
  },
  {
    title: 'Szybki kontakt z klientem',
    description: 'Wysylaj jasne informacje o postepie bez chaosu i zbednych telefonow.',
  },
  {
    title: 'Historia serwisowa',
    description: 'Miej pod reka pelny przebieg kazdej naprawy oraz dane urzadzen.',
  },
];

const authStats = [
  { value: '24/7', label: 'dostep do panelu' },
  { value: '1 panel', label: 'caly proces napraw' },
];

export default function AuthShowcase({
  title,
  intro,
  backTo = '/',
  backLabel = 'Wroc na strone glowna',
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
