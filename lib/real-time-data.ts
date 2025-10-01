/**
 * Real-Time Data Service
 * 
 * Provides real-time data updates for interactive charts
 * Features:
 * - WebSocket connection management
 * - Data polling with configurable intervals
 * - Event-driven updates
 * - Error handling and reconnection
 * - Data transformation and caching
 * - Performance optimization
 */

import { getTicketStats, getUserStats } from './admin'
// Analytics import removed

export interface RealTimeDataConfig {
  updateInterval: number
  enableWebSocket: boolean
  enablePolling: boolean
  maxRetries: number
  retryDelay: number
}

export interface DataUpdateEvent {
  type: 'tickets' | 'users' | 'system'
  data: any
  timestamp: Date
  source: 'websocket' | 'polling' | 'manual'
}

export type DataUpdateCallback = (event: DataUpdateEvent) => void

class RealTimeDataService {
  private config: RealTimeDataConfig
  private callbacks: Set<DataUpdateCallback> = new Set()
  private pollingInterval: NodeJS.Timeout | null = null
  private websocket: WebSocket | null = null
  private isConnected = false
  private retryCount = 0
  private lastUpdate: Record<string, Date> = {}

  constructor(config: Partial<RealTimeDataConfig> = {}) {
    this.config = {
      updateInterval: 30000, // 30 seconds
      enableWebSocket: false, // Disabled by default for demo
      enablePolling: true,
      maxRetries: 5,
      retryDelay: 5000,
      ...config
    }
  }

  /**
   * Subscribe to real-time data updates
   */
  subscribe(callback: DataUpdateCallback): () => void {
    this.callbacks.add(callback)
    
    // Start service if this is the first subscriber
    if (this.callbacks.size === 1) {
      this.start()
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback)
      
      // Stop service if no more subscribers
      if (this.callbacks.size === 0) {
        this.stop()
      }
    }
  }

  /**
   * Start the real-time data service
   */
  private start(): void {
    if (this.config.enableWebSocket) {
      this.connectWebSocket()
    }
    
    if (this.config.enablePolling) {
      this.startPolling()
    }
  }

  /**
   * Stop the real-time data service
   */
  private stop(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
    
    this.isConnected = false
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  private connectWebSocket(): void {
    try {
      // In a real application, this would connect to your WebSocket server
      // For demo purposes, we'll simulate WebSocket behavior
      this.websocket = new WebSocket('ws://localhost:8080/realtime')
      
      this.websocket.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.retryCount = 0
      }
      
      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleDataUpdate(data, 'websocket')
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      this.websocket.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        this.scheduleReconnect()
      }
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.scheduleReconnect()
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.scheduleReconnect()
    }
  }

  /**
   * Start polling for data updates
   */
  private startPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.pollData()
    }, this.config.updateInterval)
    
    // Initial poll
    this.pollData()
  }

  /**
   * Poll for updated data
   */
  private async pollData(): Promise<void> {
    try {
      // Simulate real-time data updates with slight variations
      const updates = await this.generateSimulatedUpdates()
      
      updates.forEach(update => {
        this.handleDataUpdate(update, 'polling')
      })
    } catch (error) {
      console.error('Error polling data:', error)
    }
  }

  /**
   * Generate simulated real-time updates
   * In a real application, this would fetch from your API
   */
  private async generateSimulatedUpdates(): Promise<DataUpdateEvent[]> {
    const updates: DataUpdateEvent[] = []
    const now = new Date()
    
    // Simulate ticket updates
    const ticketStats = getTicketStats()
    const simulatedTicketStats = {
      ...ticketStats,
      total: ticketStats.total + Math.floor(Math.random() * 3) - 1,
      open: Math.max(0, ticketStats.open + Math.floor(Math.random() * 2) - 1),
      resolved: ticketStats.resolved + Math.floor(Math.random() * 2)
    }
    
    updates.push({
      type: 'tickets',
      data: simulatedTicketStats,
      timestamp: now,
      source: 'polling'
    })
    
    // Simulate user updates
    const userStats = getUserStats()
    updates.push({
      type: 'users',
      data: userStats,
      timestamp: now,
      source: 'polling'
    })
    
    // Analytics updates removed
    
    return updates
  }

  /**
   * Handle incoming data updates
   */
  private handleDataUpdate(data: any, source: 'websocket' | 'polling' | 'manual'): void {
    const event: DataUpdateEvent = {
      type: data.type || 'tickets',
      data: data.data || data,
      timestamp: new Date(),
      source
    }
    
    // Update last update timestamp
    this.lastUpdate[event.type] = event.timestamp
    
    // Notify all subscribers
    this.callbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in data update callback:', error)
      }
    })
  }

  /**
   * Schedule WebSocket reconnection
   */
  private scheduleReconnect(): void {
    if (this.retryCount < this.config.maxRetries) {
      this.retryCount++
      setTimeout(() => {
        if (this.callbacks.size > 0) {
          this.connectWebSocket()
        }
      }, this.config.retryDelay * this.retryCount)
    }
  }

  /**
   * Manually trigger data refresh
   */
  async refreshData(type?: string): Promise<void> {
    try {
      const updates = await this.generateSimulatedUpdates()
      const filteredUpdates = type 
        ? updates.filter(update => update.type === type)
        : updates
      
      filteredUpdates.forEach(update => {
        this.handleDataUpdate(update, 'manual')
      })
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  /**
   * Get last update timestamp for a data type
   */
  getLastUpdate(type: string): Date | null {
    return this.lastUpdate[type] || null
  }

  /**
   * Check if service is connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  /**
   * Get current configuration
   */
  getConfig(): RealTimeDataConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RealTimeDataConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Restart service if needed
    if (this.callbacks.size > 0) {
      this.stop()
      this.start()
    }
  }
}

// Create singleton instance
export const realTimeDataService = new RealTimeDataService()

// Export types and utilities
export { DataUpdateEvent, DataUpdateCallback }

/**
 * Hook for using real-time data in React components
 */
export function useRealTimeData<T>(
  dataType: string,
  initialData: T,
  transform?: (data: any) => T
): [T, boolean, () => void] {
  const [data, setData] = React.useState<T>(initialData)
  const [isConnected, setIsConnected] = React.useState(false)
  
  React.useEffect(() => {
    const unsubscribe = realTimeDataService.subscribe((event) => {
      if (event.type === dataType) {
        const transformedData = transform ? transform(event.data) : event.data
        setData(transformedData)
        setIsConnected(true)
      }
    })
    
    return unsubscribe
  }, [dataType, transform])
  
  const refresh = React.useCallback(() => {
    realTimeDataService.refreshData(dataType)
  }, [dataType])
  
  return [data, isConnected, refresh]
}

// Import React for the hook
import React from 'react'
