"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { getTicketsByUser, getTicketStatusColor, getPriorityColor, type Ticket, type TicketStatus } from "@/lib/tickets"
import { Search, Filter, Calendar, User, MessageSquare } from "lucide-react"
import { format } from "date-fns"

export function TicketList() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all")

  useEffect(() => {
    if (user) {
      const userTickets = getTicketsByUser(user.id)
      setTickets(userTickets)
      setFilteredTickets(userTickets)
    }
  }, [user])

  useEffect(() => {
    let filtered = tickets

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter)
    }

    setFilteredTickets(filtered)
  }, [tickets, searchTerm, statusFilter])

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
            <SelectTrigger className="w-40">
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

      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No tickets found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "You haven't submitted any tickets yet"}
              </p>
              {!searchTerm && statusFilter === "all" && <Button variant="outline">Create Your First Ticket</Button>}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  )
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{ticket.title}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {ticket.id}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">{ticket.description}</CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className={getTicketStatusColor(ticket.status)}>
              {ticket.status.replace("-", " ").toUpperCase()}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
              {ticket.priority.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {format(ticket.createdAt, "MMM d, yyyy")}</span>
            </div>
            {ticket.assignedTo && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Assigned</span>
              </div>
            )}
            {ticket.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>
                  {ticket.comments.length} comment{ticket.comments.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="capitalize">{ticket.category}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
