"use client"

import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FeedbackDialog } from "@/components/tickets/feedback-dialog"
import { useAuth } from "@/hooks/use-auth"
import {
  getAllTickets,
  getTicketStatusColor,
  getPriorityColor,
  getSourceColor,
  bulkUpdateStatus,
  bulkAssignTickets,
  bulkDeleteTickets,
  type Ticket,
  type TicketStatus,
  type TicketPriority,
  type TicketCategory,
  type TicketSource,
} from "@/lib/tickets"
import {
  Search,
  Filter,
  Calendar,
  MessageSquare,
  ArrowUpDown,
  CheckSquare,
  Trash2,
  UserPlus,
  RefreshCw,
  Star,
} from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

type SortField = "createdAt" | "updatedAt" | "priority" | "status" | "title"
type SortOrder = "asc" | "desc"

export function UnifiedTicketList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "all">("all")
  const [sourceFilter, setSourceFilter] = useState<TicketSource | "all">("all")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [refreshKey, setRefreshKey] = useState(0)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [selectedTicketForFeedback, setSelectedTicketForFeedback] = useState<Ticket | null>(null)

  useEffect(() => {
    setTickets(getAllTickets())
  }, [refreshKey])

  // Advanced filtering and sorting
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.priority === priorityFilter)
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.category === categoryFilter)
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.source === sourceFilter)
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "createdAt":
        case "updatedAt":
          comparison = a[sortField].getTime() - b[sortField].getTime()
          break
        case "priority":
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return sorted
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter, sourceFilter, sortField, sortOrder])

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedTickets.size === filteredAndSortedTickets.length) {
      setSelectedTickets(new Set())
    } else {
      setSelectedTickets(new Set(filteredAndSortedTickets.map((t) => t.id)))
    }
  }

  const handleSelectTicket = (ticketId: string) => {
    const newSelected = new Set(selectedTickets)
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId)
    } else {
      newSelected.add(ticketId)
    }
    setSelectedTickets(newSelected)
  }

  const handleBulkStatusUpdate = (status: TicketStatus) => {
    if (selectedTickets.size === 0) return

    bulkUpdateStatus(Array.from(selectedTickets), status)
    toast({
      title: "Tickets updated",
      description: `${selectedTickets.size} ticket(s) updated to ${status}`,
    })
    setSelectedTickets(new Set())
    setRefreshKey((prev) => prev + 1)
  }

  const handleBulkAssign = () => {
    if (selectedTickets.size === 0 || !user) return

    bulkAssignTickets(Array.from(selectedTickets), user.id)
    toast({
      title: "Tickets assigned",
      description: `${selectedTickets.size} ticket(s) assigned to you`,
    })
    setSelectedTickets(new Set())
    setRefreshKey((prev) => prev + 1)
  }

  const handleBulkDelete = () => {
    if (selectedTickets.size === 0) return

    bulkDeleteTickets(Array.from(selectedTickets))
    toast({
      title: "Tickets deleted",
      description: `${selectedTickets.size} ticket(s) deleted`,
      variant: "destructive",
    })
    setSelectedTickets(new Set())
    setRefreshKey((prev) => prev + 1)
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const handleProvideFeedback = (ticket: Ticket) => {
    setSelectedTicketForFeedback(ticket)
    setFeedbackDialogOpen(true)
  }

  const handleFeedbackSubmitted = () => {
    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback!",
    })
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets by title, description, ID, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setRefreshKey((prev) => prev + 1)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(value: TicketStatus | "all") => setStatusFilter(value)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
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

          <Select value={priorityFilter} onValueChange={(value: TicketPriority | "all") => setPriorityFilter(value)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(value: TicketCategory | "all") => setCategoryFilter(value)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="network">Network</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="access">Access</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={(value: TicketSource | "all") => setSourceFilter(value)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="portal">Portal</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="chatbot">Chatbot</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="api">API</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedTickets.size > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                <span className="font-medium">{selectedTickets.size} ticket(s) selected</span>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Update Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("open")}>Open</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("in-progress")}>
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("resolved")}>Resolved</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("closed")}>Closed</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {user?.role === "agent" && (
                  <Button variant="outline" size="sm" onClick={handleBulkAssign}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign to Me
                  </Button>
                )}
                {user?.role === "admin" && (
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort Controls */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowUpDown className="h-4 w-4" />
        <span>Sort by:</span>
        <Button variant="ghost" size="sm" onClick={() => toggleSort("createdAt")}>
          Created {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => toggleSort("priority")}>
          Priority {sortField === "priority" && (sortOrder === "asc" ? "↑" : "↓")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => toggleSort("status")}>
          Status {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => toggleSort("updatedAt")}>
          Updated {sortField === "updatedAt" && (sortOrder === "asc" ? "↑" : "↓")}
        </Button>
      </div>

      {/* Ticket List */}
      {filteredAndSortedTickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No tickets found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Checkbox
              checked={selectedTickets.size === filteredAndSortedTickets.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>
          {filteredAndSortedTickets.map((ticket) => (
            <UnifiedTicketCard
              key={ticket.id}
              ticket={ticket}
              isSelected={selectedTickets.has(ticket.id)}
              onSelect={handleSelectTicket}
              onProvideFeedback={handleProvideFeedback}
            />
          ))}
        </div>
      )}

      {selectedTicketForFeedback && (
        <FeedbackDialog
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          ticketId={selectedTicketForFeedback.id}
          ticketTitle={selectedTicketForFeedback.title}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  )
}

interface UnifiedTicketCardProps {
  ticket: Ticket
  isSelected: boolean
  onSelect: (ticketId: string) => void
  onProvideFeedback: (ticket: Ticket) => void
}

function UnifiedTicketCard({ ticket, isSelected, onSelect, onProvideFeedback }: UnifiedTicketCardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${isSelected ? "border-primary" : ""}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Checkbox checked={isSelected} onCheckedChange={() => onSelect(ticket.id)} className="mt-1" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-lg">{ticket.title}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {ticket.id}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getSourceColor(ticket.source)}`}>
                    {ticket.source}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{ticket.description}</CardDescription>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Badge variant="outline" className={getTicketStatusColor(ticket.status)}>
                  {ticket.status.replace("-", " ").toUpperCase()}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                  {ticket.priority.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {format(ticket.createdAt, "MMM d, yyyy")}</span>
            </div>
            {ticket.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>
                  {ticket.comments.length} comment{ticket.comments.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            <Badge variant="outline" className="text-xs">
              {ticket.category}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {ticket.tags && ticket.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {ticket.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {ticket.status === "resolved" && !ticket.feedback && (
              <Button variant="outline" size="sm" onClick={() => onProvideFeedback(ticket)}>
                <Star className="h-4 w-4 mr-1" />
                Rate
              </Button>
            )}
            {ticket.feedback && (
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-yellow-500" />
                <span className="text-xs font-medium">{ticket.feedback.rating}/5</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
