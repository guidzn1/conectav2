import Image from "next/image";
import Link from "next/link";

const LINKS = {
  vacinacao: [
    { label: "Calendário de Vacinação", href: "#" },
    { label: "Calendário Técnico Nacional de Vacinação", href: "#" },
    { label: "Segurança das Vacinas", href: "#" },
    { label: "Vacinas para Grupos Especiais", href: "#" },
  ],
  acesso: [
    { label: "Institucional", href: "#" },
    { label: "Ações e Programas", href: "#" },
    { label: "Agenda de Autoridades", href: "#" },
    { label: "Auditorias", href: "#" },
  ],
  sobre: [
    { label: "Quem somos", href: "#" },
    { label: "Termos de uso", href: "#" },
    { label: "Política de privacidade", href: "#" },
  ],
  ajuda: [
    { label: "Dúvidas frequentes (FAQ)", href: "#" },
    { label: "Suporte técnico", href: "#" },
    { label: "Contato", href: "#" },
  ],
  rapidos: [
    { label: "Área do médico", href: "/medico/login" },
    { label: "Cadastre-se", href: "/cadastro" },
    { label: "Conecta SUS", href: "/" },
  ],
};

export function Footer() {
  return (
    <footer
      className="bg-white text-neutral-700 border-t border-neutral-200"
      role="contentinfo"
    >
      <div className="container-app py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 items-start">
          <div className="flex items-start">
            <Image
              src="/images/logovertical.png"
              alt="Conecta SUS+"
              width={120}
              height={150}
              className="object-contain"
            />
          </div>

          <FooterCol title="Vacinação" links={LINKS.vacinacao} />
          <FooterCol title="Acesso à Informação" links={LINKS.acesso} />
          <FooterCol title="Sobre" links={LINKS.sobre} />
          <FooterCol title="Ajuda" links={LINKS.ajuda} />
          <FooterCol title="Acessos Rápidos" links={LINKS.rapidos} />
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <nav aria-labelledby={`footer-${title}`}>
      <h3
        id={`footer-${title}`}
        className="text-[10px] font-bold uppercase tracking-normal text-neutral-700 mb-5"
      >
        {title}
      </h3>

      <ul className="flex flex-col gap-4">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-[12px] leading-tight text-brand-700 hover:text-brand-800 no-underline"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}