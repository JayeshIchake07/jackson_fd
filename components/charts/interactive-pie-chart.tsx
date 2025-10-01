"use client"

import React, { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { InteractiveChartWrapper } from './interactive-chart-wrapper'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

/**
 * Interactive Pie Chart Component
 * 
 * Features:
 * - Interactive pie/donut chart with hover effects
 * - Detailed tooltips with percentages and values
 * - Legend with toggle visibility for segments
 * - Dynamic filtering and real-time updates
 * - Responsive design with accessibility support
 * - Zoom functionality for detailed view
 * - Customizable colors and styling
 * 
 * @param props - Chart configuration
 */
interface InteractivePieChartProps {
  title: string
  description: string
  data: any[]
  dataKey: string
  nameKey?: string
  colors?: string[]
  height?: number
  showFilters?: boolean
  showZoom?: boolean
  showLegend?: boolean
  showRefresh?: boolean
  filterOptions?: any[]
  onDataFilter?: (filters: any) => void
  onRefresh?: () => void
  realTimeUpdate?: boolean
  updateInterval?: number
  className?: string
  innerRadius?: number
  outerRadius?: number
  showPercentage?: boolean
}

export function InteractivePieChart({
  title,
  description,
  data,
  dataKey,
  nameKey = 'name',
  colors = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16'
  ],
  height = 400,
  showFilters = true,
  showZoom = true,
  showLegend = true,
  showRefresh = true,
  filterOptions = [],
  onDataFilter,
  onRefresh,
  realTimeUpdate = false,
  updateInterval = 30000,
  className = '',
  innerRadius = 30,
  outerRadius = 80,
  showPercentage = true
}: InteractivePieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [legendVisibility, setLegendVisibility] = useState<Record<string, boolean>>({})

  // Calculate total for percentage calculations
  const total = useMemo(() => 
    data.reduce((sum, item) => sum + item[dataKey], 0), 
    [data, dataKey]
  )

  // Enhanced tooltip for pie charts
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data[dataKey] / total) * 100).toFixed(1)
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: payload[0].color }}
              aria-hidden="true"
            />
            <p className="font-semibold text-foreground">{data[nameKey]}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Value:</span>
              <span className="text-sm font-semibold text-foreground">{data[dataKey]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Percentage:</span>
              <span className="text-sm font-semibold text-foreground">{percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="text-sm font-semibold text-foreground">{total}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: payload[0].color
                }}
              />
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom legend with toggle functionality
  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null

    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload.map((entry: any, index: number) => {
          const isVisible = legendVisibility[entry.value] !== false
          
          return (
            <Button
              key={index}
              variant={isVisible ? "default" : "outline"}
              size="sm"
              onClick={() => setLegendVisibility(prev => ({ 
                ...prev, 
                [entry.value]: !prev[entry.value] 
              }))}
              className="h-8 text-xs flex items-center gap-2"
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span>{entry.value}</span>
              <span className="text-muted-foreground">
                ({entry.payload[dataKey]})
              </span>
              {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </Button>
          )
        })}
      </div>
    )
  }

  // Generate colors for data points
  const getPieColor = (index: number) => colors[index % colors.length]

  // Filter data based on legend visibility
  const filteredData = data.filter(item => 
    legendVisibility[item[nameKey]] !== false
  )

  return (
    <InteractiveChartWrapper
      title={title}
      description={description}
      chartType="pie"
      data={data}
      dataKey={dataKey}
      nameKey={nameKey}
      height={height}
      showFilters={showFilters}
      showZoom={showZoom}
      showLegend={false} // We'll use custom legend
      showRefresh={showRefresh}
      filterOptions={filterOptions}
      onDataFilter={onDataFilter}
      onRefresh={onRefresh}
      realTimeUpdate={realTimeUpdate}
      updateInterval={updateInterval}
      className={className}
    >
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          paddingAngle={3}
          dataKey={dataKey}
          stroke="hsl(var(--background))"
          strokeWidth={2}
          activeIndex={activeIndex}
          activeShape={{
            outerRadius: outerRadius + 5,
            stroke: 'hsl(var(--primary))',
            strokeWidth: 2
          }}
        >
          {filteredData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getPieColor(index)}
              stroke="hsl(var(--background))"
              strokeWidth={2}
              style={{
                filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Pie>
        
        <Tooltip content={<CustomPieTooltip />} />
        
        {/* Custom Legend */}
        <Legend content={<CustomLegend />} />
      </PieChart>
    </InteractiveChartWrapper>
  )
}

export default InteractivePieChart
