import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, XCircle, Brain, AlertTriangle } from 'lucide-react'

const symptoms = [
  {
    id: 1,
    title: "Você Compete em Sofrimento",
    description: "Fala sobre dormir pouco, não almoçar, trabalhar fins de semana como medalha de honra",
    examples: ["Dormi 3 horas ontem", "Não almocei hoje, estava muito ocupado", "Faz 6 meses que não tiro um fim de semana"]
  },
  {
    id: 2,
    title: "Você Confunde Presença com Valor",
    description: "Mede valor pela quantidade de horas visível para outros",
    examples: ["João sempre está online no Slack", "Maria nunca sai antes das 19h", "Pedro responde email de madrugada"]
  },
  {
    id: 3,
    title: "Você Orgulha de Não Ter Vida",
    description: "Se vangloria de não tirar férias e trabalhar sempre",
    examples: ["Não tirei férias em 2 anos", "Trabalho até nos fins de semana", "Minha família já acostumou que eu não estou presente"]
  },
  {
    id: 4,
    title: "Você Usa 'Não Tenho Tempo' Como Desculpa Universal",
    description: "Evita pensar profundamente usando falta de tempo como justificativa",
    examples: ["Não tenho tempo para pensar nisso", "Não tenho tempo para automatizar", "Não tenho tempo para questionar se isso faz sentido"]
  },
  {
    id: 5,
    title: "Você Mede Sucesso por Input, Não por Output",
    description: "Foca em atividades realizadas ao invés de resultados gerados",
    examples: ["Mandei 150 emails hoje", "Participei de 8 reuniões", "Trabalhei 12 horas"]
  },
  {
    id: 6,
    title: "Você Evita Automatização",
    description: "Prefere fazer tarefas repetitivas manualmente",
    examples: ["É mais rápido fazer na mão", "Não vale a pena automatizar uma coisa tão simples", "Já sei fazer, por que complicar?"]
  },
  {
    id: 7,
    title: "Você Vicia em Urgência",
    description: "Tudo é urgente e alta prioridade, vive reagindo",
    examples: ["Tudo é para ontem", "Sempre em modo bombeiro", "Não consegue planejar porque tudo é urgente"]
  },
  {
    id: 8,
    title: "Você Romantiza o Sacrifício",
    description: "Acredita que sofrimento é necessário para o sucesso",
    examples: ["Empreendedorismo exige sacrifício", "Sucesso tem preço", "Nada de valor vem fácil"]
  },
  {
    id: 9,
    title: "Você Tem Alergia a Simplificação",
    description: "Complexidade virou símbolo de status intelectual",
    examples: ["Não pode ser tão simples assim", "Se fosse fácil, todo mundo fazia", "Tem que ter algum truque"]
  },
  {
    id: 10,
    title: "Você Compete por Reconhecimento do Esforço",
    description: "Precisa que vejam seu esforço para se sentir valorizado",
    examples: ["Ninguém vê o quanto eu trabalho", "Não reconhecem minha dedicação", "Faço tudo aqui e ninguém valoriza"]
  }
]

export default function Assessment() {
  const { session } = useAuth()
  const [answers, setAnswers] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [score, setScore] = useState(0)

  const handleAnswer = (symptomId, value) => {
    setAnswers(prev => ({
      ...prev,
      [symptomId]: value
    }))
  }

  const calculateScore = () => {
    const totalSymptoms = Object.keys(answers).length
    const positiveAnswers = Object.values(answers).filter(answer => answer === true).length
    
    // Score inverso: menos sintomas = maior score de preguiça inteligente
    const rawScore = ((totalSymptoms - positiveAnswers) / totalSymptoms) * 100
    return Math.round(rawScore)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const finalScore = calculateScore()
      
      // Save assessment result
      const { error } = await supabase
        .from('assessments')
        .insert({
          user_id: session.user.id,
          answers: answers,
          score: finalScore,
          symptoms_count: Object.values(answers).filter(answer => answer === true).length
        })

      if (error) throw error

      // Update user profile score
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: session.user.id,
          preguica_score: finalScore,
          last_assessment_date: new Date().toISOString()
        })

      setScore(finalScore)
      setCompleted(true)
    } catch (error) {
      console.error('Erro ao salvar assessment:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreInterpretation = (score) => {
    if (score >= 80) {
      return {
        level: "Preguiçoso Inteligente",
        color: "success",
        description: "Parabéns! Você entende que eficiência > esforço. Continue aplicando os princípios.",
        icon: CheckCircle
      }
    } else if (score >= 60) {
      return {
        level: "Em Transição",
        color: "warning", 
        description: "Você está no caminho certo, mas ainda tem alguns hábitos de workaholic para eliminar.",
        icon: AlertTriangle
      }
    } else {
      return {
        level: "Preguiçoso Burro",
        color: "danger",
        description: "Você ainda está preso no modelo antigo. Hora de repensar sua abordagem ao trabalho.",
        icon: XCircle
      }
    }
  }

  if (completed) {
    const interpretation = getScoreInterpretation(score)
    const IconComponent = interpretation.icon

    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <IconComponent className={`h-16 w-16 mx-auto mb-4 text-${interpretation.color}-500`} />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Seu Score: {score}%
          </h1>
          <h2 className={`text-xl font-semibold mb-4 text-${interpretation.color}-600`}>
            {interpretation.level}
          </h2>
          <p className="text-gray-600 mb-6">
            {interpretation.description}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Próximos Passos:</h3>
            <ul className="text-left text-sm text-gray-600 space-y-1">
              <li>• Comece a registrar suas decisões diárias</li>
              <li>• Identifique uma tarefa para automatizar</li>
              <li>• Pratique dizer "não" para 1 coisa hoje</li>
              <li>• Questione: "Por que faço isso?" antes de executar</li>
            </ul>
          </div>

          <button 
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentSymptom = symptoms[currentStep]
  const progress = ((currentStep + 1) / symptoms.length) * 100

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Assessment: Preguiça Inteligente
          </h1>
          <span className="text-sm text-gray-500">
            {currentStep + 1} de {symptoms.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start mb-6">
          <Brain className="h-8 w-8 text-primary-600 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {currentSymptom.title}
            </h2>
            <p className="text-gray-600 mb-4">
              {currentSymptom.description}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Exemplos:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {currentSymptom.examples.map((example, index) => (
                  <li key={index}>• "{example}"</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-medium text-gray-900">
            Você se identifica com este comportamento?
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer(currentSymptom.id, true)}
              className={`p-4 border-2 rounded-lg transition-colors ${
                answers[currentSymptom.id] === true
                  ? 'border-danger-500 bg-danger-50 text-danger-700'
                  : 'border-gray-300 hover:border-danger-300'
              }`}
            >
              <XCircle className="h-6 w-6 mx-auto mb-2" />
              <span className="font-medium">Sim, me identifico</span>
            </button>
            
            <button
              onClick={() => handleAnswer(currentSymptom.id, false)}
              className={`p-4 border-2 rounded-lg transition-colors ${
                answers[currentSymptom.id] === false
                  ? 'border-success-500 bg-success-50 text-success-700'
                  : 'border-gray-300 hover:border-success-300'
              }`}
            >
              <CheckCircle className="h-6 w-6 mx-auto mb-2" />
              <span className="font-medium">Não, não faço isso</span>
            </button>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn btn-secondary disabled:opacity-50"
          >
            Anterior
          </button>
          
          {currentStep === symptoms.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading || Object.keys(answers).length !== symptoms.length}
              className="btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Calculando...' : 'Finalizar Assessment'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(Math.min(symptoms.length - 1, currentStep + 1))}
              disabled={answers[currentSymptom.id] === undefined}
              className="btn btn-primary disabled:opacity-50"
            >
              Próximo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}