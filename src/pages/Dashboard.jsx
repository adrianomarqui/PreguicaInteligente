import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Brain, Target, Zap, Users, TrendingUp, Clock } from 'lucide-react'

export default function Dashboard() {
  const { session } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [stats, setStats] = useState({
    preguicaScore: 0,
    totalDecisions: 0,
    totalAutomations: 0,
    timeSaved: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      loadDashboardData()
    }
  }, [session])

  const loadDashboardData = async () => {
    try {
      const userId = session.user.id

      // Load or create user profile
      let { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([{ user_id: userId, preguica_score: 0 }])
          .select()
          .single()

        if (createError) throw createError
        profile = newProfile
      } else if (profileError) {
        throw profileError
      }

      setUserProfile(profile)

      // Load stats
      const [decisionsResult, automationsResult] = await Promise.all([
        supabase
          .from('decision_logs')
          .select('time_saved_estimate')
          .eq('user_id', userId),
        supabase
          .from('automations')
          .select('hours_saved')
          .eq('created_by', userId)
      ])

      const totalDecisions = decisionsResult.data?.length || 0
      const totalAutomations = automationsResult.data?.length || 0
      const timeSaved = [
        ...(decisionsResult.data || []),
        ...(automationsResult.data || [])
      ].reduce((sum, item) => sum + (item.time_saved_estimate || item.hours_saved || 0), 0)

      setStats({
        preguicaScore: profile?.preguica_score || 0,
        totalDecisions,
        totalAutomations,
        timeSaved
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Pessoal
        </h1>
        <p className="text-gray-600">
          Acompanhe sua evolução na jornada da Preguiça Inteligente
        </p>
      </div>

      {/* Score Principal */}
      <div className="card text-center">
        <div className="flex items-center justify-center mb-4">
          <Brain className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Score de Preguiça Inteligente
        </h2>
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(stats.preguicaScore)}`}>
          {stats.preguicaScore}%
        </div>
        <p className={`text-lg font-medium ${getScoreColor(stats.preguicaScore)}`}>
          {getScoreLabel(stats.preguicaScore)}
        </p>
        {stats.preguicaScore < 80 && (
          <div className="mt-4">
            <a
              href="/assessment"
              className="btn btn-primary"
            >
              Fazer Assessment
            </a>
          </div>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Decisões Registradas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDecisions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-warning-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Automações Criadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAutomations}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-success-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Horas Economizadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.timeSaved.toFixed(1)}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Princípios da Preguiça Inteligente */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Os 10 Princípios da Preguiça Inteligente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Perguntar "Por Que?" Antes de "Como?"',
            'Fanatismo por Alavancagem',
            '"Não" como Resposta Padrão',
            'Criar Sistemas, Não Dependências',
            'Obsessão por Multiplicação',
            'Trabalho em Lote',
            'Delegar Decisões, Não Apenas Tarefas',
            'Pergunta de 2 Horas',
            'Sabáticos Forçados',
            'Documentar Tudo'
          ].map((principle, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                {index + 1}
              </div>
              <span className="text-sm font-medium text-gray-700">{principle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="/assessment" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-center">
            <Target className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Assessment</h4>
            <p className="text-sm text-gray-600">Avalie seu nível atual</p>
          </div>
        </a>

        <a href="/decisions" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-success-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Decisões</h4>
            <p className="text-sm text-gray-600">Registre suas decisões</p>
          </div>
        </a>

        <a href="/automations" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-center">
            <Zap className="h-8 w-8 text-warning-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Automações</h4>
            <p className="text-sm text-gray-600">Crie e compartilhe</p>
          </div>
        </a>

        <a href="/team" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-center">
            <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Equipe</h4>
            <p className="text-sm text-gray-600">Métricas coletivas</p>
          </div>
        </a>
      </div>
    </div>
  )
}