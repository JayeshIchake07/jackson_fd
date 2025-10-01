"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTicketsByAgent, getAllTickets, getUnassignedTickets, type Ticket } from "@/lib/tickets"
import { useAuth } from "@/hooks/use-auth"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts"
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  MessageSquare,
  Calendar,
  User,
  Users,
  Target
} from "lucide-react"
import { format } from "date-fns"

export function AgentDashboard() {
  const { user } = useAuth()
  const [myTickets, setMyTickets] = useState<Ticket[]>([])
  const [allTickets, setAllTickets] = useState<Ticket[]>([])
  const [unassignedTickets, setUnassignedTickets] = useState<Ticket[]>([])

  useEffect(() => {
    if (user) {
      setMyTickets(getTicketsByAgent(user.id))
      setAllTickets(getAllTickets())
      setUnassignedTickets(getUnassignedTickets())
    }
  }, [user])

  if (!user) return null

  // Calculate agent-specific metrics
  const totalAssignedTickets = myTickets.length
  const openTickets = myTickets.filter(t => t.status === "open").length
  const inProgressTickets = myTickets.filter(t => t.status === "in-progress").length
  const resolvedTickets = myTickets.filter(t => t.status === "resolved" || t.status === "closed").length
  
  // Calculate average resolution time for resolved tickets
  const resolvedTicketsWithTime = myTickets.filter(t => 
    (t.status === "resolved" || t.status === "closed") && t.resolvedAt
  )
  const avgResolutionTime = resolvedTicketsWithTime.length > 0
    ? resolvedTicketsWithTime.reduce((sum, t) => {
        const created = new Date(t.createdAt).getTime()
        const resolved = new Date(t.resolvedAt!).getTime()
        return sum + (resolved - created) / (1000 * 60 * 60) // Convert to hours
      }, 0) / resolvedTicketsWithTime.length
    : 0

  // Calculate satisfaction score from feedback
  const ticketsWithFeedback = myTickets.filter(t => t.feedback?.rating)
  const satisfactionScore = ticketsWithFeedback.length > 0
    ? (ticketsWithFeedback.reduce((sum, t) => sum + (t.feedback?.rating || 0), 0) / ticketsWithFeedback.length) * 20
    : 0

  // Category distribution for agent tickets
  const categoryData = myTickets.reduce((acc, ticket) => {
    acc[ticket.category] = (acc[ticket.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryChartData = Object.entries(categoryData).map(([category, count], index) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
    fill: `hsl(${index * 45}, 70%, 50%)`
  }))

  // Priority distribution
  const priorityData = myTickets.reduce((acc, ticket) => {
    acc[ticket.priority] = (acc[ticket.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const priorityChartData = Object.entries(priorityData).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count,
    fill: priority === "critical" ? "#ef4444" : 
          priority === "high" ? "#f97316" : 
          priority === "medium" ? "#3b82f6" : "#10b981"
  }))

  // Weekly performance trend
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split("T")[0]
    
    const created = myTickets.filter(t => 
      t.createdAt.toISOString().split("T")[0] === dateStr
    ).length
    
    const resolved = myTickets.filter(t => 
      t.resolvedAt && t.resolvedAt.toISOString().split("T")[0] === dateStr
    ).length
    
    return { 
      date: format(date, "MMM d"), 
      created,
      resolved
    }
  })

  // Status distribution
  const statusData = [
    { name: "Open", value: openTickets, fill: "#ef4444" },
    { name: "In Progress", value: inProgressTickets, fill: "#f97316" },
    { name: "Resolved", value: resolvedTickets, fill: "#10b981" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Agent Dashboard</h2>
        <p className="text-muted-foreground">Your ticket management overview and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignedTickets}</div>
            <p className="text-xs text-muted-foreground">
              {openTickets} open, {inProgressTickets} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Tickets</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{resolvedTickets}</div>
            <p className="text-xs text-muted-foreground">
              {totalAssignedTickets > 0 ? Math.round((resolvedTickets / totalAssignedTickets) * 100) : 0}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResolutionTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              For resolved tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{satisfactionScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Based on {ticketsWithFeedback.length} feedback responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{unassignedTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              Available for assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total System Tickets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Workload</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {allTickets.length > 0 ? Math.round((totalAssignedTickets / allTickets.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Of total system tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Tickets by Category</CardTitle>
            <CardDescription>Distribution of your assigned tickets</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium">No Assigned Tickets</p>
                  <p className="text-sm">You haven't been assigned any tickets yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance Trend</CardTitle>
            <CardDescription>Your ticket resolution activity this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="url(#createdGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="1"
                  stroke="#10b981"
                  fill="url(#resolvedGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assigned Tickets</CardTitle>
          <CardDescription>Your latest ticket assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myTickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Ticket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.category} • {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={ticket.priority === "critical" ? "destructive" : 
                                 ticket.priority === "high" ? "default" : "secondary"}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant="outline">
                    {ticket.status}
                  </Badge>
                </div>
              </div>
            ))}
            {myTickets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No assigned tickets</p>
                <p className="text-sm">You haven't been assigned any tickets yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
