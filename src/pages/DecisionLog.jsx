import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Target, Clock, TrendingUp, Filter, Edit, Trash2 } from 'lucide-react'

const DECISION_TYPES = [
  { value: 'eliminate', label: 'Eliminar', color: 'bg-danger-100 text-danger-800' },
  { value: 'automate', label: 'Automatizar', color: 'bg-warning-100 text-warning-800' },
  { value: 'delegate', label: 'Delegar', color: 'bg-primary-100 text-primary-800' },
  { value: 'simplify', label: 'Simplificar', color: 'bg-success-100 text-success-800' }
]

const IMPACT_LEVELS = [
  { value: 'low', label: 'Baixo', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Médio', color: 'bg-warning-100 text-warning-800' },
  { value: 'high', label: 'Alto', color: 'bg-success-100 text-success-800' }
]

const PRINCIPLES = [
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
]

export default function DecisionLog() {
  const { session } = useAuth()
  const [decisions, setDecisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDecision, setEditingDecision] = useState(null)
  const [filter, setFilter] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    principle_applied: '',
    decision_type: 'eliminate',
    impact_level: 'medium',
    time_saved_estimate: 0
  })

  useEffect(() => {
    if (session?.user) {
      loadDecisions()
    }
  }, [session])

  const loadDecisions = async () => {
    try {
      const { data, error } = await supabase
        .from('decision_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDecisions(data || [])
    } catch (error) {
      console.error('Error loading decisions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingDecision) {
        const { error } = await supabase
          .from('decision_logs')
          .update(formData)
          .eq('id', editingDecision.id)
          .eq('user_id', session.user.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('decision_logs')
          .insert([{
            ...formData,
            user_id: session.user.id
          }])

        if (error) throw error
      }

      await loadDecisions()
      resetForm()
    } catch (error) {
      console.error('Error saving decision:', error)
      alert('Erro ao salvar decisão. Tente novamente.')
    }
  }

  const handleEdit = (decision) => {
    setEditingDecision(decision)
    setFormData({
      title: decision.title,
      description: decision.description || '',
      principle_applied: decision.principle_applied || '',
      decision_type: decision.decision_type,
      impact_level: decision.impact_level,
      time_saved_estimate: decision.time_saved_estimate || 0
    })
    setShowForm(true)
  }

  const handleDelete = async (decisionId) => {
    if (!confirm('Tem certeza que deseja excluir esta decisão?')) return

    try {
      const { error } = await supabase
        .from('decision_logs')
        .delete()
        .eq('id', decisionId)
        .eq('user_id', session.user.id)

      if (error) throw error
      await loadDecisions()
    } catch (error) {
      console.error('Error deleting decision:', error)
      alert('Erro ao excluir decisão. Tente novamente.')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      principle_applied: '',
      decision_type: 'eliminate',
      impact_level: 'medium',
      time_saved_estimate: 0
    })
    setShowForm(false)
    setEditingDecision(null)
  }

  const getTypeConfig = (type) => DECISION_TYPES.find(t => t.value === type)
  const getImpactConfig = (impact) => IMPACT_LEVELS.find(i => i.value === impact)

  const filteredDecisions = decisions.filter(decision => {
    if (filter === 'all') return true
    return decision.decision_type === filter
  })

  const totalTimeSaved = decisions.reduce((sum, decision) => sum + (decision.time_saved_estimate || 0), 0)

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Log de Decisões</h1>
          <p className="text-gray-600 mt-2">
            Registre decisões baseadas nos princípios da Preguiça Inteligente
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Decisão
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Decisões</p>
              <p className="text-2xl font-bold text-gray-900">{decisions.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-success-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Economizado</p>
              <p className="text-2xl font-bold text-gray-900">{totalTimeSaved.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-warning-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Média por Decisão</p>
              <p className="text-2xl font-bold text-gray-900">
                {decisions.length > 0 ? (totalTimeSaved / decisions.length).toFixed(1) : '0.0'}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-700">Filtrar por tipo:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {DECISION_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => setFilter(type.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === type.value 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingDecision ? 'Editar Decisão' : 'Nova Decisão'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título da Decisão *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Automatizar relatório semanal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o contexto e os detalhes da decisão..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Princípio Aplicado
                  </label>
                  <select
                    className="input"
                    value={formData.principle_applied}
                    onChange={(e) => setFormData(prev => ({ ...prev, principle_applied: e.target.value }))}
                  >
                    <option value="">Selecione um princípio</option>
                    {PRINCIPLES.map((principle, index) => (
                      <option key={index} value={principle}>
                        {index + 1}. {principle}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Decisão
                    </label>
                    <select
                      className="input"
                      value={formData.decision_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, decision_type: e.target.value }))}
                    >
                      {DECISION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nível de Impacto
                    </label>
                    <select
                      className="input"
                      value={formData.impact_level}
                      onChange={(e) => setFormData(prev => ({ ...prev, impact_level: e.target.value }))}
                    >
                      {IMPACT_LEVELS.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tempo Economizado (horas)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="input"
                    value={formData.time_saved_estimate}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_saved_estimate: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.0"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingDecision ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Decisions List */}
      <div className="space-y-4">
        {filteredDecisions.length === 0 ? (
          <div className="card text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'Nenhuma decisão registrada' : `Nenhuma decisão do tipo "${getTypeConfig(filter)?.label}"`}
            </h3>
            <p className="text-gray-600 mb-4">
              Comece registrando suas decisões baseadas nos princípios da Preguiça Inteligente
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              Registrar Primeira Decisão
            </button>
          </div>
        ) : (
          filteredDecisions.map((decision) => {
            const typeConfig = getTypeConfig(decision.decision_type)
            const impactConfig = getImpactConfig(decision.impact_level)
            
            return (
              <div key={decision.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {decision.title}
                    </h3>
                    {decision.description && (
                      <p className="text-gray-600 mb-3">{decision.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(decision)}
                      className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(decision.id)}
                      className="p-2 text-gray-600 hover:text-danger-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
                    {typeConfig.label}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${impactConfig.color}`}>
                    Impacto {impactConfig.label}
                  </span>
                  {decision.time_saved_estimate > 0 && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                      {decision.time_saved_estimate}h economizadas
                    </span>
                  )}
                </div>

                {decision.principle_applied && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Princípio Aplicado:</p>
                    <p className="text-sm text-gray-600">{decision.principle_applied}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Registrado em {new Date(decision.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}