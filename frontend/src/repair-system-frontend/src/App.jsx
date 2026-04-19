import { useEffect, useState } from "react";
import "./App.css";
import logo from "./assets/logo.png";
import LoginPage from "./LoginPage";

const features = [
  {
    number: "01",
    title: "Szybka obsługa",
    description:
      "Sprawna rejestracja zgłoszeń i szybka diagnoza pozwalają ograniczyć czas oczekiwania na rozpoczęcie naprawy.",
  },
  {
    number: "02",
    title: "Śledzenie statusu naprawy",
    description:
      "Klient może w każdej chwili sprawdzić, na jakim etapie znajduje się urządzenie i co dzieje się z naprawą.",
  },
  {
    number: "03",
    title: "Przejrzysta komunikacja",
    description:
      "Jasne informacje o postępie, kosztach i terminach sprawiają, że cały proces jest prosty i zrozumiały.",
  },
  {
    number: "04",
    title: "Wygodny odbiór sprzętu",
    description:
      "Po zakończeniu naprawy klient otrzymuje wiadomość i od razu wie, kiedy może odebrać gotowe urządzenie.",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Oddaj sprzęt",
    description:
      "Przekaż urządzenie do serwisu i poczekaj na ocenę uszkodzenia. Technik sprawdzi stan sprzętu i określi zakres naprawy.",
  },
  {
    number: "02",
    title: "Otrzymaj dane do śledzenia",
    description:
      "Po przyjęciu zlecenia dostaniesz dane do śledzenia naprawy, aby na bieżąco sprawdzać postęp online.",
  },
  {
    number: "03",
    title: "Odbierz gotowy sprzęt",
    description:
      "Gdy naprawa zostanie zakończona, otrzymasz wiadomość o możliwości odbioru gotowego, naprawionego urządzenia.",
  },
];

const testimonialSlides = [
  [
    {
      title: "Szybka i konkretna obsługa",
      quote:
        "Laptop został przyjęty bardzo sprawnie, a już tego samego dnia dostałam informację o diagnozie i kolejnych krokach.",
      name: "Anna Kowalska",
      role: "Właścicielka sklepu internetowego",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      title: "Wygodne śledzenie naprawy",
      quote:
        "Najbardziej doceniam to, że mogłem na bieżąco sprawdzać status naprawy online, bez dzwonienia i dopytywania o szczegóły.",
      name: "Michał Nowak",
      role: "Grafik freelancer",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      title: "Bezproblemowy odbiór sprzętu",
      quote:
        "Kiedy urządzenie było gotowe, od razu dostałam wiadomość. Cały proces przebiegł spokojnie, jasno i bardzo profesjonalnie.",
      name: "Katarzyna Zielińska",
      role: "Specjalistka ds. administracji",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
  ],
  [
    {
      title: "Diagnoza bez zbędnego czekania",
      quote:
        "Bardzo doceniam szybki kontakt po oddaniu sprzętu. Od razu wiedziałem, co wymaga naprawy i jaki będzie następny krok.",
      name: "Paweł Krawczyk",
      role: "Właściciel małej firmy",
      image: "https://randomuser.me/api/portraits/men/71.jpg",
    },
    {
      title: "Wszystko było jasno opisane",
      quote:
        "Status naprawy, przewidywany termin i kontakt z serwisem były naprawdę przejrzyste. Nie musiałam niczego zgadywać.",
      name: "Natalia Wójcik",
      role: "Koordynatorka biura",
      image: "https://randomuser.me/api/portraits/women/21.jpg",
    },
    {
      title: "Bardzo wygodny system",
      quote:
        "Cały proces od oddania laptopa do odbioru był uporządkowany i wygodny. To oszczędza czas zarówno klientowi, jak i serwisowi.",
      name: "Tomasz Lewandowski",
      role: "Programista",
      image: "https://randomuser.me/api/portraits/men/54.jpg",
    },
  ],
  [
    {
      title: "Spokojna i szybka komunikacja",
      quote:
        "Za każdym razem wiedziałam, co dzieje się ze sprzętem. Informacje przychodziły na czas i były napisane bardzo jasno.",
      name: "Monika Szymańska",
      role: "Specjalistka HR",
      image: "https://randomuser.me/api/portraits/women/57.jpg",
    },
    {
      title: "Bardzo profesjonalne podejście",
      quote:
        "Serwis działa sprawnie, a system napraw naprawdę pomaga uporządkować cały proces. Wszystko wygląda nowocześnie i konkretnie.",
      name: "Jakub Dąbrowski",
      role: "Analityk biznesowy",
      image: "https://randomuser.me/api/portraits/men/18.jpg",
    },
    {
      title: "Klient od razu czuje różnicę",
      quote:
        "Największy plus to poczucie kontroli nad naprawą. Możliwość śledzenia statusu i szybkie powiadomienia robią świetne wrażenie.",
      name: "Ewa Mazur",
      role: "Kierowniczka administracji",
      image: "https://randomuser.me/api/portraits/women/12.jpg",
    },
  ],
];

const footerNavigation = [
  { label: "Start", href: "#home" },
  { label: "Jak działa", href: "#how" },
  { label: "Nasze zalety", href: "#features" },
  { label: "Opinie", href: "#testimonials" },
];

const footerServices = [
  "Diagnoza sprzętu",
  "Naprawa laptopów",
  "Naprawa komputerów PC",
  "Czyszczenie i konserwacja",
  "Śledzenie statusu napraw",
];

const footerSocials = [
  { label: "Facebook", href: "https://www.facebook.com/", external: true },
  { label: "Instagram", href: "https://www.instagram.com/", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/", external: true },
];

function getScreenFromHash() {
  if (typeof window === "undefined") {
    return "landing";
  }

  return window.location.hash === "#login" ? "login" : "landing";
}

function App() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [screen, setScreen] = useState(getScreenFromHash);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncScreenWithHash = () => {
      setScreen(getScreenFromHash());
    };

    syncScreenWithHash();
    window.addEventListener("hashchange", syncScreenWithHash);

    return () => window.removeEventListener("hashchange", syncScreenWithHash);
  }, []);

  const openLoginPage = () => {
    if (typeof window !== "undefined") {
      window.location.hash = "login";
    }
  };

  const openSection = (targetId) => (event) => {
    event.preventDefault();

    if (typeof window === "undefined") {
      return;
    }

    window.location.hash = targetId;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const target = document.getElementById(targetId);

        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  };

  if (screen === "login") {
    return <LoginPage onHelpClick={openSection("contact")} />;
  }

  return (
    <div>
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-banner">
            <img
              src="https://laptel.pl/images/komputer.jpg"
              alt="Serwisant komputerowy"
              className="hero-bg"
            />

            <div className="hero-overlay"></div>

            <header className="hero-navbar">
              <div className="hero-navbar-inner">
                <div className="logo">
                  <img src={logo} alt="RepairFlow logo" className="logo-image" />
                </div>

                <nav className="nav-links">
                  <a href="#home">Start</a>
                  <a href="#how">Jak działa</a>
                  <a href="#features">Nasze zalety</a>
                  <a href="#contact">Kontakt</a>
                </nav>

                <button type="button" className="btn btn-primary" onClick={openLoginPage}>
                  Zaloguj się
                </button>
              </div>
            </header>

            <div className="hero-card">
              <h1>Błyskawiczna naprawa Twojego sprzętu komputerowego</h1>
              <p className="hero-description">
                Przywracamy laptopy i komputery do życia – szybko, skutecznie i bez ukrytych kosztów. 
                Oddaj urządzenie w ręce ekspertów i na bieżąco sprawdzaj status swojej naprawy online.
              </p>

              <div className="hero-buttons">
                <button type="button" className="btn btn-primary" onClick={openLoginPage}>
                  Sprawdź status naprawy
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="order-search" id="search">
        <div className="container">
          <div className="search-shell">
            <h2>Sprawdź status swojej naprawy</h2>
            <p>Wpisz numer zamówienia, aby sprawdzić na jakim etapie jest Twoje urządzenie.</p>
            <form className="search-form" onSubmit={(e) => { e.preventDefault(); }}>
              <input type="text" placeholder="Np. REP-2026-04-19" className="search-input" />
              <button type="submit" className="btn btn-primary search-btn">Szukaj</button>
            </form>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how">
        <div className="container">
          <div className="how-shell">
            <div className="section-header how-header">
              <p className="section-label dark-label">Jak to działa</p>
              <h2>Prosty proces naprawy od przyjęcia sprzętu do odbioru</h2>
              <p className="how-lead">
                Klient zawsze wie, na jakim etapie jest urządzenie. System porządkuje
                cały przebieg naprawy i ułatwia komunikację z serwisem.
              </p>
            </div>

            <div className="how-grid">
              {workflowSteps.map((step) => (
                <article className="how-card" key={step.number}>
                  <div className="how-step-meta">
                    <div className="how-step-icon">{step.number}</div>
                    <span className="how-step-label">Etap {step.number}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <div className="features-shell">
            <div className="section-header features-header">
              <div className="features-copy">
                <p className="section-label dark-label">Nasze zalety</p>
                <h2>Dlaczego warto wybrać nasz system napraw</h2>
              </div>

              <p className="features-lead">
                Łączymy szybką obsługę, wygodne śledzenie statusu naprawy i jasną
                komunikację z klientem, aby cały proces był prosty i bezproblemowy.
              </p>
            </div>

            <div className="features-grid">
              {features.map((feature) => (
                <article className="feature-card" key={feature.title}>
                  <div className="feature-card-top">
                    <span className="feature-number">{feature.number}</span>
                  </div>

                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="testimonials-shell">
            <div className="section-header testimonials-header">
              <p className="section-label dark-label">Opinie klientów</p>
              <h2>Zadowolenie klientów jest dla nas priorytetem</h2>
              <p className="testimonials-lead">
                Klienci cenią nas za szybką obsługę, czytelne informacje o naprawie i
                spokojny, wygodny proces od oddania sprzętu do odbioru.
              </p>
            </div>

            <div className="testimonials-stage">
              <div className="testimonials-grid" key={activeSlide}>
                {testimonialSlides[activeSlide].map((testimonial) => (
                  <article className="testimonial-card" key={testimonial.name}>
                    <div className="testimonial-mark">"</div>
                    <h3>{testimonial.title}</h3>
                    <p>{testimonial.quote}</p>

                    <div className="testimonial-footer">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="testimonial-avatar"
                      />
                      <div className="testimonial-meta">
                        <strong>{testimonial.name}</strong>
                        <span>{testimonial.role}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="testimonials-dots" aria-label="Nawigacja opinii">
              {testimonialSlides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === activeSlide ? "testimonial-dot active" : "testimonial-dot"}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Pokaż zestaw opinii ${index + 1}`}
                  aria-pressed={index === activeSlide}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-shell">
            <div className="cta-pattern" aria-hidden="true"></div>

            <div className="cta-copy">
              <p className="cta-eyebrow">Szybkie wsparcie IT</p>
              <h2>Twój zaufany serwis komputerowy jest zawsze o krok od pomocy</h2>
              <p>
                Oddaj sprzęt do diagnozy, śledź status naprawy online i odbierz gotowe
                urządzenie bez chaosu i zbędnych telefonów.
              </p>

              <div className="cta-actions">
                <a href="#how" className="btn cta-btn-light">
                  Zobacz jak to działa
                </a>
                <a href="#login" className="btn cta-btn-outline">
                  Zaloguj się
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <div className="container">
          <div className="footer-shell">
            <div className="footer-top">
              <div className="footer-brand">
                <div className="footer-brand-mark">
                  <img src={logo} alt="RepairFlow logo" className="footer-logo" />
                  <span>RepairFlow</span>
                </div>
                <p>
                  System napraw, który porządkuje przyjęcie sprzętu, śledzenie statusu i
                  kontakt z klientem w jednym miejscu.
                </p>
              </div>

              <div className="footer-column">
                <h3>Nawigacja</h3>
                <div className="footer-links">
                  {footerNavigation.map((item) => (
                    <a href={item.href} key={item.label}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="footer-column">
                <h3>Usługi</h3>
                <div className="footer-links">
                  {footerServices.map((service) => (
                    <span key={service}>{service}</span>
                  ))}
                </div>
              </div>

              <div className="footer-column footer-contact">
                <h3>Kontakt</h3>
                <div className="footer-links">
                  <span>ul. Serwisowa 24, 00-145 Warszawa</span>
                  <a href="mailto:kontakt@repairflow.pl">kontakt@repairflow.pl</a>
                  <a href="tel:+48225032040">+48 22 503 20 40</a>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <div className="footer-socials">
                {footerSocials.map((item) => (
                  <a
                    href={item.href}
                    key={item.label}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              <p>RepairFlow © 2026. Wszelkie prawa zastrzeżone.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
