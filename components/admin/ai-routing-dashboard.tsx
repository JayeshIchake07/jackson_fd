"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeTicketTrends } from "@/lib/ai-routing"
import { getAllTickets } from "@/lib/tickets"
import { Brain, Clock, Bot, Users, AlertTriangle, CheckCircle2, ArrowRight, Activity, Zap } from "lucide-react"

export function AIRoutingDashboard() {
  const [trends, setTrends] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTrends = async () => {
      const tickets = getAllTickets()
      const trendData = await analyzeTicketTrends(tickets)
      setTrends(trendData)
      setIsLoading(false)
    }

    loadTrends()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Classification & Routing</h2>
        <p className="text-muted-foreground">Intelligent ticket routing powered by NLP and sentiment analysis</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Classification Rate</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <Progress value={94} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Accuracy in auto-classification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chatbot Success Rate</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(trends.chatbotSuccessRate * 100).toFixed(0)}%</div>
            <Progress value={trends.chatbotSuccessRate * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Resolved without agent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trends.averageResolutionTime}h</div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-green-500">↓ 15%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Routing Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <Progress value={87} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Correctly routed tickets</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="routing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="routing">Routing Rules</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="routing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Routing Rules</CardTitle>
              <CardDescription>AI-powered decision logic for ticket assignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RoutingRuleCard
                title="Critical Priority → Agent"
                description="Tickets marked as critical are immediately assigned to available agents"
                icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
                status="active"
                successRate={98}
              />

              <RoutingRuleCard
                title="Simple Issues → Chatbot"
                description="Low complexity tickets are routed to AI chatbot for automated resolution"
                icon={<Bot className="h-5 w-5 text-blue-500" />}
                status="active"
                successRate={68}
              />

              <RoutingRuleCard
                title="Negative Sentiment → Agent"
                description="Tickets with negative sentiment are escalated to human agents"
                icon={<Users className="h-5 w-5 text-orange-500" />}
                status="active"
                successRate={92}
              />

              <RoutingRuleCard
                title="Password Reset → Auto-Resolve"
                description="Common password reset requests are auto-resolved with self-service links"
                icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                status="active"
                successRate={85}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Routing Flow Visualization</CardTitle>
              <CardDescription>How tickets are automatically classified and routed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 p-4 bg-muted rounded-lg">
                    <p className="font-medium">New Ticket</p>
                    <p className="text-sm text-muted-foreground">Submitted by user</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 p-4 bg-primary/10 rounded-lg">
                    <p className="font-medium">AI Classification</p>
                    <p className="text-sm text-muted-foreground">NLP + Sentiment Analysis</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 p-4 bg-muted rounded-lg">
                    <p className="font-medium">Routing Decision</p>
                    <p className="text-sm text-muted-foreground">Agent / Chatbot / Auto</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardContent className="pt-6">
                      <Bot className="h-8 w-8 text-blue-500 mb-2" />
                      <p className="font-medium">Chatbot</p>
                      <p className="text-2xl font-bold">45%</p>
                      <p className="text-xs text-muted-foreground">of tickets</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-500/10 border-green-500/20">
                    <CardContent className="pt-6">
                      <Users className="h-8 w-8 text-green-500 mb-2" />
                      <p className="font-medium">Agent</p>
                      <p className="text-2xl font-bold">40%</p>
                      <p className="text-xs text-muted-foreground">of tickets</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-500/10 border-purple-500/20">
                    <CardContent className="pt-6">
                      <CheckCircle2 className="h-8 w-8 text-purple-500 mb-2" />
                      <p className="font-medium">Auto-Resolved</p>
                      <p className="text-2xl font-bold">15%</p>
                      <p className="text-xs text-muted-foreground">of tickets</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Issues</CardTitle>
              <CardDescription>Most frequent ticket types detected by AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.commonIssues.map((issue: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{issue.issue}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {issue.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{issue.count} tickets</span>
                      </div>
                    </div>
                    <Progress value={(issue.count / 50) * 100} className="w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
              <CardDescription>When tickets are most frequently submitted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {Array.from({ length: 24 }, (_, i) => {
                  const isPeak = trends.peakHours.includes(i)
                  const height = isPeak ? 100 : Math.random() * 60 + 20
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t ${isPeak ? "bg-primary" : "bg-muted"}`}
                        style={{ height: `${height}%` }}
                      />
                      {isPeak && <span className="text-xs font-medium">{i}:00</span>}
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Peak hours: {trends.peakHours.map((h: number) => `${h}:00`).join(", ")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
              <CardDescription>Real-time sentiment analysis of incoming tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full" />
                    <span className="font-medium">Positive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={35} className="w-32" />
                    <span className="text-sm font-medium">35%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-gray-500 rounded-full" />
                    <span className="font-medium">Neutral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={50} className="w-32" />
                    <span className="text-sm font-medium">50%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-red-500 rounded-full" />
                    <span className="font-medium">Negative</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={15} className="w-32" />
                    <span className="text-sm font-medium">15%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <p className="font-medium">Sentiment Insights</p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Negative sentiment tickets are automatically escalated to senior agents</li>
                  <li>• Positive sentiment correlates with 23% faster resolution times</li>
                  <li>• Real-time monitoring helps identify frustrated users early</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Escalation Triggers</CardTitle>
              <CardDescription>Conditions that automatically escalate tickets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div>
                  <p className="font-medium">Strong Negative Sentiment</p>
                  <p className="text-sm text-muted-foreground">Words like "frustrated", "angry", "unacceptable"</p>
                </div>
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                  High Priority
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div>
                  <p className="font-medium">Multiple Follow-ups</p>
                  <p className="text-sm text-muted-foreground">User has commented 3+ times without resolution</p>
                </div>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                  Medium Priority
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div>
                  <p className="font-medium">Extended Wait Time</p>
                  <p className="text-sm text-muted-foreground">Ticket open for more than 24 hours</p>
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  Low Priority
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface RoutingRuleCardProps {
  title: string
  description: string
  icon: React.ReactNode
  status: "active" | "inactive"
  successRate: number
}

function RoutingRuleCard({ title, description, icon, status, successRate }: RoutingRuleCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
      <div className="p-2 bg-background rounded-lg">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="font-medium">{title}</p>
          <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <div className="flex items-center gap-2">
          <Progress value={successRate} className="flex-1" />
          <span className="text-sm font-medium">{successRate}%</span>
        </div>
      </div>
    </div>
  )
}
