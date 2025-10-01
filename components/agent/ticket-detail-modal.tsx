"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { type Ticket, type TicketStatus, getPriorityColor, updateTicketStatus, addTicketComment } from "@/lib/tickets"
import { Calendar, User, MessageSquare, Send, Clock } from "lucide-react"
import { format } from "date-fns"

interface TicketDetailModalProps {
  ticket: Ticket
  onClose: () => void
  onUpdate: () => void
}

export function TicketDetailModal({ ticket, onClose, onUpdate }: TicketDetailModalProps) {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStatusChange = async (status: TicketStatus) => {
    if (updateTicketStatus(ticket.id, status)) {
      onUpdate()
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      if (addTicketComment(ticket.id, user.id, user.name, user.role, newComment.trim())) {
        setNewComment("")
        onUpdate()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="block w-full max-w-[95vw] lg:max-w-[1400px] max-h-[98vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{ticket.title}</span>
            <Badge variant="outline" className="text-xs">
              {ticket.id}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {/* Main Content */}
          <div className="lg:col-span-3 xl:col-span-4 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({ticket.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.comments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No comments yet</p>
                ) : (
                  <div className="space-y-4">
                    {ticket.comments.map((comment) => (
                      <div key={comment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.userName}</span>
                            <Badge variant="outline" className="text-xs">
                              {comment.userRole}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(comment.createdAt, "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Add Comment */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim() || isSubmitting} size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Adding..." : "Add Comment"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status & Priority */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status & Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={ticket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Badge variant="outline" className={`w-full justify-center ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Badge variant="outline" className="w-full justify-center">
                    {ticket.category.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-muted-foreground">{format(ticket.createdAt, "MMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-muted-foreground">{format(ticket.updatedAt, "MMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Submitted By</p>
                    <p className="text-muted-foreground">Employee #{ticket.submittedBy}</p>
                  </div>
                </div>

                {ticket.assignedTo && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Assigned To</p>
                      <p className="text-muted-foreground">Agent #{ticket.assignedTo}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
