import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <>
      <Header />

      <main id="main-content">
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-title"
          className="relative min-h-[500px] bg-white overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/hero-medico.png')",
            }}
            aria-hidden="true"
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 38%, rgba(255,255,255,0.55) 58%, rgba(255,255,255,0.08) 100%)",
            }}
            aria-hidden="true"
          />

          <div className="relative container-app min-h-[500px] flex items-center">
            <div className="max-w-[650px] pt-4">
              <h1
                id="hero-title"
                className="font-poppins text-[44px] sm:text-[56px] md:text-[64px] leading-[0.95] text-brand-700 mb-7"
              >
                <span className="font-extrabold">Agende com</span>
                <br />
                <span className="font-extrabold">antecedência</span>{" "}
                <span className="font-normal">e</span>
                <br />
                <span className="font-normal">sem sair de casa.</span>
              </h1>

              <Link href="/agendamento/especialidade">
                <Button
                  size="lg"
                  className="rounded-full px-8"
                  aria-label="Iniciar agendamento de consulta"
                >
                  Agendar Consulta
                </Button>
              </Link>
            </div>
          </div>
        </section>

{/* ── COMO FUNCIONA ─────────────────────────────────────── */}
<section
  aria-labelledby="como-funciona-title"
  className="bg-white pt-14 pb-20"
>
  <div className="container-app">
    <h2
      id="como-funciona-title"
      className="font-poppins text-[34px] font-normal text-center text-brand-800 mb-10"
    >
      Como <span className="font-extrabold">funciona?</span>
    </h2>

    <div className="max-w-[820px] mx-auto">
      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-0 items-start">
        {/* Linha horizontal */}
        <div
          className="hidden sm:block absolute top-[42px] left-[16.5%] right-[16.5%] h-[7px] bg-brand-800 rounded-full z-0"
          aria-hidden="true"
        />

        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <div className="h-[86px] flex items-center justify-center">
              <div
                className={`rounded-full bg-brand-700 text-white flex items-center justify-center shadow-card ${
                  index === 0
                    ? "w-[50px] h-[50px]"
                    : index === 1
                    ? "w-[66px] h-[66px]"
                    : "w-[76px] h-[76px]"
                }`}
              >
                {step.icon}
              </div>
            </div>

            <p className="text-[15px] leading-[1.05] text-brand-800 max-w-[210px]">
              {step.before}{" "}
              <span className="font-bold">{step.bold}</span>
              <br />
              {step.after}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

        {/* ── BENEFÍCIOS ────────────────────────────────────────── */}
        <section
          aria-labelledby="beneficios-title"
          className="bg-brand-800 py-12"
        >
          <h2 id="beneficios-title" className="visually-hidden">
            Benefícios do Conecta SUS
          </h2>

          <div className="container-app">
            <div className="max-w-[930px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-7">
              {BENEFITS.map(({ icon, title, description }) => (
                <article
                  key={title}
                  className="min-h-[205px] flex flex-col items-center justify-center text-center gap-3 border border-white/80 rounded-[8px] px-6 py-8"
                >
                  <div className="text-white">{icon}</div>

                  <h3 className="font-poppins text-[30px] leading-none font-extrabold text-white">
                    {title}
                  </h3>

                  <p className="text-white text-[15px] leading-[1.05] max-w-[170px]">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

const STEPS = [
  {
    title: "Login",
    before: "Faça seu",
    bold: "login",
    after: "no sistema",
    icon: <UserStepIcon />,
  },
  {
    title: "Escolha",
    before: "Escolha",
    bold: "especialidade,",
    after: "unidade e horário",
    icon: <CalendarStepIcon />,
  },
  {
    title: "Aguardar",
    before: "Agora é",
    bold: "só aguardar",
    after: "o dia da sua consulta!",
    icon: <CheckStepIcon />,
  },
];

const BENEFITS = [
  {
    title: "Agilidade",
    description: "Evite filas e economize tempo",
    icon: <ClockIcon />,
  },
  {
    title: "Comodidade",
    description: "Agende de qualquer lugar",
    icon: <HomeIcon />,
  },
  {
    title: "Segurança",
    description: "Dados protegidos com autenticação",
    icon: <ShieldIcon />,
  },
];

function UserStepIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Zm-7 8c.5-3.4 3.4-6 7-6s6.5 2.6 7 6H5Z" />
    </svg>
  );
}

function CalendarStepIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="M15.5 14.5a3.5 3.5 0 1 1-1.1-2.55" />
      <path d="M15.5 11.5v3h3" />
    </svg>
  );
}

function CheckStepIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.4">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16.5 9" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v7l5 3" />
      <path d="M3 12h3M18 12h3M12 3v3M12 18v3" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-20 h-20" fill="currentColor">
      <path d="M3 11.5 12 4l9 7.5-1.7 2L18 12.4V20h-5v-5h-2v5H6v-7.6l-1.3 1.1-1.7-2Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-20 h-20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3c2.4 2.2 5.2 3 8 3v5.5c0 5.1-3.2 8.2-8 10-4.8-1.8-8-4.9-8-10V6c2.8 0 5.6-.8 8-3Z" />
      <path d="m8.5 12 2.2 2.2 5-5" strokeWidth="2.2" />
    </svg>
  );
}