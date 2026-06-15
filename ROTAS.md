# Rotas do Conecta SUS

Este documento lista todas as rotas de frontend (telas) e backend (API), os perfis de acesso permitidos e os tokens requeridos.

## 1. Rotas do Frontend (Next.js)

### Rotas Públicas
- `/` - Página Inicial (Apresentação institucional).
- `/login` - Login do Paciente (Autenticação com CPF e senha).
- `/cadastro` - Cadastro público de Pacientes.
- `/medico/login` - Login do Médico e do Administrador/UBS.

### Área do Paciente (Apenas perfil `paciente`)
- `/dashboard` - Painel do Paciente (Lista agendamentos futuros).
- `/dashboard/historico` - Histórico de consultas passadas/canceladas.
- `/dashboard/perfil` - Dados do perfil do paciente.
- `/agendamento` - Redirecionamento automático.
- `/agendamento/especialidade` - Wizard Passo 1: Seleção de especialidade.
- `/agendamento/unidade` - Wizard Passo 2: Seleção de unidade de saúde.
- `/agendamento/medico` - Wizard Passo 3: Seleção de profissional de saúde.
- `/agendamento/horario` - Wizard Passo 4: Escolha de data e horário.
- `/agendamento/confirmacao` - Wizard Passo 5: Confirmação e agendamento.

### Área do Médico (Apenas perfil `profissionalSaude`)
- `/medico` - Agenda de consultas do médico.
- `/medico/pacientes` - Visualização de pacientes agendados. (Utiliza a mesma base e redirecionamentos).
- `/medico/perfil` - Perfil básico do profissional de saúde.

### Área Administrativa (Perfis `administrador` e `ubs`)
- `/admin` - Painel de controle e estatísticas rápidas.
- `/admin/unidades` - Gestão/Cadastro de Unidades de Saúde (UBS).
- `/admin/especialidades` - Gestão/Cadastro de Especialidades Médicas.
- `/admin/profissionais` - Cadastro de novos profissionais (médicos).
- `/admin/agendas` - Cadastro e organização de grades de horários.

---

## 2. Endpoints da API (Node.js/Express)

Todas as rotas de API possuem prefixo `/api`.

| Endpoint | Método | Descrição | Token? | Perfis Permitidos |
| :--- | :--- | :--- | :--- | :--- |
| `/auth/register` | `POST` | Cadastro de paciente | Não | Todos (Apenas `paciente` permitido publicamente) |
| `/auth/login` | `POST` | Autenticação no sistema | Não | Todos |
| `/auth/me` | `GET` | Recuperar dados do usuário atual | Sim | Todos |
| `/especialidades` | `GET` | Listar todas as especialidades | Não | Todos |
| `/especialidades` | `POST` | Cadastrar nova especialidade | Sim | `administrador`, `ubs` |
| `/especialidades/:id` | `DELETE` | Remover especialidade | Sim | `administrador`, `ubs` |
| `/unidades` | `GET` | Listar unidades (filtro especialidade) | Não | Todos |
| `/unidades/:id` | `GET` | Detalhes de uma unidade de saúde | Não | Todos |
| `/unidades` | `POST` | Cadastrar unidade de saúde | Sim | `administrador`, `ubs` |
| `/unidades/:id` | `PUT` | Atualizar unidade de saúde | Sim | `administrador`, `ubs` |
| `/unidades/:id` | `DELETE` | Remover unidade de saúde | Sim | `administrador`, `ubs` |
| `/profissionais` | `GET` | Listar profissionais de saúde | Não | Todos |
| `/profissionais/:id` | `GET` | Detalhes de um profissional | Não | Todos |
| `/profissionais` | `POST` | Cadastrar novo profissional (médico) | Sim | `administrador`, `ubs` |
| `/agendas` | `GET` | Listar agendas de atendimento | Sim | Todos |
| `/agendas/horarios`| `GET` | Obter horários livres do médico | Sim | Todos |
| `/agendas` | `POST` | Cadastrar/Organizar grade de horários | Sim | `administrador`, `ubs` |
| `/agendas/:id` | `PUT` | Atualizar grade de horários | Sim | `administrador`, `ubs` |
| `/agendamentos` | `GET` | Listar consultas do usuário logado | Sim | Todos |
| `/agendamentos` | `POST` | Criar um novo agendamento de consulta | Sim | `paciente` |
| `/agendamentos/:id/cancelar` | `PATCH` | Cancelar uma consulta agendada | Sim | Todos |
| `/admin/stats` | `GET` | Estatísticas rápidas do dashboard | Sim | `administrador`, `ubs` |

---

## 3. Como testar Endpoints da API via cURL

### A) Login de Paciente
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cpf": "12345678900", "senha": "senha123"}'
```

### B) Criar Agendamento (Requer Token do Paciente no Header)
```bash
curl -X POST http://localhost:4000/api/agendamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SEU_TOKEN_AQUI>" \
  -d '{
    "profissionalId": "<ID_MEDICO>",
    "unidadeId": "<ID_UBS>",
    "especialidadeId": "<ID_ESPECIALIDADE>",
    "data": "2026-05-28",
    "horario": "09:00",
    "primeiraConsulta": true,
    "tipoVisita": "presencial"
  }'
```

### C) Cancelar Agendamento
```bash
curl -X PATCH http://localhost:4000/api/agendamentos/<ID_AGENDAMENTO>/cancelar \
  -H "Authorization: Bearer <SEU_TOKEN_AQUI>"
```
