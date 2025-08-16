/*
  # Schema inicial do Sistema Preguiça Inteligente

  1. Tabelas criadas:
    - user_profiles: Perfis dos usuários com scores
    - assessments: Resultados dos assessments
    - decision_logs: Log de decisões baseadas nos princípios
    - automations: Banco de automações da equipe
    - principles_tracking: Acompanhamento dos 10 princípios

  2. Segurança:
    - RLS habilitado em todas as tabelas
    - Políticas para acesso baseado em usuário autenticado
    - Proteção de dados sensíveis
*/

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preguica_score integer DEFAULT 0 CHECK (preguica_score >= 0 AND preguica_score <= 100),
  last_assessment_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela de assessments
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  symptoms_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Tabela de log de decisões
CREATE TABLE IF NOT EXISTS decision_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  principle_applied text,
  decision_type text DEFAULT 'eliminate' CHECK (decision_type IN ('eliminate', 'automate', 'delegate', 'simplify')),
  impact_level text DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high')),
  time_saved_estimate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Tabela de automações
CREATE TABLE IF NOT EXISTS automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text DEFAULT 'process' CHECK (category IN ('process', 'communication', 'data', 'development', 'marketing')),
  time_to_implement numeric DEFAULT 0,
  hours_saved numeric DEFAULT 0,
  difficulty_level text DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  tools_used text DEFAULT '',
  steps_description text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de acompanhamento dos princípios
CREATE TABLE IF NOT EXISTS principles_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  principle_id integer NOT NULL CHECK (principle_id >= 1 AND principle_id <= 10),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_applied_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, principle_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE principles_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Políticas para assessments
CREATE POLICY "Users can read own assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Políticas para decision_logs
CREATE POLICY "Users can read own decisions"
  ON decision_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions"
  ON decision_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions"
  ON decision_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para automations
CREATE POLICY "Users can read public automations or own automations"
  ON automations
  FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can insert own automations"
  ON automations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own automations"
  ON automations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Políticas para principles_tracking
CREATE POLICY "Users can read own principles tracking"
  ON principles_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own principles tracking"
  ON principles_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own principles tracking"
  ON principles_tracking
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Funções para triggers de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at
  BEFORE UPDATE ON automations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_principles_tracking_updated_at
  BEFORE UPDATE ON principles_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_logs_user_id ON decision_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_automations_created_by ON automations(created_by);
CREATE INDEX IF NOT EXISTS idx_automations_is_public ON automations(is_public);
CREATE INDEX IF NOT EXISTS idx_principles_tracking_user_id ON principles_tracking(user_id);