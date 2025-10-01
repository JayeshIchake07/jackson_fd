"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import {
  getAllTickets,
  getTicketsByAgent,
  getUnassignedTickets,
  getTicketStatusColor,
  getPriorityColor,
  updateTicketStatus,
  assignTicket,
  type Ticket,
  type TicketStatus,
} from "@/lib/tickets"
import { TicketDetailModal } from "@/components/agent/ticket-detail-modal"
import { Search, Filter, Calendar, MessageSquare, Clock, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

export function AgentTicketList() {
  const { user } = useAuth()
  const [allTickets, setAllTickets] = useState<Ticket[]>([])
  const [myTickets, setMyTickets] = useState<Ticket[]>([])
  const [unassignedTickets, setUnassignedTickets] = useState<Ticket[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (user) {
      setAllTickets(getAllTickets())
      setMyTickets(getTicketsByAgent(user.id))
      setUnassignedTickets(getUnassignedTickets())
    }
  }, [user, refreshKey])

  const handleAssignToMe = async (ticketId: string) => {
    if (user && assignTicket(ticketId, user.id)) {
      setRefreshKey((prev) => prev + 1)
    }
  }

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    if (updateTicketStatus(ticketId, status)) {
      setRefreshKey((prev) => prev + 1)
    }
  }

  const filterTickets = (tickets: Ticket[]) => {
    let filtered = tickets

    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter)
    }

    return filtered
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(value: TicketStatus | "all") => setStatusFilter(value)}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="unassigned" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-14">
          <TabsTrigger value="unassigned" className="text-lg px-8">
            Unassigned ({unassignedTickets.length})
          </TabsTrigger>
          <TabsTrigger value="my-tickets" className="text-lg px-8">
            My Tickets ({myTickets.length})
          </TabsTrigger>
          <TabsTrigger value="all-tickets" className="text-lg px-8">
            All Tickets ({allTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unassigned" className="space-y-4">
          <TicketGrid
            tickets={filterTickets(unassignedTickets)}
            onAssignToMe={handleAssignToMe}
            onStatusChange={handleStatusChange}
            onTicketClick={setSelectedTicket}
            showAssignButton={true}
          />
        </TabsContent>

        <TabsContent value="my-tickets" className="space-y-4">
          <TicketGrid
            tickets={filterTickets(myTickets)}
            onStatusChange={handleStatusChange}
            onTicketClick={setSelectedTicket}
            showAssignButton={false}
          />
        </TabsContent>

        <TabsContent value="all-tickets" className="space-y-4">
          <TicketGrid
            tickets={filterTickets(allTickets)}
            onStatusChange={handleStatusChange}
            onTicketClick={setSelectedTicket}
            showAssignButton={false}
          />
        </TabsContent>
      </Tabs>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={() => {
            setRefreshKey((prev) => prev + 1)
            setSelectedTicket(null)
          }}
        />
      )}
    </div>
  )
}

interface TicketGridProps {
  tickets: Ticket[]
  onAssignToMe?: (ticketId: string) => void
  onStatusChange: (ticketId: string, status: TicketStatus) => void
  onTicketClick: (ticket: Ticket) => void
  showAssignButton: boolean
}

function TicketGrid({ tickets, onAssignToMe, onStatusChange, onTicketClick, showAssignButton }: TicketGridProps) {
  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No tickets found</h3>
            <p className="text-muted-foreground">No tickets match your current filters</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tickets.map((ticket) => (
        <AgentTicketCard
          key={ticket.id}
          ticket={ticket}
          onAssignToMe={onAssignToMe}
          onStatusChange={onStatusChange}
          onTicketClick={onTicketClick}
          showAssignButton={showAssignButton}
        />
      ))}
    </div>
  )
}

interface AgentTicketCardProps {
  ticket: Ticket
  onAssignToMe?: (ticketId: string) => void
  onStatusChange: (ticketId: string, status: TicketStatus) => void
  onTicketClick: (ticket: Ticket) => void
  showAssignButton: boolean
}

function AgentTicketCard({
  ticket,
  onAssignToMe,
  onStatusChange,
  onTicketClick,
  showAssignButton,
}: AgentTicketCardProps) {
  const getUrgencyIndicator = () => {
    const hoursOld = (Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60)
    if (ticket.priority === "critical" && hoursOld > 1) return "urgent"
    if (ticket.priority === "high" && hoursOld > 4) return "urgent"
    if (hoursOld > 24) return "overdue"
    return "normal"
  }

  const urgency = getUrgencyIndicator()

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer ${
        urgency === "urgent" ? "border-red-500/50" : urgency === "overdue" ? "border-yellow-500/50" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base line-clamp-1">{ticket.title}</CardTitle>
              {urgency === "urgent" && <AlertTriangle className="h-4 w-4 text-red-500" />}
              {urgency === "overdue" && <Clock className="h-4 w-4 text-yellow-500" />}
            </div>
            <Badge variant="outline" className="text-xs w-fit">
              {ticket.id}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className={`text-xs ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority.toUpperCase()}
            </Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-2 text-sm">{ticket.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(ticket.createdAt, "MMM d")}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="capitalize">{ticket.category}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className={getTicketStatusColor(ticket.status)}>
              {ticket.status.replace("-", " ").toUpperCase()}
            </Badge>
            {ticket.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{ticket.comments.length}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {showAssignButton && onAssignToMe && (
              <Button size="sm" variant="outline" onClick={() => onAssignToMe(ticket.id)} className="flex-1">
                Assign to Me
              </Button>
            )}
            <Button size="sm" onClick={() => onTicketClick(ticket)} className="flex-1">
              View Details
            </Button>
          </div>

          {!showAssignButton && (
            <Select value={ticket.status} onValueChange={(value: TicketStatus) => onStatusChange(ticket.id, value)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
