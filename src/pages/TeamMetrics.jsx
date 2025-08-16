import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Users, TrendingUp, Clock, Zap, Target, Award } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function TeamMetrics() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    averageScore: 0,
    totalAutomations: 0,
    totalHoursEconomized: 0,
    scoreDistribution: [],
    automationsByCategory: [],
    topAutomators: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeamMetrics()
  }, [])

  const fetchTeamMetrics = async () => {
    try {
      // Total users and average score
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('preguica_score')

      if (profilesError) throw profilesError

      // Total automations and hours economized
      const { data: automations, error: automationsError } = await supabase
        .from('automations')
        .select('category, hours_saved, created_by')

      if (automationsError) throw automationsError

      // Calculate metrics
      const totalUsers = profiles?.length || 0
      const averageScore = profiles?.length > 0 
        ? Math.round(profiles.reduce((acc, p) => acc + (p.preguica_score || 0), 0) / profiles.length)
        : 0

      const totalAutomations = automations?.length || 0
      const totalHoursEconomized = automations?.reduce((acc, a) => acc + (a.hours_saved || 0), 0) || 0

      // Score distribution
      const scoreDistribution = [
        { name: 'Preguiçoso Burro (0-59)', value: profiles?.filter(p => (p.preguica_score || 0) < 60).length || 0, color: '#ef4444' },
        { name: 'Em Transição (60-79)', value: profiles?.filter(p => (p.preguica_score || 0) >= 60 && (p.preguica_score || 0) < 80).length || 0, color: '#eab308' },
        { name: 'Preguiçoso Inteligente (80+)', value: profiles?.filter(p => (p.preguica_score || 0) >= 80).length || 0, color: '#22c55e' }
      ]

      // Automations by category
      const categoryCount = automations?.reduce((acc, auto) => {
        acc[auto.category] = (acc[auto.category] || 0) + 1
        return acc
      }, {}) || {}

      const automationsByCategory = Object.entries(categoryCount).map(([category, count]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        count
      }))

      // Top automators
      const automatorCount = automations?.reduce((acc, auto) => {
        acc[auto.created_by] = (acc[auto.created_by] || 0) + 1
        return acc
      }, {}) || {}

      const topAutomators = Object.entries(automatorCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => ({
          userId,
          count,
          name: `Usuário ${userId.slice(0, 8)}`
        }))

      setMetrics({
        totalUsers,
        averageScore,
        totalAutomations,
        totalHoursEconomized,
        scoreDistribution,
        automationsByCategory,
        topAutomators
      })

    } catch (error) {
      console.error('Erro ao buscar métricas do time:', error)
    } finally {
      setLoading(false)
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Métricas da Equipe</h1>
        <p className="text-gray-600">Visão geral do progresso da Academia Lendária</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total de Colaboradores
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Score Médio da Equipe
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.averageScore}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-warning-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total de Automações
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.totalAutomations}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-danger-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Horas Economizadas/Semana
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.totalHoursEconomized}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição de Scores
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.scoreDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {metrics.scoreDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Automations by Category */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Automações por Categoria
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.automationsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Automators */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Criadores de Automações
        </h3>
        <div className="space-y-3">
          {metrics.topAutomators.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma automação criada ainda
            </p>
          ) : (
            metrics.topAutomators.map((automator, index) => (
              <div key={automator.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-primary-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="ml-3 font-medium text-gray-900">
                    {automator.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <Zap className="h-4 w-4 text-warning-500 mr-1" />
                  <span className="font-semibold text-gray-900">
                    {automator.count} automações
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Team Goals */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Metas da Equipe
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Target className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Score Médio</h4>
            <p className="text-2xl font-bold text-primary-600">{metrics.averageScore}%</p>
            <p className="text-sm text-gray-500">Meta: 80%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${Math.min(metrics.averageScore, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <Zap className="h-8 w-8 text-warning-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Automações Criadas</h4>
            <p className="text-2xl font-bold text-warning-600">{metrics.totalAutomations}</p>
            <p className="text-sm text-gray-500">Meta: 50</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-warning-600 h-2 rounded-full"
                style={{ width: `${Math.min((metrics.totalAutomations / 50) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <Clock className="h-8 w-8 text-success-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Horas Economizadas</h4>
            <p className="text-2xl font-bold text-success-600">{metrics.totalHoursEconomized}h</p>
            <p className="text-sm text-gray-500">Meta: 200h/semana</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-success-600 h-2 rounded-full"
                style={{ width: `${Math.min((metrics.totalHoursEconomized / 200) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}