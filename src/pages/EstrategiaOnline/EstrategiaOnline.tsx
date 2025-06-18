"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  Globe,
  BarChart3,
  Tv,
  Radio,
  Smartphone,
  Monitor,
  Volume2,
  Eye,
  Play,
  MousePointer,
  Users,
  MapPin,
} from "lucide-react"
import { useShareCCBBData } from "../../services/api"
import Loading from "../../components/Loading/Loading"

interface VehicleData {
  plataforma: string
  investimentoPrevisto: number
  custoTotal: number
  shareInternet: number
  shareInvestimentoTotal: number
  praca: string
  usoEstrategico: string
  shareInvestimentoUtilizado: number
  totalPrevisto: number
  custoUtilizado: number
  shareTotal: number
}

interface PracaTotals {
  praca: string
  totalInvestido: number
  totalPrevisto: number
  pacing: number
}

interface CampaignSummary {
  totalInvestimentoPrevisto: number
  totalCustoInvestido: number
  impressoesTotais: number
  cliquesTotais: number
  sessoesTotais: number
  vtr: number
}

interface AggregatedVehicleData {
  plataforma: string
  investimentoPrevisto: number
  custoTotal: number
  pacing: number
  shareInvestimentoTotal: number
  shareInternet: number
  usoEstrategico: string
}

const EstrategiaOnline: React.FC = () => {
  const { data: shareData, loading: shareLoading, error: shareError } = useShareCCBBData()
  const [vehicleData, setVehicleData] = useState<VehicleData[]>([])
  const [pracaTotals, setPracaTotals] = useState<PracaTotals[]>([])
  const [selectedPraca, setSelectedPraca] = useState<string | null>(null)
  const [availablePracas, setAvailablePracas] = useState<string[]>([])
  const [campaignSummary, setCampaignSummary] = useState<CampaignSummary>({
    totalInvestimentoPrevisto: 0,
    totalCustoInvestido: 0,
    impressoesTotais: 0,
    cliquesTotais: 0,
    sessoesTotais: 0,
    vtr: 85,
  })

  const loading = shareLoading
  const error = shareError

  // Ícones para diferentes plataformas
  const getPlatformIcon = (platform: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      META: <Smartphone className="w-5 h-5" />,
      GOOGLE: <Globe className="w-5 h-5" />,
      GDN: <Globe className="w-5 h-5" />,
      "DEMAND-GEN": <Globe className="w-5 h-5" />,
      TIKTOK: <Play className="w-5 h-5" />,
      YOUTUBE: <Tv className="w-5 h-5" />,
      "SPOTIFY BRASIL": <Volume2 className="w-5 h-5" />,
      SPOTIFY: <Volume2 className="w-5 h-5" />,
      NETFLIX: <Monitor className="w-5 h-5" />,
      "CATRACA LIVRE": <Eye className="w-5 h-5" />,
      UBER: <Smartphone className="w-5 h-5" />,
      PINTEREST: <Eye className="w-5 h-5" />,
      LINKEDIN: <Smartphone className="w-5 h-5" />,
      "PRIME VIDEO ADS": <Monitor className="w-5 h-5" />,
      "GLOBO.COM": <Monitor className="w-5 h-5" />,
      BAND: <Radio className="w-5 h-5" />,
      "BRASIL 247": <Eye className="w-5 h-5" />,
      "PORTAL FORUM": <Eye className="w-5 h-5" />,
      "SUA MUSICA": <Volume2 className="w-5 h-5" />,
    }
    return iconMap[platform.toUpperCase()] || <Globe className="w-5 h-5" />
  }

  // Cores para diferentes plataformas
  const getPlatformColor = (platform: string) => {
    const colorMap: Record<string, string> = {
      META: "#1877f2",
      GOOGLE: "#4285f4",
      GDN: "#4285f4",
      "DEMAND-GEN": "#34a853",
      TIKTOK: "#ff0050",
      YOUTUBE: "#ff0000",
      "SPOTIFY BRASIL": "#1DB954",
      SPOTIFY: "#1DB954",
      NETFLIX: "#E50914",
      "CATRACA LIVRE": "#3498db",
      UBER: "#000000",
      PINTEREST: "#bd081c",
      LINKEDIN: "#0077b5",
      "PRIME VIDEO ADS": "#00a8e1",
      "GLOBO.COM": "#00a86b",
      BAND: "#ffd700",
      "BRASIL 247": "#ff4500",
      "PORTAL FORUM": "#8b4513",
      "SUA MUSICA": "#1DB954",
    }
    return colorMap[platform.toUpperCase()] || "#6366f1"
  }

  // Função para obter cor do pacing (amarelo baixo → azul alto)
  const getPacingColor = (pacing: number) => {
    const normalizedPacing = Math.min(Math.max(pacing / 100, 0), 1)
    const yellow = { r: 251, g: 191, b: 36 }
    const blue = { r: 59, g: 130, b: 246 }
    const r = Math.round(yellow.r + (blue.r - yellow.r) * normalizedPacing)
    const g = Math.round(yellow.g + (blue.g - yellow.g) * normalizedPacing)
    const b = Math.round(yellow.b + (blue.b - yellow.b) * normalizedPacing)
    return `rgb(${r}, ${g}, ${b})`
  }

  // Função para converter string monetária em número
  const parseMonetaryValue = (value: string): number => {
    if (!value || value === "R$ 0,00") return 0
    return Number.parseFloat(value.replace("R$", "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".")) || 0
  }

  // Função para converter string de porcentagem em número
  const parsePercentageValue = (value: string): number => {
    if (!value || value === "0,00%") return 0
    return Number.parseFloat(value.replace("%", "").replace(",", ".")) || 0
  }

  // Processar dados da API
  useEffect(() => {
    if (shareData?.values) {
      const headers = shareData.values[0]
      const rows = shareData.values.slice(1)

      const processed: VehicleData[] = rows
        .map((row: any[]) => {
          const investimentoPrevisto = parseMonetaryValue(row[headers.indexOf("Investimento Previsto Líquido")])
          const custoTotal = parseMonetaryValue(row[headers.indexOf("CUSTO TOTAL")])
          const shareInternet = parsePercentageValue(row[headers.indexOf("Share de Internet")])

          return {
            plataforma: row[headers.indexOf("Plataforma")] || "",
            investimentoPrevisto,
            custoTotal,
            shareInternet,
            shareInvestimentoTotal: parsePercentageValue(row[headers.indexOf("Share do investimento total")]),
            praca: row[headers.indexOf("Praça")] || "",
            usoEstrategico: row[headers.indexOf("Uso Estratégico")] || "",
            shareInvestimentoUtilizado: parsePercentageValue(row[headers.indexOf("Share do investimento o utilizado")]),
            totalPrevisto: parseMonetaryValue(row[headers.indexOf("Total Previsto")]),
            custoUtilizado: parseMonetaryValue(row[headers.indexOf("CUSTO utilizado")]),
            shareTotal: parsePercentageValue(row[headers.indexOf("Share do Total")]),
          }
        })
        .filter((vehicle: VehicleData) => vehicle.plataforma && vehicle.praca)

      // Calcular totais por praça
      const pracaMap: Record<string, PracaTotals> = {}
      processed.forEach((vehicle) => {
        if (!pracaMap[vehicle.praca]) {
          pracaMap[vehicle.praca] = {
            praca: vehicle.praca,
            totalInvestido: 0,
            totalPrevisto: 0,
            pacing: 0,
          }
        }
        pracaMap[vehicle.praca].totalInvestido += vehicle.custoTotal
        pracaMap[vehicle.praca].totalPrevisto += vehicle.investimentoPrevisto
      })

      // Calcular pacing das praças
      Object.values(pracaMap).forEach((praca) => {
        praca.pacing = praca.totalPrevisto > 0 ? (praca.totalInvestido / praca.totalPrevisto) * 100 : 0
      })

      setPracaTotals(Object.values(pracaMap))
      setVehicleData(processed)

      // Extrair praças únicas
      const pracas = Array.from(new Set(processed.map((item) => item.praca)))
        .filter(Boolean)
        .sort()
      setAvailablePracas(pracas)

      // Calcular resumo da campanha
      const totalGeralPrevisto = processed.reduce((sum, v) => sum + v.investimentoPrevisto, 0)
      const totalGeralInvestido = processed.reduce((sum, v) => sum + v.custoTotal, 0)

      const summary: CampaignSummary = {
        totalInvestimentoPrevisto: totalGeralPrevisto,
        totalCustoInvestido: totalGeralInvestido,
        impressoesTotais: 0, // Dados não disponíveis no JSON atual
        cliquesTotais: 0, // Dados não disponíveis no JSON atual
        sessoesTotais: 0, // Dados não disponíveis no JSON atual
        vtr: 85, // Valor exemplo
      }

      setCampaignSummary(summary)
    }
  }, [shareData])

  // Dados agregados por plataforma para a tabela
  const aggregatedVehicleData = useMemo(() => {
    const filteredData = selectedPraca ? vehicleData.filter((vehicle) => vehicle.praca === selectedPraca) : vehicleData

    const aggregated: Record<string, AggregatedVehicleData> = {}

    filteredData.forEach((vehicle) => {
      if (!aggregated[vehicle.plataforma]) {
        aggregated[vehicle.plataforma] = {
          plataforma: vehicle.plataforma,
          investimentoPrevisto: 0,
          custoTotal: 0,
          pacing: 0,
          shareInvestimentoTotal: 0,
          shareInternet: 0,
          usoEstrategico: vehicle.usoEstrategico,
        }
      }

      aggregated[vehicle.plataforma].investimentoPrevisto += vehicle.investimentoPrevisto
      aggregated[vehicle.plataforma].custoTotal += vehicle.custoTotal
      aggregated[vehicle.plataforma].shareInvestimentoTotal += vehicle.shareInvestimentoTotal
      aggregated[vehicle.plataforma].shareInternet += vehicle.shareInternet
    })

    // Calcular pacing
    Object.values(aggregated).forEach((vehicle) => {
      vehicle.pacing = vehicle.investimentoPrevisto > 0 ? (vehicle.custoTotal / vehicle.investimentoPrevisto) * 100 : 0
    })

    return Object.values(aggregated).sort((a, b) => b.investimentoPrevisto - a.investimentoPrevisto)
  }, [vehicleData, selectedPraca])

  // Calcular totais filtrados
  const filteredTotals = useMemo(() => {
    const totalInvestido = aggregatedVehicleData.reduce((sum, v) => sum + v.custoTotal, 0)
    const totalPrevisto = aggregatedVehicleData.reduce((sum, v) => sum + v.investimentoPrevisto, 0)
    const pacing = totalPrevisto > 0 ? (totalInvestido / totalPrevisto) * 100 : 0

    return { totalInvestido, totalPrevisto, pacing }
  }, [aggregatedVehicleData])

  // Função para formatar valores monetários
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Função para formatar números
  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} mi`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} mil`
    }
    return value.toLocaleString("pt-BR")
  }

  if (loading) {
    return <Loading message="Carregando estratégia online..." />
  }

  if (error) {
    return (
      <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erro ao carregar dados: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-enhanced">Estratégia Online</h1>
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Por Praças</span>
              </div>
              <span className="text-sm">• Campanha CCBB</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
          Última atualização: {new Date().toLocaleString("pt-BR")}
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Investimento Previsto */}
        <div className="card-overlay rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Investimento Previsto</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(campaignSummary.totalInvestimentoPrevisto)}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Custo Realizado */}
        <div className="card-overlay rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Custo Realizado</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(campaignSummary.totalCustoInvestido)}</p>
            </div>
            <MousePointer className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        {/* Pacing Geral */}
        <div className="card-overlay rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pacing Geral</p>
              <p className="text-xl font-bold text-gray-900">
                {((campaignSummary.totalCustoInvestido / campaignSummary.totalInvestimentoPrevisto) * 100).toFixed(1)}%
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Praças Ativas */}
        <div className="card-overlay rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Praças Ativas</p>
              <p className="text-xl font-bold text-gray-900">{availablePracas.length}</p>
            </div>
            <MapPin className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Resumo por Praça - Cards Clicáveis */}
      <div className="card-overlay rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo por Praça</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {pracaTotals.map((praca, index) => (
            <div
              key={index}
              className={`rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedPraca === praca.praca
                  ? "bg-blue-100 border-2 border-blue-500 shadow-md"
                  : "bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:shadow-sm"
              }`}
              onClick={() => setSelectedPraca(selectedPraca === praca.praca ? null : praca.praca)}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{praca.praca}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Previsto:</span>
                  <span className="font-medium">{formatCurrency(praca.totalPrevisto)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Realizado:</span>
                  <span className="font-medium">{formatCurrency(praca.totalInvestido)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pacing:</span>
                  <span className="font-semibold" style={{ color: getPacingColor(praca.pacing) }}>
                    {praca.pacing.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(praca.pacing, 100)}%`,
                      backgroundColor: getPacingColor(praca.pacing),
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {selectedPraca && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setSelectedPraca(null)}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Limpar seleção (ver todas as praças)
            </button>
          </div>
        )}
      </div>

      {/* Tabela de Plataformas Agregadas */}
      <div className="flex-1 card-overlay rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Estratégia e Execução {selectedPraca && `- ${selectedPraca}`}
          </h2>
          <div className="text-sm text-gray-500">
            {selectedPraca ? `Dados da praça ${selectedPraca}` : "Dados agregados de todas as praças"}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 w-[20%]">Plataforma</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[18%]">Investimento Previsto</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 w-[12%]">Share (%)</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[18%]">Custo Realizado</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 w-[32%]">Pacing</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedVehicleData.map((vehicle, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${getPlatformColor(vehicle.plataforma)}20` }}
                      >
                        <div style={{ color: getPlatformColor(vehicle.plataforma) }}>
                          {getPlatformIcon(vehicle.plataforma)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{vehicle.plataforma}</span>
                        <div className="text-xs text-gray-500">{vehicle.usoEstrategico}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900">{formatCurrency(vehicle.investimentoPrevisto)}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-gray-700">{vehicle.shareInvestimentoTotal.toFixed(2)}%</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900">{formatCurrency(vehicle.custoTotal)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3 w-full">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(vehicle.pacing, 100)}%`,
                            backgroundColor: getPacingColor(vehicle.pacing),
                          }}
                        />
                        {vehicle.pacing > 100 && (
                          <div
                            className="absolute top-0 h-full opacity-70"
                            style={{
                              left: "100%",
                              width: `${Math.min(vehicle.pacing - 100, 50)}%`,
                              backgroundColor: getPacingColor(vehicle.pacing),
                            }}
                          />
                        )}
                      </div>
                      <span
                        className="text-sm font-medium text-right"
                        style={{ color: getPacingColor(vehicle.pacing) }}
                      >
                        {vehicle.pacing.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50/50">
                <td className="py-4 px-4 font-bold text-gray-900">Total</td>
                <td className="py-4 px-4 text-right font-bold text-gray-900">
                  {formatCurrency(filteredTotals.totalPrevisto)}
                </td>
                <td className="py-4 px-4 text-center font-bold text-gray-900">100,00%</td>
                <td className="py-4 px-4 text-right font-bold text-gray-900">
                  {formatCurrency(filteredTotals.totalInvestido)}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="font-bold" style={{ color: getPacingColor(filteredTotals.pacing) }}>
                    {filteredTotals.pacing.toFixed(1)}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Observações */}
        <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">Observações Importantes:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              • Dados de resultados apresentados por praça, podendo sofrer alterações para mais ou para menos após
              finalização da campanha.
            </li>
            <li>
              • Por integração não sendo 100% compatível com as diversas plataformas de entrega, há diferenças entre os
              criativos e o valor de todos os veículos.
            </li>
            <li>
              • Dados de acompanhamento da mídia são diferentes na agenda mensal, não são os mesmos exibidos na
              campanha.
            </li>
            <li>• Dados de veículos são atualizados semanalmente de acordo com dados internos das plataformas.</li>
          </ul>
        </div>

        {/* Legenda de Cores do Pacing */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Legenda do Pacing:</h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: getPacingColor(0) }}></div>
              <span className="text-xs text-gray-600">0% - Baixo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: getPacingColor(50) }}></div>
              <span className="text-xs text-gray-600">50% - Médio</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: getPacingColor(100) }}></div>
              <span className="text-xs text-gray-600">100% - Alto</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EstrategiaOnline
