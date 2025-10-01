"use client"

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Brush, ReferenceLine } from 'recharts'
import { InteractiveChartWrapper } from './interactive-chart-wrapper'

/**
 * Interactive Bar Chart Component
 * 
 * Features:
 * - Horizontal and vertical bar chart support
 * - Interactive tooltips with detailed information
 * - Zoom and pan functionality
 * - Dynamic filtering
 * - Real-time updates
 * - Responsive design
 * - Accessibility support
 * 
 * @param props - Chart configuration
 */
interface InteractiveBarChartProps {
  title: string
  description: string
  data: any[]
  dataKey: string
  nameKey?: string
  layout?: 'horizontal' | 'vertical'
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
  showReferenceLines?: boolean
  referenceLines?: Array<{
    y: number
    label: string
    color?: string
  }>
}

export function InteractiveBarChart({
  title,
  description,
  data,
  dataKey,
  nameKey = 'name',
  layout = 'vertical',
  showReferenceLines = false,
  referenceLines = [],
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
  className = ''
}: InteractiveBarChartProps) {
  
  // Enhanced tooltip for bar charts
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0)
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 max-w-xs">
          <p className="font-semibold text-foreground mb-3 border-b border-border pb-2">
            {label}
          </p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
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
                    ({((entry.value / total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-border">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Total:</span>
              <span className="font-medium">{total}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Generate colors for data points
  const getBarColor = (index: number) => colors[index % colors.length]

  return (
    <InteractiveChartWrapper
      title={title}
      description={description}
      chartType={layout === 'horizontal' ? 'horizontalBar' : 'bar'}
      data={data}
      dataKey={dataKey}
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
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 20, right: 30, left: layout === 'horizontal' ? 100 : 20, bottom: 5 }}
      >
        {showReferenceLines && referenceLines && referenceLines.map((line, index) => (
          <ReferenceLine 
            key={`ref-line-${index}`}
            y={line.y} 
            label={line.label} 
            stroke={line.color || 'hsl(var(--info))'}
            strokeDasharray="3 3"
          />
        ))}
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          opacity={0.3}
        />
        
        {layout === 'horizontal' ? (
          <>
            <XAxis 
              type="number" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              dataKey={nameKey} 
              type="category" 
              width={100}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
          </>
        ) : (
          <>
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
          </>
        )}
        
        <Tooltip content={<CustomBarTooltip />} />
        
        <Bar 
          dataKey={dataKey} 
          radius={layout === 'horizontal' ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          strokeWidth={1}
          stroke="hsl(var(--background))"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(index)} />
          ))}
        </Bar>
        
        {/* Brush for zoom functionality */}
        <Brush
          dataKey={nameKey}
          height={30}
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.1}
          tickFormatter={(value) => String(value).slice(0, 10)}
        />
      </BarChart>
    </InteractiveChartWrapper>
  )
}

export default InteractiveBarChart
