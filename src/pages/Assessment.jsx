import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, AlertTriangle, Brain, Target } from 'lucide-react'

const WORKAHOLIC_SYMPTOMS = [
  {
    id: 1,
    title: "Você se orgulha de trabalhar mais horas que os outros",
    description: "Vê horas trabalhadas como medalha de honra"
  },
  {
    id: 2,
    title: "Você responde emails/mensagens imediatamente, mesmo fora do horário",
    description: "Sente ansiedade quando não responde na hora"
  },
  {
    id: 3,
    title: "Você faz tarefas que poderiam ser automatizadas ou delegadas",
    description: "Prefere fazer você mesmo 'para garantir'"
  },
  {
    id: 4,
    title: "Você raramente questiona se uma tarefa é realmente necessária",
    description: "Aceita demandas sem analisar o real valor"
  },
  {
    id: 5,
    title: "Você se sente culpado quando não está 'produzindo'",
    description: "Tempo livre gera ansiedade ou sentimento de culpa"
  },
  {
    id: 6,
    title: "Você acredita que 'estar ocupado' é sinônimo de ser importante",
    description: "Confunde movimento com progresso"
  },
  {
    id: 7,
    title: "Você raramente delega porque 'é mais rápido fazer sozinho'",
    description: "Não investe tempo em treinar outros"
  },
  {
    id: 8,
    title: "Você trabalha em múltiplas tarefas simultaneamente",
    description: "Multitasking constante sem foco profundo"
  },
  {
    id: 9,
    title: "Você não documenta processos porque 'não tem tempo'",
    description: "Sempre refaz o mesmo trabalho do zero"
  },
  {
    id: 10,
    title: "Você mede sucesso por horas trabalhadas, não por resultados",
    description: "Foca no esforço, não no impacto"
  }
]

export default function Assessment() {
  const { session } = useAuth()
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleAnswerChange = (symptomId, value) => {
    setAnswers(prev => ({
      ...prev,
      [symptomId]: value
    }))
  }

  const calculateScore = () => {
    const totalAnswers = Object.values(answers).length
    if (totalAnswers === 0) return 0

    const yesCount = Object.values(answers).filter(answer => answer === 'yes').length
    const noCount = Object.values(answers).filter(answer => answer === 'no').length
    
    // Score: 0-100%, where 100% = Preguiçoso Inteligente
    // More "no" answers = higher score (better)
    const score = Math.round((noCount / totalAnswers) * 100)
    return score
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Preguiçoso Inteligente'
    if (score >= 60) return 'Em Transição'
    return 'Preguiçoso Burro'
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success-600'
    if (score >= 60) return 'text-warning-600'
    return 'text-danger-600'
  }

  const getRecommendations = (score) => {
    if (score >= 80) {
      return [
        "Continue aplicando os princípios da Preguiça Inteligente",
        "Compartilhe suas automações com a equipe",
        "Mentore outros colaboradores na transição",
        "Documente seus processos otimizados"
      ]
    } else if (score >= 60) {
      return [
        "Foque em automatizar tarefas repetitivas",
        "Pratique dizer 'não' para demandas desnecessárias",
        "Implemente sistemas de documentação",
        "Delegue mais decisões, não apenas tarefas"
      ]
    } else {
      return [
        "Comece questionando: 'Por que estou fazendo isso?'",
        "Identifique suas 3 tarefas mais repetitivas para automatizar",
        "Estabeleça horários específicos para emails",
        "Documente pelo menos 1 processo por semana"
      ]
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (Object.keys(answers).length < WORKAHOLIC_SYMPTOMS.length) {
      alert('Por favor, responda todas as perguntas antes de continuar.')
      return
    }

    setLoading(true)

    try {
      const score = calculateScore()
      const symptomsCount = Object.values(answers).filter(answer => answer === 'yes').length

      // Save assessment
      const { error: assessmentError } = await supabase
        .from('assessments')
        .insert([{
          user_id: session.user.id,
          answers,
          score,
          symptoms_count: symptomsCount
        }])

      if (assessmentError) throw assessmentError

      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert([{
          user_id: session.user.id,
          preguica_score: score,
          last_assessment_date: new Date().toISOString()
        }])

      if (profileError) throw profileError

      setResult({
        score,
        symptomsCount,
        label: getScoreLabel(score),
        recommendations: getRecommendations(score)
      })
      setSubmitted(true)

    } catch (error) {
      console.error('Error saving assessment:', error)
      alert('Erro ao salvar assessment. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const resetAssessment = () => {
    setAnswers({})
    setSubmitted(false)
    setResult(null)
  }

  if (submitted && result) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <Brain className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resultado do Assessment
          </h1>
          <p className="text-gray-600">
            Seu diagnóstico de Preguiça Inteligente
          </p>
        </div>

        <div className="card text-center">
          <div className={`text-6xl font-bold mb-4 ${getScoreColor(result.score)}`}>
            {result.score}%
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${getScoreColor(result.score)}`}>
            {result.label}
          </h2>
          <p className="text-gray-600 mb-4">
            Você apresentou {result.symptomsCount} de 10 sintomas do "culto workaholic"
          </p>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Target className="h-6 w-6 mr-2" />
            Recomendações Personalizadas
          </h3>
          <ul className="space-y-3">
            {result.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-success-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={resetAssessment}
            className="btn btn-secondary"
          >
            Refazer Assessment
          </button>
          <a href="/" className="btn btn-primary">
            Ir para Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <AlertTriangle className="h-16 w-16 text-warning-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Assessment: Preguiça Inteligente
        </h1>
        <p className="text-gray-600">
          Diagnóstico baseado nos 10 sintomas do "culto workaholic"
        </p>
      </div>

      <div className="card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Como funciona?
          </h2>
          <p className="text-gray-600">
            Responda honestamente às perguntas abaixo. Cada "sim" indica um sintoma do workaholic inconsciente. 
            O objetivo é ter o máximo de "não" possível, indicando que você já pensa como um preguiçoso inteligente.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {WORKAHOLIC_SYMPTOMS.map((symptom) => (
            <div key={symptom.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                {symptom.id}. {symptom.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {symptom.description}
              </p>
              
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`symptom-${symptom.id}`}
                    value="yes"
                    checked={answers[symptom.id] === 'yes'}
                    onChange={(e) => handleAnswerChange(symptom.id, e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-danger-600 font-medium">Sim</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`symptom-${symptom.id}`}
                    value="no"
                    checked={answers[symptom.id] === 'no'}
                    onChange={(e) => handleAnswerChange(symptom.id, e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-success-600 font-medium">Não</span>
                </label>
              </div>
            </div>
          ))}

          <div className="text-center pt-6">
            <button
              type="submit"
              disabled={loading || Object.keys(answers).length < WORKAHOLIC_SYMPTOMS.length}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Calculando resultado...
                </div>
              ) : (
                'Ver Resultado'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}