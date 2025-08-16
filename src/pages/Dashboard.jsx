import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Zap, 
  Users,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  ClipboardCheck,
  BookOpen
} from 'lucide-react'

export default function Dashboard() {
  const { session } = useAuth()
  const [profile, setProfile] = useState(null)
  const [metrics, setMetrics] = useState({
    preguicaScore: 0,
    automationsCreated: 0,
    hoursEconomized: 0,
    decisionsLogged: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [session])

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setMetrics(prev => ({
          ...prev,
          preguicaScore: profileData.preguica_score || 0
        }))
      }

      // Fetch user metrics
      const { data: automationsData } = await supabase
        .from('automations')
        .select('hours_saved')
        .eq('created_by', session.user.id)

      const { data: decisionsData } = await supabase
        .from('decision_logs')
        .select('id')
        .eq('user_id', session.user.id)

      setMetrics(prev => ({
        ...prev,
        automationsCreated: automationsData?.length || 0,
        hoursEconomized: automationsData?.reduce((acc, auto) => acc + (auto.hours_saved || 0), 0) || 0,
        decisionsLogged: decisionsData?.length || 0
      }))

    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success-600'
    if (score >= 60) return 'text-warning-600'
    return 'text-danger-600'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Preguiçoso Inteligente'
    if (score >= 60) return 'Em Transição'
    return 'Preguiçoso Burro'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo, {session?.user?.email?.split('@')[0]}!
            </h1>
            <p className="text-gray-600 mt-1">
              Transforme preguiça burra em preguiça inteligente
            </p>
          </div>
          <Brain className="h-12 w-12 text-primary-600" />
        </div>
      </div>

      {/* Score Principal */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-sm p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              {metrics.preguicaScore}%
            </h2>
            <p className="text-primary-100 text-lg">
              Seu Score de Preguiça Inteligente
            </p>
            <p className={`text-sm mt-1 ${getScoreColor(metrics.preguicaScore)}`}>
              {getScoreLabel(metrics.preguicaScore)}
            </p>
          </div>
          <div className="flex items-center">
            {metrics.preguicaScore >= 60 ? (
              <ArrowUp className="h-8 w-8 text-success-300" />
            ) : (
              <ArrowDown className="h-8 w-8 text-danger-300" />
            )}
          </div>
        </div>
      </div>

      {/* Métricas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-warning-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Automações Criadas
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.automationsCreated}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-success-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Horas Economizadas
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.hoursEconomized}h
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-primary-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Decisões Registradas
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.decisionsLogged}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-danger-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Nível Atual
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {getScoreLabel(metrics.preguicaScore)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/assessment" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors block">
            <ClipboardCheck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 text-center">Fazer Assessment</p>
          </a>
          
          <a href="/decisions" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors block">
            <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 text-center">Registrar Decisão</p>
          </a>
          
          <a href="/automations" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors block">
            <Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 text-center">Criar Automação</p>
          </a>
        </div>
      </div>

      {/* Progresso dos 10 Princípios */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Progresso dos 10 Princípios
        </h3>
        <div className="space-y-3">
          {[
            'Perguntar "Por Que?" Antes de "Como?"',
            'Fanatismo por Alavancagem',
            '"Não" como Resposta Padrão',
            'Criar Sistemas, Não Dependências',
            'Obsessão por Multiplicação'
          ].map((principle, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">{principle}</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full" 
                  style={{ width: `${Math.random() * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}