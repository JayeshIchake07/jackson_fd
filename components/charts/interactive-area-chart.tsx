"use client"

import React, { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush, ReferenceLine } from 'recharts'
import { InteractiveChartWrapper } from './interactive-chart-wrapper'

/**
 * Interactive Area Chart Component
 * 
 * Features:
 * - Interactive area chart with multiple data series
 * - Gradient fills and smooth animations
 * - Zoom and pan functionality with brush
 * - Interactive tooltips with detailed information
 * - Reference lines for benchmarks
 * - Dynamic filtering and real-time updates
 * - Responsive design with accessibility support
 * - Stacked or overlapping area support
 * 
 * @param props - Chart configuration
 */
interface InteractiveAreaChartProps {
  title: string
  description: string
  data: any[]
  dataKeys: string[]
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
  stacked?: boolean
  showReferenceLines?: boolean
  referenceLines?: Array<{
    y: number
    label: string
    color?: string
  }>
}

export function InteractiveAreaChart({
  title,
  description,
  data,
  dataKeys,
  nameKey = 'name',
  colors = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899'
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
  stacked = false,
  showReferenceLines = false,
  referenceLines = []
}: InteractiveAreaChartProps) {
  const [activeDataKey, setActiveDataKey] = useState<string | null>(null)

  // Calculate totals for stacked charts
  const totals = useMemo(() => {
    if (!stacked) return {}
    
    return data.reduce((acc, item) => {
      dataKeys.forEach(key => {
        acc[key] = (acc[key] || 0) + item[key]
      })
      return acc
    }, {} as Record<string, number>)
  }, [data, dataKeys, stacked])

  // Enhanced tooltip for area charts
  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0)
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 max-w-xs">
          <p className="font-semibold text-foreground mb-3 border-b border-border pb-2">
            {label}
          </p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => {
              const percentage = stacked && totals[entry.dataKey] 
                ? ((entry.value / totals[entry.dataKey]) * 100).toFixed(1)
                : total > 0 
                ? ((entry.value / total) * 100).toFixed(1)
                : '0'
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-muted-foreground">{entry.dataKey}:</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-foreground">{entry.value}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          {stacked && (
            <div className="mt-3 pt-2 border-t border-border">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Total:</span>
                <span className="font-medium">{total}</span>
              </div>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  // Generate gradient definitions
  const gradientDefs = dataKeys.map((key, index) => ({
    id: `gradient-${key}`,
    color: colors[index % colors.length]
  }))

  // Generate colors for data series
  const getAreaColor = (index: number) => colors[index % colors.length]

  return (
    <InteractiveChartWrapper
      title={title}
      description={description}
      chartType="area"
      data={data}
      dataKey={dataKeys[0]} // Primary data key
      nameKey={nameKey}
      height={height}
      showFilters={showFilters}
      showZoom={showZoom}
      showLegend={showLegend}
      showRefresh={showRefresh}
      filterOptions={filterOptions}
      onDataFilter={onDataFilter}
      onRefresh={onRefresh}
      realTimeUpdate={realTimeUpdate}
      updateInterval={updateInterval}
      className={className}
    >
      <AreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          {gradientDefs.map((gradient) => (
            <linearGradient key={gradient.id} id={gradient.id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradient.color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={gradient.color} stopOpacity={0.1}/>
            </linearGradient>
          ))}
        </defs>
        
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          opacity={0.3}
        />
        
        <XAxis 
          dataKey={nameKey} 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        
        <Tooltip content={<CustomAreaTooltip />} />
        
        {showLegend && (
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="rect"
            wrapperStyle={{ fontSize: '12px' }}
          />
        )}
        
        {/* Reference Lines */}
        {showReferenceLines && referenceLines.map((line, index) => (
          <ReferenceLine
            key={index}
            y={line.y}
            stroke={line.color || 'hsl(var(--muted-foreground))'}
            strokeDasharray="5 5"
            label={{ value: line.label, position: 'topRight' }}
          />
        ))}
        
        {/* Area Components */}
        {dataKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stackId={stacked ? "1" : undefined}
            stroke={getAreaColor(index)}
            fill={`url(#gradient-${key})`}
            strokeWidth={2}
            dot={{ 
              fill: getAreaColor(index), 
              strokeWidth: 2, 
              r: 4,
              style: { opacity: activeDataKey === key ? 1 : 0.6 }
            }}
            activeDot={{ 
              r: 6, 
              stroke: getAreaColor(index), 
              strokeWidth: 2,
              fill: 'hsl(var(--background))'
            }}
            style={{
              opacity: activeDataKey && activeDataKey !== key ? 0.3 : 1,
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={() => setActiveDataKey(key)}
            onMouseLeave={() => setActiveDataKey(null)}
          />
        ))}
        
        {/* Brush for zoom functionality */}
        <Brush
          dataKey={nameKey}
          height={30}
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.1}
          tickFormatter={(value) => String(value).slice(0, 10)}
        />
      </AreaChart>
    </InteractiveChartWrapper>
  )
}

export default InteractiveAreaChart
