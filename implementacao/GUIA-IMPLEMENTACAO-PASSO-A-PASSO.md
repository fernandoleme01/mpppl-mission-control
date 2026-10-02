# 📋 GUIA DE IMPLEMENTAÇÃO - FERREIRA PAES LEME

**Status:** Pronto para começar  
**Data:** 2 de outubro de 2026  
**Responsável:** You (com suporte técnico)

---

## 🎯 O QUE FAZER HOJE (SEMANA 1)

### SEGUNDA-FEIRA (2/10) - SETUP NOTION

#### Passo 1: Importar Dados dos Clientes (30 min)
```
1. Abra seu Notion
2. Vá para: 📱 CLIENTES & LEADS
3. Clique em "Add a page"
4. Preencha com esses dados do arquivo JSON:

   Nome: João Silva
   WhatsApp: 11999998888
   Email: joao.silva@email.com
   Área: Trabalhista
   Campanha: Meta Ads
   Status: Novo
   Valor Estimado: R$ 15.000
   Notas: Demitido sem justa causa. Interessado em processo.

5. Repita para os outros 7 clientes (arquivo: 01-dados-clientes-leads.json)
```

#### Passo 2: Importar Dados dos Casos (20 min)
```
1. Vá para: ⚖️ CASOS / PROCESSOS
2. Clique em "Add a page"
3. Preencha com dados do arquivo 02-dados-casos-processos.json
4. Importante: Link o advogado responsável (Carlos, Ana, Pedro)
```

#### Passo 3: Importar Dados da Equipe (10 min)
```
1. Vá para: 👥 EQUIPE / COLABORADORES
2. Preencha com dados do arquivo 03-dados-equipe-colaboradores.json
```

**Resultado esperado:** 3 bancos populados com dados reais ✅

---

### TERÇA-FEIRA (3/10) - CRIAR DASHBOARDS

#### Dashboard 1: Executivo (30 min)
```
1. Crie página: "📊 DASHBOARD EXECUTIVO"
2. Adicione cards com:
   
   📊 ESTA SEMANA:
   • Leads recebidos: 8 (ver em CLIENTES & LEADS com filtro Status = Novo)
   • Qualificados: 3
   • Convertidos em Cliente: 1
   
   💰 RECEITA:
   • Total gerada: R$ 230.000 (soma de casos ativos)
   • Ticket médio: R$ 19.000
   • ROI campanhas: 3.636%
   
   📈 TAXA DE CONVERSÃO:
   • Geral: 35% (converter 8 leads, virou 3 clientes)
   • Trabalhista: 40%
   • Previdenciária: 50%
   • Bancária: 30%

3. Embed tabelas direto do Notion:
   - Use /database e selecione "CLIENTES & LEADS"
```

#### Dashboard 2: Funil de Vendas (20 min)
```
1. Crie página: "💰 FUNIL DE VENDAS"
2. Crie tabela com:
   
   Status          | Quantidade | %
   Novo            | 3          | 38%
   Contato Inicial | 2          | 25%
   Qualificado     | 2          | 25%
   Em Negociação   | 1          | 12%
   Cliente         | 1          | 13%
   
3. Notion cria gráfico automaticamente
```

#### Dashboard 3: Performance por Área (30 min)
```
1. Crie página: "🎯 PERFORMANCE POR ÁREA"
2. Crie 3 seções (abas):

   📋 ABA TRABALHISTA:
   Leads: 4
   Conversão: 40% (1 cliente)
   Receita: R$ 15.000
   CPL: R$ 167
   Advogado Top: Carlos Mendes (60% conversão)
   
   💰 ABA PREVIDENCIÁRIA:
   Leads: 3
   Conversão: 50% (1 cliente)
   Receita: R$ 20.000
   CPL: R$ 292
   Advogado Top: Pedro Santos (55% conversão)
   
   🏦 ABA BANCÁRIA:
   Leads: 2
   Conversão: 30% (0 clientes)
   Receita: R$ 30.000 (em negociação)
   CPL: R$ 59
   Advogado Top: Ana Paula
```

#### Dashboard 4: Campanhas Digitais (20 min)
```
1. Crie página: "📱 CAMPANHAS DIGITAIS"
2. Tabela com dados do arquivo 04-dados-campanhas-digitais.json:
   
   Campanha              | Plataforma | Leads | CPL    | ROI
   Demissão Injusta      | Meta       | 12    | R$118 | 4225%
   INSS Negado           | G.Ads      | 8     | R$292 | 2735%
   Saia das Dívidas      | TikTok     | 15    | R$59  | 8427%
   
3. Destaque: "⭐ TikTok tem MELHOR CPL - TRIPLICAR ORÇAMENTO"
```

#### Dashboard 5: Performance da Equipe (15 min)
```
1. Crie página: "👥 PERFORMANCE DA EQUIPE"
2. Tabela com dados do arquivo 03-dados-equipe-colaboradores.json:
   
   Advogado     | Especialidade    | Casos | Conversão | NPS
   Carlos       | Trabalhista      | 7     | 60%       | 9/10
   Ana          | Bancária         | 5     | 50%       | 8/10
   Pedro        | Previdenciária   | 6     | 55%       | 9/10
   
3. Meta semanal: Carlos (5), Ana (4), Pedro (4)
```

**Resultado esperado:** 5 dashboards criados com KPIs em tempo real ✅

---

### QUARTA-FEIRA (4/10) - TREINAR EQUIPE (DIA 1)

#### Reunião de 2 horas (14:00-16:00)

**14:00-14:15 | BOAS-VINDAS (15 min)**
```
"Pessoal, hoje começamos a revolução do atendimento.

Até hoje, perdemos leads por falta de organização.
Hoje, vamos ter um sistema que funciona SOZINHO.

Vocês vão usar roteiros testados que já converteram 
centenas de clientes.

Vamos começar?"
```

**14:15-14:30 | O SISTEMA NOTION (15 min)**
```
"Vejam aqui no Notion, temos 7 bancos:
1. CLIENTES & LEADS → Todos os leads entram aqui
2. CASOS / PROCESSOS → Casos em andamento
3. DOCUMENTOS → Checklist obrigatório
4. EQUIPE → Quem somos
5. CAMPANHAS → ROI das publicidades
6. ROTEIROS & SCRIPTS → Como vocês devem falar
7. MÉTRICAS → Nosso resultado

TUDO está CONECTADO. Quando entra um lead:
✅ Email é enviado (automático)
✅ Você recebe notificação (automático)
✅ Métrica é atualizada (automático)

Vocês só focam em CONVERSAR COM O CLIENTE."
```

**14:30-15:15 | OS 3 SCRIPTS PRINCIPAIS (45 min)**

Abra o arquivo 05-dados-roteiros-scripts.json e leia:
- Script Trabalhista
- Script Previdenciária
- Script Bancária

Explique os 5 passos de cada:
1. Abertura (ser amigo, não vendedor)
2. Qualificação (fazer 3 perguntas)
3. Apresentação (contar diferencial)
4. Objeções (responder com verdade)
5. Fechamento (agendar ou guardar)

**15:15-15:45 | COMO USAR O NOTION (30 min)**

Demonstração ao vivo:
```
1. Quando alguém manda mensagem no WhatsApp
   → Lead entra automaticamente no Notion

2. Abra o banco CLIENTES & LEADS
   → Clique no novo lead

3. Complete os dados:
   - Email (se souber)
   - Área de interesse
   - Data de contato
   - Notas sobre conversa

4. Mude Status conforme a conversa:
   "Novo" → "Contato Inicial" → "Qualificado" 
   → "Em Negociação" → "Cliente"

5. A cada mudança:
   ✅ Email automático é enviado
   ✅ Métrica atualiza sozinha
   ✅ Você recebe notificação
```

**15:45-16:00 | METAS E BÔNUS (15 min)**

Mostre o Dashboard de Performance:
```
METAS MENSAIS:

Carlos (Trabalhista):
  Meta: 60% conversão
  Meta: 5 casos/mês
  Bônus: 10% se atingir

Ana (Bancária):
  Meta: 50% conversão
  Meta: 4 casos/mês
  Bônus: 8% se atingir

Pedro (Previdenciária):
  Meta: 55% conversão
  Meta: 4 casos/mês
  Bônus: 9% se atingir

PRÓXIMO MÊS: Quem tiver melhor performance ganha R$ 500 + reconhecimento!
```

**Resultado esperado:** Equipe entender sistema e roteiros ✅

---

### QUINTA-FEIRA (5/10) - TREINAR EQUIPE (DIA 2 - PRÁTICA)

#### Reunião de 1 hora (10:00-11:00)

**CENÁRIO 1: Lead Novo no WhatsApp (20 min)**
```
Simulação:
"Oi, vi seu anúncio. Fui demitido sem justa causa. Como funciona?"

O advogado responde como se fosse cliente real:
"Oi! Tudo bem? Vi que você precisa de ajuda com demissão. 
Deixa eu te fazer umas perguntas:
1. Há quanto tempo trabalha nessa empresa?
2. Recebeu alguma comunicação formal?
3. Já procurou ajuda jurídica antes?"

Você valida resposta vs roteiro.
Feedback: "Bom! Agora na objeção..."
```

**CENÁRIO 2: Cliente com Dúvida (20 min)**
```
Simulação:
"Quanto vai custar no final? Tenho medo de ser enganado."

Resposta esperada:
"Ótima pergunta! 
Você não paga NADA de entrada.
Se a gente não ganhar, não cobra nada.

Se ganharmos, cobro 20-30% do valor recuperado.

Exemplo: Se recuperarmos R$ 30.000, você me paga R$ 6.000.
Você fica com R$ 24.000."

Validar honestidade.
Feedback positivo ou correção.
```

**CENÁRIO 3: Lead Não Qualificado (20 min)**
```
Simulação:
"Fui demitido sem justa causa, mas foi há 3 anos atrás."

Resposta esperada:
"Entendo sua situação. Infelizmente, ações trabalhistas 
têm prazo de prescrição.

Mas deixa eu analisar melhor. 
Você quer agendar uma consulta para vermos se ainda 
temos algum direito a recuperar?"

Explicar prescrição sem desanimar.
Tentar agendar mesmo assim.
Registrar como "Não Qualificado - Reanálise em 30 dias"
```

**Resultado esperado:** Equipe confiante em aplicar roteiros ✅

---

### SEXTA-FEIRA (6/10) - PRIMEIROS LEADS REAIS

```
✅ Sistema 100% operacional
✅ Equipe treinada
✅ Primeiros leads reais entrando
✅ Emails automáticos sendo enviados
✅ Dashboards mostrando resultados

COMEMORAR! 🎉
```

---

## 🤖 SEMANA 2 - CONFIGURAR ZAPIER

### SEGUNDA-FEIRA (9/10)

#### Zap 1: WhatsApp → Cria Lead no Notion

```
1. Abra zapier.com
2. Clique "Create a Zap"

TRIGGER: WhatsApp Business
  - Escolha: "Incoming Message"
  - Conecte sua conta WhatsApp Business
  - Selecione seu número
  
ACTION: Notion
  - Escolha: "Create Database Item"
  - Conecte seu Notion
  - Banco: "📱 CLIENTES & LEADS"
  - Mapeamento:
    Nome do Cliente: [From Name]
    WhatsApp: [From Phone]
    Campanha Origem: "WhatsApp"
    Status: "Novo"
    Data Contato: [Today]
    Notas: [Message Body]

3. Teste e ative ✅
```

**Resultado:** Todo WhatsApp vira lead no Notion automaticamente

#### Zap 2: Lead Novo → Enviar Email

```
TRIGGER: Notion
  - Banco: "📱 CLIENTES & LEADS"
  - Evento: "Database Item Created"
  - Filtro: Status = "Novo"

ACTION: Gmail
  - Conecte Gmail
  - Para: [Email field]
  - Assunto: "⚖️ Análise Gratuita - Seu Caso"
  - Corpo: (cole email template do arquivo 05)

3. Teste e ative ✅
```

**Resultado:** Lead recebe email automático em segundos

#### Zap 3: Lead Qualificado → Notificação WhatsApp

```
TRIGGER: Notion
  - Banco: "📱 CLIENTES & LEADS"
  - Evento: "Database Item Updated"
  - Filtro: Status = "Qualificado"

ACTION: WhatsApp Business
  - Enviar para: Seu número
  - Mensagem:
    "🎯 NOVO LEAD QUALIFICADO!
    
    👤 Cliente: [Nome]
    📱 WhatsApp: [WhatsApp]
    💼 Área: [Área]
    💰 Valor: R$ [Valor]
    
    ⏰ Ação: Agende a consulta!"

3. Teste e ative ✅
```

**Resultado:** Você recebe alerta em tempo real

---

### TERÇA-FEIRA (10/10)

#### Zap 4: Caso Criado → Registrar em Métricas

```
TRIGGER: Notion
  - Banco: "⚖️ CASOS / PROCESSOS"
  - Evento: "Database Item Created"

ACTION: Notion
  - Banco: "📊 MÉTRICAS E KPIs"
  - Criar item com:
    Métrica: [Título do Caso]
    Área: [Área de Atuação]
    Mês: [Today - mês]
    Notas: "Novo caso criado"
    Data: [Today]

3. Ative ✅
```

#### Zap 5: Lead → Cliente = Enviar Email Boas-vindas

```
TRIGGER: Notion
  - Banco: "📱 CLIENTES & LEADS"
  - Evento: "Database Item Updated"
  - Filtro: Status = "Cliente"

ACTION: Gmail
  - Para: [Email]
  - Assunto: "🎉 Bem-vindo à Ferreira Paes Leme!"
  - Corpo: (email template boas-vindas cliente)

3. Ative ✅
```

---

### QUARTA-FEIRA (11/10)

#### Zap 6: Follow-up Automático (3 dias)

```
TRIGGER: Delay
  - Esperar: 3 dias

VERIFICAÇÃO: Notion
  - Verificar se Status ainda é "Novo"
  - Se SIM → continua
  - Se NÃO → para

ACTION: Gmail
  - Para: [Email]
  - Assunto: "⏰ Não esqueça - Sua análise está esperando!"
  - Corpo: (email template follow-up)

3. Ative ✅
```

#### Zap 7: Google Ads / Meta → Lead no Notion

```
TRIGGER: Google Ads ou Meta
  - Evento: "Conversion"
  - Conecte sua conta de anúncios

ACTION: Notion
  - Banco: "📱 CLIENTES & LEADS"
  - Nome: [Name from form]
  - Email: [Email from form]
  - WhatsApp: [Phone from form]
  - Campanha: "Google Ads" ou "Meta"
  - Status: "Novo"

3. Ative ✅
```

---

### SEXTA-FEIRA (13/10)

```
✅ Todos os 7 Zaps configurados
✅ Automação 100% funcional
✅ Nenhum lead manual necessário
✅ Sistema rodando SOZINHO

RESULTADO SEMANA 2: Máquina automática pronta! 🚀
```

---

## 📊 SEMANA 3 - OTIMIZAÇÃO

### SEGUNDA-FEIRA (16/10)
```
Analisar dados da Semana 1 + 2:
- Qual campanha tem melhor CPL?
- Qual advogado tem melhor conversão?
- Qual área está gerando mais receita?
```

### TERÇA-FEIRA (17/10)
```
Ajustar scripts baseado em feedback:
- Perguntas que funcionam melhor?
- Objeções mais comuns?
- Quanto tempo leva cada etapa?
```

### QUARTA-QUINTA (18-19/10)
```
Aumentar orçamento em campanhas com bom ROI:
- TikTok: CPL R$ 59 → TRIPLICAR
- Meta: CPL R$ 118 → DOBRAR
- Google Ads: CPL R$ 292 → REVISAR
```

### SEXTA (20/10)
```
Reunião com equipe:
- Revisar métricas
- Reconhecer top performer
- Ajustar metas
- Feedback de clientes
```

---

## 💰 SEMANA 4 - SCALE

### SEGUNDA-TERÇA (23-24/10)
```
Aumentar orçamento em campanhas bem-sucedidas
Pausar campanhas com baixo ROI
Testar TikTok Ads (baixo CPL)
```

### QUARTA-QUINTA (25-26/10)
```
Relatório executivo pronto
Apresentar ao cliente (se houver)
Planejamento do próximo mês
```

### SEXTA (27/10)
```
✅ Celebrar resultados
✅ Reconhecer top performer
✅ Planejar expansion
```

---

## ✅ CHECKLIST COMPLETO

### SEMANA 1 - NOTION
- [ ] Dados de clientes importados (8 clientes)
- [ ] Dados de casos importados (5 casos)
- [ ] Dados de equipe importados (5 colaboradores)
- [ ] Dashboard Executivo criado
- [ ] Dashboard Funil criado
- [ ] Dashboard Performance criado
- [ ] Dashboard Campanhas criado
- [ ] Dashboard Equipe criado
- [ ] Dia 1 treinamento teórico realizado
- [ ] Dia 2 treinamento prático realizado
- [ ] Primeiros leads reais entrando

### SEMANA 2 - ZAPIER
- [ ] Zap 1: WhatsApp → Notion
- [ ] Zap 2: Lead novo → Email
- [ ] Zap 3: Lead qualificado → Notificação
- [ ] Zap 4: Caso criado → Métricas
- [ ] Zap 5: Lead → Cliente → Email
- [ ] Zap 6: Follow-up 3 dias
- [ ] Zap 7: Google Ads/Meta → Lead

### SEMANA 3 - OTIMIZAÇÃO
- [ ] Análise de dados coletados
- [ ] Scripts ajustados
- [ ] Campanhas otimizadas
- [ ] Orçamentos escalados

### SEMANA 4 - SCALE
- [ ] Relatório executivo
- [ ] Resultados medidos
- [ ] Expansion planejado

---

## 💡 RESUMO RÁPIDO

**HOJE (Semana 1):**
1. Importar dados no Notion (1h)
2. Criar 5 dashboards (2h)
3. Treinar equipe (3h)
4. Resultado: Sistema 100% operacional

**PRÓXIMA SEMANA (Semana 2):**
1. Configurar 7 Zaps no Zapier (4h)
2. Resultado: Automação 100% funcional

**SEMANAS 3-4:**
1. Otimizar e escalar campanhas
2. Resultado: Máquina de vendas lucrativa

**META FINAL:** R$ 250K-435K/mês após 4 semanas ✅

---

**Dúvidas? Volte neste arquivo e procure o passo específico.**

Você consegue! 💪🚀
