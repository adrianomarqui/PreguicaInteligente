import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Zap, Clock, Users, Share2, Search } from 'lucide-react'

export default function Automations() {
  const { session } = useAuth()
  const [automations, setAutomations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'process',
    time_to_implement: 0,
    hours_saved: 0,
    difficulty_level: 'medium',
    tools_used: '',
    steps_description: '',
    is_public: true
  })

  useEffect(() => {
    fetchAutomations()
  }, [])

  const fetchAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .or(`created_by.eq.${session.user.id},is_public.eq.true`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAutomations(data || [])
    } catch (error) {
      console.error('Erro ao buscar automações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('automations')
        .insert({
          ...formData,
          created_by: session.user.id
        })

      if (error) throw error

      setFormData({
        title: '',
        description: '',
        category: 'process',
        time_to_implement: 0,
        hours_saved: 0,
        difficulty_level: 'medium',
        tools_used: '',
        steps_description: '',
        is_public: true
      })
      setShowForm(false)
      fetchAutomations()
    } catch (error) {
      console.error('Erro ao salvar automação:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      process: 'bg-primary-100 text-primary-800',
      communication: 'bg-success-100 text-success-800',
      data: 'bg-warning-100 text-warning-800',
      development: 'bg-purple-100 text-purple-800',
      marketing: 'bg-pink-100 text-pink-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-success-600',
      medium: 'text-warning-600',
      hard: 'text-danger-600'
    }
    return colors[difficulty] || 'text-gray-600'
  }

  const filteredAutomations = automations.filter(automation =>
    automation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    automation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    automation.tools_used?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && automations.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Banco de Automações</h1>
          <p className="text-gray-600">Compartilhe e descubra automações da equipe</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Automação
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar automações..."
          className="input pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Nova Automação</h2>
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
                  Título da Automação
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Automação de relatórios semanais"
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
                  placeholder="Descreva o que a automação faz e o problema que resolve..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="process">Processo</option>
                    <option value="communication">Comunicação</option>
                    <option value="data">Dados</option>
                    <option value="development">Desenvolvimento</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dificuldade
                  </label>
                  <select
                    className="input"
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value }))}
                  >
                    <option value="easy">Fácil</option>
                    <option value="medium">Médio</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo para Implementar (horas)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="input"
                    value={formData.time_to_implement}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_to_implement: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horas Economizadas (por semana)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="input"
                    value={formData.hours_saved}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours_saved: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ferramentas Utilizadas
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.tools_used}
                  onChange={(e) => setFormData(prev => ({ ...prev, tools_used: e.target.value }))}
                  placeholder="Ex: Zapier, Python, Google Sheets, Make.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passos da Implementação
                </label>
                <textarea
                  rows={4}
                  className="input"
                  value={formData.steps_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, steps_description: e.target.value }))}
                  placeholder="Descreva os passos necessários para implementar esta automação..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={formData.is_public}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                  Compartilhar com a equipe
                </label>
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
                  {loading ? 'Salvando...' : 'Salvar Automação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Automations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAutomations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma automação encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Tente outros termos de busca' : 'Comece criando sua primeira automação'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Criar Primeira Automação
              </button>
            )}
          </div>
        ) : (
          filteredAutomations.map((automation) => (
            <div key={automation.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(automation.category)}`}>
                  {automation.category}
                </span>
                {automation.is_public && (
                  <Share2 className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {automation.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {automation.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Dificuldade:</span>
                  <span className={`font-medium ${getDifficultyColor(automation.difficulty_level)}`}>
                    {automation.difficulty_level === 'easy' ? 'Fácil' : 
                     automation.difficulty_level === 'medium' ? 'Médio' : 'Difícil'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Implementação:</span>
                  <span className="text-gray-900">{automation.time_to_implement}h</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Economiza:</span>
                  <span className="text-success-600 font-medium">{automation.hours_saved}h/semana</span>
                </div>
                
                {automation.tools_used && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-500 text-xs">Ferramentas:</span>
                    <p className="text-gray-700 text-xs mt-1">{automation.tools_used}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Criado por você
                </span>
                <span>
                  {new Date(automation.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              {automation.steps_description && (
                <details className="mt-3">
                  <summary className="text-sm text-primary-600 cursor-pointer hover:text-primary-700">
                    Ver passos de implementação
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    {automation.steps_description}
                  </div>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}