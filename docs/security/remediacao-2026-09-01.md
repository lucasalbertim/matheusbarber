# Remediação emergencial — Matheus Barber

**Data:** 2026-09-01 · **Branch:** `security/fix-critical-access-control`
**Escopo:** correções pontuais de segurança no sistema legado, enquanto o Zivko é construído.

Não é refatoração. Cada mudança é a menor alteração que fecha a falha sem quebrar um
fluxo em produção.

---

## O que foi corrigido

| Código | Falha | Correção | Impacto no uso |
|---|---|---|---|
| **CRIT-01** | `POST /api/admins/` público — qualquer visitante criava um administrador com acesso total | Passa a exigir `@require_admin` | Nenhum. Admins são criados pelo seed ou por outro admin |
| **CRIT-02** | Login de cliente só com telefone | Passa a exigir telefone **+ data de nascimento** | Clientes precisam informar a data ao entrar |
| **CRIT-03** | `GET/PUT /clients/<id>` e `/clients/<id>/attendances` públicos com ID sequencial — a base inteira era extraível | Exigem token do próprio cliente; recurso alheio responde **404** | Sessões antigas caem; um novo login resolve |
| **CRIT-04** | `POST /attendance/` aceitava qualquer `client_id`; `PUT /attendance/<id>/cancel` público; `/attendance/today` vazava PII | Token de cliente obrigatório, `client_id` vem do token, ownership verificado no cancelamento, e a agenda pública passa a omitir dados pessoais | Nenhum. A tela de fila do cliente só usava tipo, status e horário |
| **ALTA-01** | `SECRET_KEY` com default `"change-me"` | A aplicação recusa iniciar em produção sem chave forte | **Exige `SECRET_KEY` de 32+ caracteres no Render** |
| **ALTA-02** | Regex de CORS substituía a allowlist e não era ancorada | Passa a somar, e a regex ganha `$` | Nenhum |
| **ALTA-04** | Sem limite de tentativas de login | Rate limit em memória: 5/15min no admin, 10/15min no cliente | Nenhum |
| **MED-01** | Sem cabeçalhos de segurança | `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS | Nenhum |
| **MED-02** | Sem handler para 500 — devolvia HTML e podia revelar nomes de tabela | Handler global devolvendo JSON genérico; detalhe fica no log | Nenhum |

## O que **não** foi corrigido, e por quê

| Código | Falha | Motivo |
|---|---|---|
| **ALTA-03** | JWT em `localStorage` | Corrigir exige trocar todo o mecanismo de sessão por cookie `httpOnly`. É reescrita, não remendo — está no Zivko |
| **ALTA-05** | Credencial padrão `admin` / `admin123` | **Não é corrigível por código.** Depende de você trocar a senha — ver abaixo |
| Demais médias e baixas | Preço não historizado, conflito de agendamento, N+1, sem testes | São dívidas estruturais. O Zivko as resolve; remendá-las aqui traria risco sem benefício proporcional |

## ⚠️ Ações manuais necessárias antes do deploy

1. **Trocar a senha do administrador.** Se o seed rodou e a senha nunca foi alterada, o
   sistema está aberto com credenciais publicadas neste repositório. Entre com
   `admin` / `admin123` e complete o fluxo de primeiro acesso.

2. **Definir `SECRET_KEY` no Render** com 32+ caracteres aleatórios. Sem isso a
   aplicação **não sobe** — é intencional. Gerar com:
   ```
   python -c "import secrets; print(secrets.token_urlsafe(48))"
   ```
   Trocar a chave invalida todas as sessões ativas, o que é desejável aqui.

3. **Avisar os clientes** de que o login agora pede a data de nascimento.

## Verificação executada

Suíte de 24 verificações contra a aplicação instanciada, sem tocar no banco de produção.
Todas passaram:

- Separação de tipos de token: um token de cliente não passa como admin, nem o contrário
- Criar admin, ler/alterar cliente, ler histórico, criar atendimento e cancelar sem
  token → **401**
- Cliente 999 lendo cliente 1 → **404** (não 403, para não confirmar existência)
- Regex de CORS bloqueia `https://x.vercel.app.dominio-do-atacante.com` e ainda aceita
  preview legítimo; a allowlist não é descartada
- Produção recusa iniciar com segredo padrão e aceita segredo forte
- Rate limit bloqueia na 6ª tentativa de login
- Login de cliente só com telefone → **400**
- Os quatro cabeçalhos de segurança presentes na resposta

Build do frontend verificado (`react-scripts build`, exit 0). Os avisos de lint que
aparecem são **pré-existentes** e não estão nos arquivos alterados.

## Limitação conhecida

A data de nascimento é um **segundo fator fraco** — é conhecida por familiares e
aparece em redes sociais. Foi escolhida porque é o único dado que o sistema já coleta
de forma obrigatória, o que permitiu fechar a falha sem pedir nada novo ao cliente.

Isso reduz muito o risco em relação ao telefone sozinho, mas não é autenticação forte.
A solução definitiva — agendamento sem conta, com link assinado escopado a um único
agendamento — está no Zivko, no ADR-0004.
