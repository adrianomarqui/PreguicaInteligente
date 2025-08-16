import React from 'react'
import { supabase } from '../lib/supabase'
import { Brain, LogOut, BarChart3, CheckSquare, Zap, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }) {
  const { session } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Assessment', href: '/assessment', icon: CheckSquare },
    { name: 'Decisões', href: '/decisions', icon: CheckSquare },
    { name: 'Automações', href: '/automations', icon: Zap },
    { name: 'Equipe', href: '/team', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                Preguiça Inteligente
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session?.user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-4 text-sm font-medium text-gray-600 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-600 transition-colors"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </a>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}