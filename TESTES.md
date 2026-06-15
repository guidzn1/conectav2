# Roteiro de Testes - Conecta SUS

Este roteiro detalha passo a passo como validar o sistema Conecta SUS, suas correções de segurança, o fluxo de agendamento, as restrições de perfis e a integridade de banco de dados no MongoDB.

---

## A) Preparação do Ambiente

### 1. Banco de Dados MongoDB
- Certifique-se de que a variável `MONGO_URI` no arquivo [backend/.env](file:///Users/emanueloliveirasantos/Desktop/conecta-sus/backend/.env) aponta para o banco `conectasus`.
- Exemplo de URI: `mongodb+srv://.../conectasus` ou `mongodb://localhost:27017/conectasus`.

### 2. Rodar o Backend
Abra um terminal na pasta do backend e execute:
```bash
cd backend
npm install
npm run dev
```

### 3. Rodar o Seeder (Popula o Banco)
Em um terminal separado na pasta do backend, popule o banco:
```bash
cd backend
npx ts-node src/seed.ts
```

### 4. Rodar o Frontend
Em outro terminal, acesse a pasta do frontend e execute:
```bash
cd frontend
npm install
npm run dev
```
Acesse o frontend em seu navegador pelo endereço: `http://localhost:3000`.

---

## Credenciais de Teste

| Perfil | Identificador / CPF | Senha |
| :--- | :--- | :--- |
| **Paciente** | `123.456.789-00` (ou `12345678900`) | `senha123` |
| **Médico** | `000.000.000-02` (ou `00000000002`) | `senha123` |
| **Admin** | `000.000.000-01` (ou `00000000001`) | `senha123` |
| **UBS** | `00.000.000/0001-00` (ou `00000000000100`) | `senha123` |

---

## Cenários de Teste

### B) Teste de Login, Perfis e Redirecionamentos

#### 1. Login do Paciente
- **Passo**: Acesse `http://localhost:3000/login`, preencha CPF (`12345678900`) e senha (`senha123`), clique em **Entrar**.
- **Resultado Esperado**: Redirecionamento automático para a Área do Paciente (`/dashboard`).
- **Bloqueio de Rota Manual**: Com o paciente logado, digite na barra de endereços: `http://localhost:3000/admin`.
- **Resultado Esperado**: Bloqueio de acesso imediato e redirecionamento de volta para `/dashboard`.

#### 2. Login do Médico
- **Passo**: Acesse `http://localhost:3000/medico/login`, insira CPF (`00000000002`) e senha (`senha123`), clique em **Entrar**.
- **Resultado Esperado**: Redirecionamento para a Área do Médico (`/medico`).
- **Bloqueio de Rota Manual**: Digite na barra de endereços: `http://localhost:3000/admin`.
- **Resultado Esperado**: Bloqueio de acesso imediato e redirecionamento para `/medico`.

#### 3. Login de Administrador/UBS
- **Passo**: Acesse `http://localhost:3000/medico/login`, insira CPF (`00000000001` para Admin ou `00000000000100` para UBS) e senha (`senha123`), clique em **Entrar**.
- **Resultado Esperado**: Redirecionamento automático para o Painel Administrativo (`/admin`).

---

### C) Teste de Cadastro de Médico

#### 1. Cadastro Público
- **Passo**: Acesse `http://localhost:3000/cadastro` (Cadastro de Paciente).
- **Resultado Esperado**: Não existe qualquer botão, link ou opção de "Cadastrar Médico".
- **Teste de API Pública**: Tente enviar uma requisição pública no backend tentando registrar um médico:
  ```bash
  curl -X POST http://localhost:4000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"nome": "Tentativa Invasor", "cpf": "99999999999", "email": "hacker@email.com", "senha": "senha", "tipoUsuario": "profissionalSaude"}'
  ```
- **Resultado Esperado**: Retorna status `400 Bad Request` com a mensagem: `"Apenas pacientes podem se cadastrar publicamente."`

#### 2. Cadastro por Administrador
- **Passo**: Logue como Admin, acesse `/admin/profissionais`, preencha o formulário e clique em **Cadastrar Profissional**.
- **Resultado Esperado**: O médico é cadastrado no banco, com sucesso, e redireciona para a home do painel.

---

### D) Teste de Horários do Médico e Disponibilidade

#### 1. Dia em que o Médico Não Atende (Sem Agenda Cadastrada)
- **Passo**: Logue como Paciente, acesse `/agendamento/especialidade`. Selecione "Clínico Geral", escolha a UBS, selecione a "Dra. Joana da Silva", escolha uma data na qual ela não atende (ex: selecione uma data mais distante ou limpe a agenda de testes para aquela data).
- **Resultado Esperado**: O sistema mostra a mensagem clara de erro: `"Médico não atende neste dia."`

#### 2. Horários Disponíveis, Reservados e Não Atendidos
No seletor de horários do agendamento do paciente:
- **Disponível**: Horários em verde/azul habilitados (ativos para clique).
- **Reservado**: Horários em vermelho desabilitados, exibindo `"Reservado"`.
- **Não Atende**: Horários em cinza desabilitados, exibindo `"Não atende"`.

---

### E) Teste de Agendamento e Duplicidade Atômica

#### 1. Agendamento Completo
- **Passo**: Paciente seleciona Especialidade -> UBS -> Profissional -> Data -> Horário Disponível -> Confirma.
- **Resultado Esperado**: Consulta criada, redireciona para tela de sucesso. O horário escolhido agora fica indisponível para novos agendamentos.

#### 2. Prevenção de Duplicidade (Garantia no Backend / Corrida de Concorrência)
- **Passo**: Faça o agendamento de uma consulta e obtenha o ID do médico, UBS, especialidade, data e hora. Tente agendar uma segunda pessoa no mesmo horário exato simulando a requisição com `curl`:
  ```bash
  # Tente reservar o mesmo horário que você acabou de agendar
  curl -X POST http://localhost:4000/api/agendamentos \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <TOKEN_DE_OUTRO_PACIENTE>" \
    -d '{
      "profissionalId": "<MESMO_ID_MEDICO>",
      "unidadeId": "<MESMO_ID_UBS>",
      "especialidadeId": "<MESMA_ESPECIALIDADE>",
      "data": "<MESMA_DATA>",
      "horario": "<MESMO_HORARIO>",
      "primeiraConsulta": true,
      "tipoVisita": "presencial"
    }'
  ```
- **Resultado Esperado**: O backend bloqueia a operação retornando status `409 Conflict` ou `400 Bad Request` com: `"Horário indisponível/reservado."`

---

### F) Teste da Área do Paciente

#### 1. Histórico e Agendamentos
- **Passo**: Acesse `/dashboard/historico` e `/dashboard`.
- **Resultado Esperado**: As telas carregam perfeitamente sem dar erro 404 e listam os agendamentos corretos.

#### 2. Botão Sair (Logout)
- **Passo**: Clique em **🚪 Sair da conta** (no rodapé da Sidebar do Paciente) ou **Sair** no menu superior.
- **Resultado Esperado**: Os dados de `localStorage`, `sessionStorage` e cookies são removidos e a tela é redirecionada para `/`.

---

### G) Teste da Área do Médico

- **Passo**: Faça login como Médico (`00000000002`), visualize as consultas. Tente acessar `/admin`.
- **Resultado Esperado**: O médico visualiza apenas seus horários e pacientes e é bloqueado de acessar a administração geral.

---

### H) Teste de Administração UBS/Admin

- **Passo**: Logue como Administrador, acesse `/admin/agendas`, altere os horários de um profissional, ative/desative determinados horários e clique em **Salvar Agenda**.
- **Resultado Esperado**: As novas configurações são salvas diretamente no MongoDB na collection `agendas`.
