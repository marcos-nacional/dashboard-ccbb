"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Users, Calendar, Filter, Info, MapPin } from "lucide-react"
import { useConsolidadoData } from "../../services/api"
import Loading from "../../components/Loading/Loading"

interface ProcessedData {
  date: string
  platform: string
  campaignName: string
  impressions: number
  cost: number
  reach: number
  clicks: number
  frequency: number
  cpm: number
  linkClicks: number
  visualizacoes100: number
  cpv: number
  vtr100: number
  praca: string // Adicionando praça diretamente nos dados processados
}

interface PlatformMetrics {
  platform: string
  impressions: number
  cost: number
  reach: number
  clicks: number
  cpm: number
  frequency: number
  linkClicks: number
  visualizacoes100: number
  cpv: number
  vtr100: number
  color: string
  percentage: number
}

const Alcance: React.FC = () => {
  const { data: apiData, loading, error } = useConsolidadoData()
  const [processedData, setProcessedData] = useState<ProcessedData[]>([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" })
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([])
  const [selectedPracas, setSelectedPracas] = useState<string[]>([])
  const [availablePracas, setAvailablePracas] = useState<string[]>([])

  // Cores para as plataformas
  const platformColors: Record<string, string> = {
    Google: "#4285f4",
    Meta: "#0668E1",
    TikTok: "#ff0050",
    YouTube: "#ff0000",
    Kwai: "#ff6b35",
    "Globo.com": "#00a86b",
    Serasa: "#9b59b6",
    "Folha de SP": "#e91e63",
    Spotify: "#1DB954",
    Netflix: "#E50914",
    "Catraca Livre": "#3498db",
    "Carta Capital": "#2c3e50",
    Band: "#ffd700",
    "Portal Fórum": "#8b4513",
    "Brasil 247": "#ff4500",
    "Poder 360": "#4b0082",
    LinkedIn: "#0077B5",
    Pinterest: "#E60023",
    GDN: "#34A853",
    "Demand-Gen": "#EA4335",
    Default: "#6366f1",
  }

  // Processar dados da API
  useEffect(() => {
    if (apiData?.values && apiData.values.length > 1) {
      try {
        const headers = apiData.values[0]
        const rows = apiData.values.slice(1)

        // Verificar se os headers necessários existem
        const requiredHeaders = ["Date", "Plataforma", "Campaign name", "Impressions", "Cost", "Reach", "Link clicks", "Frequência", "CPM", "Visualizações de vídeo a 100%", "CPV", "VTR 100%", "Praça"]
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))
        
        if (missingHeaders.length > 0) {
          console.warn("Headers ausentes:", missingHeaders)
        }

        const processed: ProcessedData[] = rows
          .map((row: string[]) => {
            const parseNumber = (value: string) => {
              if (!value || value === "" || value === "0") return 0
              return Number.parseFloat(value.replace(/[R$\s.]/g, "").replace(",", ".")) || 0
            }

            const parseInteger = (value: string) => {
              if (!value || value === "" || value === "0") return 0
              return Number.parseInt(value.replace(/[.\s]/g, "").replace(",", "")) || 0
            }

            const getHeaderValue = (headerName: string) => {
              const index = headers.indexOf(headerName)
              return index !== -1 ? row[index] || "" : ""
            }

            return {
              date: getHeaderValue("Date"),
              platform: getHeaderValue("Plataforma") || "Outros",
              campaignName: getHeaderValue("Campaign name"),
              impressions: parseInteger(getHeaderValue("Impressions")),
              cost: parseNumber(getHeaderValue("Cost")),
              reach: parseInteger(getHeaderValue("Reach")),
              clicks: parseInteger(getHeaderValue("Link clicks")),
              frequency: parseNumber(getHeaderValue("Frequência")) || 1,
              cpm: parseNumber(getHeaderValue("CPM")),
              linkClicks: parseInteger(getHeaderValue("Link clicks")),
              visualizacoes100: parseInteger(getHeaderValue("Visualizações de vídeo a 100%")),
              cpv: parseNumber(getHeaderValue("CPV")),
              vtr100: parseNumber(getHeaderValue("VTR 100%")),
              praca: getHeaderValue("Praça") || "Não informado", // Incluindo praça diretamente
            } as ProcessedData
          })
          .filter((item: ProcessedData) => item.date && item.impressions > 0)

        setProcessedData(processed)

        // Definir range de datas inicial
        if (processed.length > 0) {
          const validDates = processed
            .map((item) => item.date)
            .filter(Boolean)
            .sort()

          if (validDates.length > 0) {
            setDateRange({
              start: validDates[0],
              end: validDates[validDates.length - 1],
            })
          }
        }

        // Extrair plataformas únicas
        const platformSet = new Set<string>()
        processed.forEach((item) => {
          if (item.platform) {
            platformSet.add(item.platform)
          }
        })
        const platforms = Array.from(platformSet).filter(Boolean)
        setAvailablePlatforms(platforms)
        setSelectedPlatforms([])

        // Extrair praças únicas
        const pracaSet = new Set<string>()
        processed.forEach((item) => {
          if (item.praca) {
            pracaSet.add(item.praca)
          }
        })
        const pracas = Array.from(pracaSet).filter(Boolean)
        setAvailablePracas(pracas)
        setSelectedPracas([])

      } catch (error) {
        console.error("Erro ao processar dados:", error)
      }
    }
  }, [apiData])

  // Filtrar dados por data e plataforma
  const filteredData = useMemo(() => {
    let filtered = processedData

    // Filtro por data
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((item) => {
        const itemDateISO = item.date
        if (!itemDateISO) return false

        try {
          const itemDate = new Date(itemDateISO)
          const startDate = new Date(dateRange.start)
          const endDate = new Date(dateRange.end)
          return itemDate >= startDate && itemDate <= endDate
        } catch (error) {
          console.warn("Erro ao processar data:", itemDateISO)
          return false
        }
      })
    }

    // Filtro por plataforma
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter((item) => selectedPlatforms.includes(item.platform))
    }

    // Filtro por praça - Agora muito mais simples
    if (selectedPracas.length > 0) {
      filtered = filtered.filter((item) => selectedPracas.includes(item.praca))
    }

    return filtered
  }, [processedData, dateRange, selectedPlatforms, selectedPracas])

  // Calcular métricas por plataforma
  const platformMetrics = useMemo(() => {
    const metrics: Record<string, PlatformMetrics> = {}

    filteredData.forEach((item) => {
      if (!metrics[item.platform]) {
        metrics[item.platform] = {
          platform: item.platform,
          impressions: 0,
          cost: 0,
          reach: 0,
          clicks: 0,
          cpm: 0,
          frequency: 0,
          linkClicks: 0,
          visualizacoes100: 0,
          cpv: 0,
          vtr100: 0,
          color: platformColors[item.platform] || platformColors.Default,
          percentage: 0,
        }
      }

      metrics[item.platform].impressions += item.impressions
      metrics[item.platform].cost += item.cost
      metrics[item.platform].reach += item.reach
      metrics[item.platform].clicks += item.clicks
      metrics[item.platform].linkClicks += item.linkClicks
      metrics[item.platform].visualizacoes100 += item.visualizacoes100
    })

    // Calcular médias e percentuais
    const totalReach = Object.values(metrics).reduce((sum, metric) => sum + metric.reach, 0)

    Object.values(metrics).forEach((metric) => {
      const platformData = filteredData.filter((item) => item.platform === metric.platform)
      if (platformData.length > 0) {
        metric.cpm = metric.impressions > 0 ? metric.cost / (metric.impressions / 1000) : 0
        metric.frequency = metric.reach > 0 ? metric.impressions / metric.reach : 0
        metric.cpv = metric.visualizacoes100 > 0 ? metric.cost / metric.visualizacoes100 : 0
        metric.vtr100 = metric.impressions > 0 ? (metric.visualizacoes100 / metric.impressions) * 100 : 0
        metric.percentage = totalReach > 0 ? (metric.reach / totalReach) * 100 : 0
      }
    })

    return Object.values(metrics).sort((a, b) => b.reach - a.reach)
  }, [filteredData, platformColors])

  // Calcular totais
  const totals = useMemo(() => {
    const totalInvestment = filteredData.reduce((sum, item) => sum + item.cost, 0)
    const totalImpressions = filteredData.reduce((sum, item) => sum + item.impressions, 0)
    const totalReach = filteredData.reduce((sum, item) => sum + item.reach, 0)
    const totalVisualizacoes100 = filteredData.reduce((sum, item) => sum + item.visualizacoes100, 0)
    const avgFrequency = totalImpressions > 0 && totalReach > 0 ? totalImpressions / totalReach : 0

    return {
      investment: totalInvestment,
      impressions: totalImpressions,
      reach: totalReach,
      frequency: avgFrequency,
      visualizacoes100: totalVisualizacoes100,
      avgCpm: totalImpressions > 0 ? totalInvestment / (totalImpressions / 1000) : 0,
      avgCpv: totalVisualizacoes100 > 0 ? totalInvestment / totalVisualizacoes100 : 0,
    }
  }, [filteredData])

  // Função para formatar números
  const formatNumber = (value: number): string => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} bi`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} mi`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)} mil`
    }
    return value.toLocaleString("pt-BR")
  }

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Função para alternar seleção de plataforma
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        return prev.filter((p) => p !== platform)
      }
      return [...prev, platform]
    })
  }

  // Função para alternar seleção de praça
  const togglePraca = (praca: string) => {
    setSelectedPracas((prev) => {
      if (prev.includes(praca)) {
        return prev.filter((p) => p !== praca)
      }
      return [...prev, praca]
    })
  }

  // Componente de gráfico de barras empilhadas horizontal
  const StackedBarChart: React.FC<{ title: string; data: any[]; dataKey?: string }> = ({
    title,
    data,
    dataKey = "percentage",
  }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="space-y-2">
        <div className="flex text-xs text-gray-600 justify-between">
          <span>0%</span>
          <span>10%</span>
          <span>20%</span>
          <span>30%</span>
          <span>40%</span>
          <span>50%</span>
          <span>60%</span>
          <span>70%</span>
          <span>80%</span>
          <span>90%</span>
          <span>100%</span>
        </div>
        <div className="flex h-8 bg-gray-100 rounded overflow-hidden">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-center text-xs font-medium text-white"
              style={{
                width: `${item[dataKey]}%`,
                backgroundColor: item.color,
                minWidth: item[dataKey] > 3 ? "auto" : "0",
              }}
              title={`${item.platform || item.tipoCompra}: ${item[dataKey].toFixed(1)}%`}
            >
              {item[dataKey] > 5 ? item.platform || item.tipoCompra : ""}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs text-gray-600">{item.platform || item.tipoCompra}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Componente de gráfico de barras verticais
  const VerticalBarChart: React.FC<{
    title: string
    data: any[]
    getValue: (item: any) => number
    format?: (value: number) => string
  }> = ({ title, data, getValue, format = formatNumber }) => {
    const maxValue = Math.max(...data.map(getValue))

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-end space-x-2 h-32">
          {data.slice(0, 8).map((item, index) => {
            const value = getValue(item)
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0

            return (
              <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                <div className="w-full flex flex-col items-center">
                  <div
                    className="w-full rounded-t transition-all duration-500 flex items-end justify-center text-xs font-medium text-white p-1"
                    style={{
                      height: `${height}%`,
                      backgroundColor: item.color,
                      minHeight: value > 0 ? "20px" : "0",
                    }}
                  >
                    {value > 0 && <span>{format(value)}</span>}
                  </div>
                </div>
                <span className="text-xs text-gray-600 text-center truncate w-full">
                  {item.platform || item.tipoCompra}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return <Loading message="Carregando dados de alcance..." />
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
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-enhanced">Alcance</h1>
            <p className="text-gray-600">Análise de alcance da campanha</p>
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
          Última atualização: {new Date().toLocaleString("pt-BR")}
        </div>
      </div>

      {/* Filtros */}
      <div className="card-overlay rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Filtro de Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Período
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Filtro de Plataforma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Plataforma
            </label>
            <div className="flex flex-wrap gap-2">
              {availablePlatforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                    selectedPlatforms.includes(platform)
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                  }`}
                  style={{
                    backgroundColor: selectedPlatforms.includes(platform) ? platformColors[platform] + "20" : undefined,
                    borderColor: selectedPlatforms.includes(platform) ? platformColors[platform] : undefined,
                    color: selectedPlatforms.includes(platform) ? platformColors[platform] : undefined,
                  }}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de Praça */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Praça
            </label>
            <div className="flex flex-wrap gap-2">
              {availablePracas.map((praca) => (
                <button
                  key={praca}
                  onClick={() => togglePraca(praca)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                    selectedPracas.includes(praca)
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {praca}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card-overlay rounded-lg shadow-lg p-4 text-center min-h-[100px] flex flex-col justify-center">
          <div className="text-sm text-gray-600 mb-1">Investimento total</div>
          <div className="text-2xl font-bold text-gray-900">R$ {formatNumber(totals.investment)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center min-h-[100px] flex flex-col justify-center">
          <div className="text-sm text-gray-600 mb-1">Alcance</div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(totals.reach)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center min-h-[100px] flex flex-col justify-center">
          <div className="text-sm text-gray-600 mb-1">Frequência</div>
          <div className="text-2xl font-bold text-gray-900">{totals.frequency.toFixed(1)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center min-h-[100px] flex flex-col justify-center">
          <div className="text-sm text-gray-600 mb-1">CPM Médio</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totals.avgCpm)}</div>
        </div>

        <div className="card-overlay rounded-lg shadow-lg p-4 text-center min-h-[100px] flex flex-col justify-center">
          <div className="text-sm text-gray-600 mb-1">Impressões</div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(totals.impressions)}</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Investimento por Plataforma */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <StackedBarChart title="Investimento por Plataforma" data={platformMetrics} />
        </div>

        {/* Gráfico de Alcance por Plataforma */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <VerticalBarChart title="Alcance por Plataforma" data={platformMetrics} getValue={(item) => item.reach} />
        </div>

        {/* Gráfico de Frequência por Plataforma */}
        <div className="card-overlay rounded-lg shadow-lg p-6">
          <VerticalBarChart
            title="Frequência média por Plataforma"
            data={platformMetrics}
            getValue={(item) => item.frequency}
            format={(value) => value.toFixed(1)}
          />
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="flex-1 card-overlay rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados Detalhados por Plataforma</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="text-left py-3 px-4 font-semibold">#</th>
                <th className="text-left py-3 px-4 font-semibold">Plataforma</th>
                <th className="text-right py-3 px-4 font-semibold">Investimento</th>
                <th className="text-right py-3 px-4 font-semibold">Impressões</th>
                <th className="text-right py-3 px-4 font-semibold">Alcance</th>
                <th className="text-right py-3 px-4 font-semibold">Frequência</th>
                <th className="text-right py-3 px-4 font-semibold">CPM</th>
              </tr>
            </thead>
            <tbody>
              {platformMetrics.map((metric, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                  <td className="py-3 px-4 font-medium">{index + 1}.</td>
                  <td className="py-3 px-4 font-medium">{metric.platform}</td>
                  <td className="py-3 px-4 text-right font-semibold">{formatCurrency(metric.cost)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(metric.impressions)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(metric.reach)}</td>
                  <td className="py-3 px-4 text-right">{metric.frequency.toFixed(1)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(metric.cpm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerta Informativo */}
      <div className="bg-blue-50/90 backdrop-blur-sm border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">Informações sobre Alcance e Frequência</h3>
            <p className="text-sm text-blue-700">
              Os valores de <strong>alcance</strong> e <strong>frequência</strong> apresentados representam uma média
              aproximada dos números reais. Devido à natureza da extração diária dos dados e às limitações técnicas das
              plataformas, não é possível calcular com precisão absoluta esses indicadores. Os valores servem como
              referência para análise de tendências e comparações relativas entre diferentes períodos e veículos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Alcance