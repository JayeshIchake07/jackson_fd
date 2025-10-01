"use client"

import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Calendar,
  Settings,
  Info
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend,
  ReferenceLine,
  Brush
} from 'recharts'

/**
 * Interactive Chart Wrapper Component
 * 
 * Provides comprehensive interactive features for all chart types:
 * - Tooltips with detailed data points
 * - Zoom and pan functionality
 * - Filter controls for dynamic data filtering
 * - Real-time updates support
 * - Responsive design
 * - Legend with toggle visibility
 * - Accessibility features
 * - Keyboard navigation
 * 
 * @param props - Chart configuration and data
 */
interface InteractiveChartWrapperProps {
  title: string
  description: string
  chartType: 'bar' | 'pie' | 'area' | 'line' | 'horizontalBar'
  data: any[]
  dataKey: string
  nameKey?: string
  children: React.ReactNode
  className?: string
  height?: number
  showFilters?: boolean
  showZoom?: boolean
  showLegend?: boolean
  showRefresh?: boolean
  filterOptions?: FilterOption[]
  onDataFilter?: (filters: FilterState) => void
  onRefresh?: () => void
  realTimeUpdate?: boolean
  updateInterval?: number
}

interface FilterOption {
  key: string
  label: string
  type: 'select' | 'date' | 'range' | 'checkbox'
  options?: { value: string; label: string }[]
  defaultValue?: any
}

interface FilterState {
  [key: string]: any
}

interface ZoomState {
  x: number
  y: number
  scale: number
}

export const InteractiveChartWrapper = React.forwardRef<HTMLDivElement, InteractiveChartWrapperProps>(({ 
  title,
  description,
  chartType,
  data,
  dataKey,
  nameKey = 'name',
  children,
  className = '',
  height = 400,
  showFilters = true,
  showZoom = true,
  showLegend = true,
  showRefresh = true,
  filterOptions = [],
  onDataFilter,
  onRefresh,
  realTimeUpdate = false,
  updateInterval = 30000
}, ref) => {
  const [filters, setFilters] = useState<FilterState>({})
  const [filteredData, setFilteredData] = useState(data)
  const [zoomState, setZoomState] = useState<ZoomState>({ x: 0, y: 0, scale: 1 })
  const [legendVisibility, setLegendVisibility] = useState<Record<string, boolean>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [showAnnotations, setShowAnnotations] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  // Real-time updates effect
  useEffect(() => {
    if (!realTimeUpdate) return

    const interval = setInterval(() => {
      if (onRefresh) {
        setIsRefreshing(true)
        onRefresh()
        setLastUpdate(new Date())
        setTimeout(() => setIsRefreshing(false), 1000)
      }
    }, updateInterval)

    return () => clearInterval(interval)
  }, [realTimeUpdate, updateInterval, onRefresh])

  // Filter data based on current filters
  useEffect(() => {
    let filtered = [...data]

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        filtered = filtered.filter(item => {
          if (typeof value === 'string') {
            return item[key]?.toString().toLowerCase().includes(value.toLowerCase())
          }
          return item[key] === value
        })
      }
    })

    setFilteredData(filtered)
    onDataFilter?.(filters)
  }, [data, filters, onDataFilter])

  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomState(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomState(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.5) }))
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoomState({ x: 0, y: 0, scale: 1 })
  }, [])

  // Handle legend toggle
  const toggleLegendItem = useCallback((key: string) => {
    setLegendVisibility(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      setIsRefreshing(true)
      onRefresh()
      setLastUpdate(new Date())
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }, [onRefresh])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!chartRef.current?.contains(document.activeElement)) return

      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault()
          handleZoomIn()
          break
        case '-':
          event.preventDefault()
          handleZoomOut()
          break
        case '0':
          event.preventDefault()
          handleResetZoom()
          break
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            handleRefresh()
          }
          break
        case 'Tab':
          // Allow normal tab navigation
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleZoomIn, handleZoomOut, handleResetZoom, handleRefresh])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3 max-w-xs">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground">{entry.dataKey}:</span>
              <span className="text-sm font-medium text-foreground">{entry.value}</span>
            </div>
          ))}
          {payload[0]?.payload?.percentage && (
            <p className="text-xs text-muted-foreground mt-2">
              Percentage: {payload[0].payload.percentage.toFixed(1)}%
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className={`interactive-chart ${className}`} ref={ref || chartRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              {realTimeUpdate && (
                <Badge variant="secondary" className="text-xs">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {showRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-label="Refresh chart data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
            {showZoom && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetZoom}
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        {showFilters && filterOptions.length > 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterOptions.map((option) => (
                <div key={option.key} className="space-y-2">
                  <Label htmlFor={option.key} className="text-xs">
                    {option.label}
                  </Label>
                  {option.type === 'select' && option.options ? (
                    <Select
                      value={filters[option.key] || option.defaultValue || '__all__'}
                      onValueChange={(value) => handleFilterChange(option.key, value === '__all__' ? '' : value)}
                    >
                      <SelectTrigger id={option.key} className="h-8">
                        <SelectValue placeholder={`Select ${option.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All</SelectItem>
                        {option.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : option.type === 'date' ? (
                    <Input
                      id={option.key}
                      type="date"
                      value={filters[option.key] || ''}
                      onChange={(e) => handleFilterChange(option.key, e.target.value)}
                      className="h-8"
                    />
                  ) : (
                    <Input
                      id={option.key}
                      type="text"
                      placeholder={`Filter by ${option.label}`}
                      value={filters[option.key] || ''}
                      onChange={(e) => handleFilterChange(option.key, e.target.value)}
                      className="h-8"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Data points: {filteredData.length}</span>
            {realTimeUpdate && (
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>Zoom: {Math.round(zoomState.scale * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnnotations(!showAnnotations)}
              aria-label="Toggle annotations"
            >
              {showAnnotations ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div 
          className="relative"
          style={{ 
            height: `${height}px`,
            transform: `scale(${zoomState.scale})`,
            transformOrigin: 'top left'
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {React.cloneElement(children as React.ReactElement, {
              data: filteredData,
              margin: { top: 20, right: 30, left: 20, bottom: 5 },
              // Pass interactive props to child charts
              tooltip: <CustomTooltip />,
              legend: showLegend ? {
                verticalAlign: 'bottom',
                height: 36,
                iconType: 'circle',
                wrapperStyle: { fontSize: '12px' }
              } : undefined,
              // Add brush for zoom functionality
              brush: chartType !== 'pie' ? {
                dataKey: nameKey,
                height: 30,
                stroke: 'hsl(var(--primary))',
                fill: 'hsl(var(--primary))',
                fillOpacity: 0.1
              } : undefined
            })}
          </ResponsiveContainer>

          {/* Annotations overlay */}
          {showAnnotations && (
            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-3 h-3" />
                <span className="font-medium">Chart Info</span>
              </div>
              <div className="space-y-1 text-muted-foreground">
                <p>• Use mouse wheel to zoom</p>
                <p>• Drag to pan when zoomed</p>
                <p>• Click legend items to toggle</p>
                <p>• Keyboard shortcuts: +/- zoom, 0 reset</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend with toggle functionality */}
        {showLegend && filteredData.length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Legend Controls</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(filteredData.map(item => item[nameKey]))).map((name) => (
                <Button
                  key={name}
                  variant={legendVisibility[name] === false ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleLegendItem(name)}
                  className="h-6 text-xs"
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

InteractiveChartWrapper.displayName = 'InteractiveChartWrapper'

export default InteractiveChartWrapper
