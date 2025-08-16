# 🧠 Sistema Preguiça Inteligente - Academia Lendária

Sistema interno de produtividade baseado no framework **Preguiça Inteligente vs Preguiça Burra**, desenvolvido especificamente para os colaboradores da Academia Lendária.

## 🎯 Objetivo

Transformar colaboradores de "workaholics inconscientes" em "preguiçosos inteligentes estratégicos", aplicando os 10 princípios fundamentais para maximizar impacto e minimizar esforço desnecessário.

## 🚀 Funcionalidades

### 📊 Dashboard Pessoal
- **Score de Preguiça Inteligente** (0-100%)
- Métricas pessoais de produtividade
- Progresso dos 10 princípios
- Visão geral de automações criadas

### 🧪 Assessment Interativo
- Diagnóstico baseado nos 10 sintomas do "culto workaholic"
- Classificação automática: Preguiçoso Burro → Em Transição → Preguiçoso Inteligente
- Recomendações personalizadas para evolução

### 📝 Log de Decisões
- Registro de decisões baseadas nos princípios
- Categorização: Eliminar, Automatizar, Delegar, Simplificar
- Tracking de tempo economizado
- Aplicação dos 10 princípios na prática

### ⚡ Banco de Automações
- Biblioteca compartilhada de automações da equipe
- ROI Calculator (tempo investido vs. economizado)
- Templates e documentação de processos
- Sharing system: "Como nunca mais fazer X"

### 👥 Métricas da Equipe
- Score médio da Academia Lendária
- Distribuição de níveis de maturidade
- Top criadores de automações
- Metas coletivas e progresso

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Security**: Row Level Security (RLS) + Policies

## 🔒 Segurança Implementada

### ✅ Proteções Aplicadas:
- **RLS habilitado** em todas as tabelas
- **Políticas específicas** para cada tipo de dados
- **Authentication obrigatória** via Supabase
- **Environment variables** para credenciais
- **Validação de entrada** em formulários
- **.env no .gitignore**

### 🛡️ Arquitetura Segura:
```
Frontend (React):
├── src/components/ (apenas UI)
├── src/services/ (chamadas para Supabase)
├── src/contexts/ (gerenciamento de estado)
└── .env.example (template sem valores reais)

Database (Supabase):
├── RLS policies por usuário
├── Validações de dados
├── Índices otimizados
└── Triggers para updated_at
```

## 🚦 Como Usar

### 1. **Configuração Inicial**
```bash
# Clone o repositório
git clone https://github.com/adrianomarqui/PreguicaInteligente.git
cd PreguicaInteligente

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase
```

### 2. **Configuração do Supabase**
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute a migration em `supabase/migrations/create_initial_schema.sql`
3. Configure authentication por email/senha
4. Adicione as URLs e chaves no `.env`

### 3. **Executar Localmente**
```bash
# Iniciar desenvolvimento
npm run dev
```

### 4. **Para Usar no Bolt.new**
1. Acesse [bolt.new](https://bolt.new)
2. GitHub → Import from URL
3. Cole: `https://github.com/adrianomarqui/PreguicaInteligente`
4. Configure `.env` conforme instruções
5. Auto-sync ativo! ✨

## 📋 Princípios Implementados

### Os 10 Princípios da Preguiça Inteligente:

1. **Perguntar "Por Que?" Antes de "Como?"** - 80% das tarefas desaparecem quando questionadas
2. **Fanatismo por Alavancagem** - Se demora 5+ minutos e é recorrente = automatize
3. **"Não" como Resposta Padrão** - Tudo é não até provar que merece ser sim
4. **Criar Sistemas, Não Dependências** - Se só você sabe fazer = você falhou
5. **Obsessão por Multiplicação** - Como fazer isso se fazer sozinho?
6. **Trabalho em Lote** - Agrupar contextos similares
7. **Delegar Decisões, Não Apenas Tarefas** - Desenvolver cérebros, não robôs
8. **Pergunta de 2 Horas** - Se tivesse só 2h, o que faria?
9. **Sabáticos Forçados** - Tempo para insight e conexões
10. **Documentar Tudo** - Resolver uma vez, usar infinitas vezes

## 🎯 Filosofia

> "Numa corrida entre você e uma máquina pra ver quem trabalha mais, a máquina sempre ganha. Numa competição entre você e você mesmo pra ver quem pensa melhor, você sempre evolui."

Este sistema operacionaliza a transição da **economia industrial** (horas = valor) para a **economia do conhecimento** (julgamento = valor), potencializada pela era da IA.

## 📈 Métricas de Sucesso

- **Score médio da equipe** acima de 80%
- **50+ automações** criadas coletivamente
- **200+ horas/semana** economizadas
- **Zero sintomas** de workaholic nos assessments

## 🤝 Contribuição

Sistema interno da Academia Lendária. Contribuições dos colaboradores são bem-vindas através de:
- Issues para bugs ou melhorias
- Pull requests para novas funcionalidades
- Compartilhamento de automações no sistema

## ⚠️ IMPORTANTE

- **Leia este README** para configuração segura
- **Configure .env** antes de executar
- **Use apenas em ambiente Academia Lendária**
- **Mantenha credenciais seguras**

---

**Feito com 🧠 pela equipe da Academia Lendária**

*"Preguiçoso inteligente não é quem evita trabalho. É quem entende que a vida é curta demais pra desperdiçar em esforço desnecessário."*
