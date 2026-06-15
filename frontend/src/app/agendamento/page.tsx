"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/ui";

export default function AgendamentoRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/agendamento/especialidade");
  }, [router]);

  return <Loading text="Redirecionando..." />;
}
