"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTicketStats, getUserStats, type TicketStats, type UserStats } from "@/lib/admin"
import { Users, Ticket, Clock, TrendingUp } from "lucide-react"

/**
 * Simple Admin Dashboard Component
 * 
 * Features:
 * - Basic system overview
 * - Key metrics display
 */
export function AdminDashboard() {
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)

  // Initialize data
  useEffect(() => {
    setTicketStats(getTicketStats())
    setUserStats(getUserStats())
  }, [])

  if (!ticketStats || !userStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">System overview and key metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {ticketStats.open} open, {ticketStats.inProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.agents} agents, {userStats.employees} employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketStats.avgResolutionTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">{ticketStats.responseTime}h avg response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(((ticketStats.resolved + ticketStats.closed) / ticketStats.total) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {ticketStats.resolved + ticketStats.closed} of {ticketStats.total} resolved
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}