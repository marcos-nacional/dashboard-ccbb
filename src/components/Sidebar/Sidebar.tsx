"use client"

import type React from "react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, Clock, Globe, Eye, BarChart3, Users, LogOut, User, BookOpenText } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

interface MenuItem {
  id: string
  label: string
  path: string
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  {
    id: "capa",
    label: "Capa",
    path: "/capa",
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: "linha-tempo",
    label: "Linha do tempo",
    path: "/linha-tempo",
    icon: <Clock className="w-5 h-5" />,
  },
  {
    id: "estrategia-online",
    label: "Estratégia Online",
    path: "/estrategia-online",
    icon: <Globe className="w-5 h-5" />,
  },
  {
    id: "visao-geral",
    label: "Visão Geral",
    path: "/visao-geral",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: "alcance",
    label: "Alcance",
    path: "/alcance",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "visualizacoes",
    label: "Visualizações",
    path: "/visualizacoes",
    icon: <Eye className="w-5 h-5" />,
  },
  {
    id: "criativos-linkedin",
    label: "Criativos - LinkedIn",
    path: "/criativos-linkedin",
    icon: (
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="50"
        height="50"
        viewBox="0 0 50 50"
        fill="currentColor"
      >
        <path d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z"></path>
      </svg>
    ),
  },
  {
    id: "glossario",
    label: "Glossário",
    path: "/glossario",
    icon: <BookOpenText className="w-5 h-5" />, // Ícone do Glossário
  },
]

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageError(false)
  }

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-50 ${
        isExpanded ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img
                src="/images/nacional.gif"
                alt="Gif Nacional"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            {isExpanded && (
              <span className="ml-3 font-semibold text-gray-800 whitespace-nowrap">Dashboard Cartões</span>
            )}
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              {/* Avatar com fallback */}
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex-shrink-0 overflow-hidden bg-gray-100">
                {user.picture && !imageError ? (
                  <img
                    src={user.picture || "/placeholder.svg"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>
              {isExpanded && (
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path

              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    {isExpanded && <span className="ml-3 whitespace-nowrap overflow-hidden">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-lg"
            title="Sair"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="ml-3 whitespace-nowrap">Sair</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
