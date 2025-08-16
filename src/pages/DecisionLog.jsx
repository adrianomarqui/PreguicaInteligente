import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Plus, BookOpen, Clock, Target, Filter } from 'lucide-react'

const principles = [
  { id: 1, name: 'Perguntar "Por Que?" Antes de "Como?"', description: '80% das tarefas desaparecem quando você questiona sua necessidade' },
  { id: 2, name: 'Fanatismo por Alavancagem', description: 'Se demora 5+ minutos e é recorrente = automatize' },
  { id: 3, name: '"Não" como Resposta Padrão', description: 'Tudo é não até provar que merece ser sim' },
  { id: 4, name: 'Criar Sistemas, Não Dependências', description: 'Se só você sabe fazer = você falhou' },
  { id: 5, name: 'Obsessão por Multiplicação', description: 'Como fazer isso se fazer sozinho?' }
]

export default function DecisionLog() {
  const { session } = useAuth()
  const [decisions, setDecisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    principle_applied: '',
    decision_type: 'eliminate',
    impact_level: 'medium',
    time_saved_estimate: 0
  })

  useEffect(() => {
    fetchDecisions()
  }, [])

  const fetchDecisions = async () => {
    try {
      const { data, error } = await supabase
        .from('decision_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDecisions(data || [])
    } catch (error) {
      console.error('Erro ao buscar decisões:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('decision_logs')
        .insert({
          ...formData,
          user_id: session.user.id
        })

      if (error) throw error

      setFormData({
        title: '',
        description: '',
        principle_applied: '',
        decision_type: 'eliminate',
        impact_level: 'medium',
        time_saved_estimate: 0
      })
      setShowForm(false)
      fetchDecisions()
    } catch (error) {
      console.error('Erro ao salvar decisão:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDecisionTypeColor = (type) => {
    const colors = {
      eliminate: 'bg-danger-100 text-danger-800',
      automate: 'bg-warning-100 text-warning-800',
      delegate: 'bg-primary-100 text-primary-800',
      simplify: 'bg-success-100 text-success-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getDecisionTypeLabel = (type) => {
    const labels = {
      eliminate: 'Eliminar',
      automate: 'Automatizar',
      delegate: 'Delegar',
      simplify: 'Simplificar'
    }
    return labels[type] || type
  }

  if (loading && decisions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log de Decisões</h1>
          <p className="text-gray-600">Registre suas decisões baseadas nos princípios da preguiça inteligente</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Decisão
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Nova Decisão</h2>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Decisão
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Eliminar reunião semanal de status"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o contexto e o raciocínio por trás da decisão..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Princípio Aplicado
                  </label>
                  <select
                    className="input"
                    value={formData.principle_applied}
                    onChange={(e) => setFormData(prev => ({ ...prev, principle_applied: e.target.value }))}
                  >
                    <option value="">Selecione um princípio</option>
                    {principles.map(principle => (
                      <option key={principle.id} value={principle.name}>
                        {principle.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Decisão
                  </label>
                  <select
                    className="input"
                    value={formData.decision_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, decision_type: e.target.value }))}
                  >
                    <option value="eliminate">Eliminar</option>
                    <option value="automate">Automatizar</option>
                    <option value="delegate">Delegar</option>
                    <option value="simplify">Simplificar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nível de Impacto
                  </label>
                  <select
                    className="input"
                    value={formData.impact_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, impact_level: e.target.value }))}
                  >
                    <option value="low">Baixo</option>
                    <option value="medium">Médio</option>
                    <option value="high">Alto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo Economizado (horas/semana)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="input"
                    value={formData.time_saved_estimate}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_saved_estimate: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Salvando...' : 'Salvar Decisão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decisions List */}
      <div className="space-y-4">
        {decisions.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma decisão registrada
            </h3>
            <p className="text-gray-600 mb-6">
              Comece a documentar suas decisões baseadas nos princípios da preguiça inteligente
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              Registrar Primeira Decisão
            </button>
          </div>
        ) : (
          decisions.map((decision) => (
            <div key={decision.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {decision.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDecisionTypeColor(decision.decision_type)}`}>
                      {getDecisionTypeLabel(decision.decision_type)}
                    </span>
                  </div>
                  
                  {decision.description && (
                    <p className="text-gray-600 mb-3">{decision.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(decision.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    
                    {decision.principle_applied && (
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        {decision.principle_applied}
                      </div>
                    )}
                    
                    {decision.time_saved_estimate > 0 && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {decision.time_saved_estimate}h/semana economizadas
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}