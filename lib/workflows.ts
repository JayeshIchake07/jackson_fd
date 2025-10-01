// Workflow automation system
export type TriggerType = "ticket_created" | "ticket_updated" | "priority_changed" | "status_changed" | "comment_added"

export type ConditionOperator = "equals" | "not_equals" | "contains" | "greater_than" | "less_than"

export type ActionType =
  | "assign_agent"
  | "change_status"
  | "change_priority"
  | "send_email"
  | "add_comment"
  | "escalate"
  | "auto_reply"
  | "add_tag"

export interface WorkflowTrigger {
  id: string
  type: TriggerType
  label: string
}

export interface WorkflowCondition {
  id: string
  field: string
  operator: ConditionOperator
  value: string
}

export interface WorkflowAction {
  id: string
  type: ActionType
  label: string
  config: Record<string, any>
}

export interface Workflow {
  id: string
  name: string
  description: string
  enabled: boolean
  trigger: WorkflowTrigger
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  createdAt: Date
  updatedAt: Date
  executionCount: number
  successRate: number
}

// Mock workflows
export const mockWorkflows: Workflow[] = [
  {
    id: "WF-001",
    name: "Auto-assign Critical Network Issues",
    description: "Automatically assign critical network tickets to senior network engineer",
    enabled: true,
    trigger: {
      id: "trigger-1",
      type: "ticket_created",
      label: "When ticket is created",
    },
    conditions: [
      {
        id: "cond-1",
        field: "category",
        operator: "equals",
        value: "network",
      },
      {
        id: "cond-2",
        field: "priority",
        operator: "equals",
        value: "critical",
      },
    ],
    actions: [
      {
        id: "action-1",
        type: "assign_agent",
        label: "Assign to agent",
        config: { agentId: "2" },
      },
      {
        id: "action-2",
        type: "send_email",
        label: "Send email notification",
        config: { template: "critical_alert" },
      },
    ],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    executionCount: 12,
    successRate: 100,
  },
  {
    id: "WF-002",
    name: "Password Reset Auto-Reply",
    description: "Send self-service link for password reset requests",
    enabled: true,
    trigger: {
      id: "trigger-2",
      type: "ticket_created",
      label: "When ticket is created",
    },
    conditions: [
      {
        id: "cond-3",
        field: "title",
        operator: "contains",
        value: "password",
      },
      {
        id: "cond-4",
        field: "category",
        operator: "equals",
        value: "access",
      },
    ],
    actions: [
      {
        id: "action-3",
        type: "auto_reply",
        label: "Send auto-reply",
        config: { message: "Please use the self-service portal: https://reset.example.com" },
      },
      {
        id: "action-4",
        type: "add_tag",
        label: "Add tag",
        config: { tag: "auto-resolved" },
      },
    ],
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
    executionCount: 45,
    successRate: 95,
  },
]

export const getWorkflows = (): Workflow[] => {
  return mockWorkflows
}

export const getWorkflowById = (id: string): Workflow | undefined => {
  return mockWorkflows.find((w) => w.id === id)
}

export const createWorkflow = (
  workflow: Omit<Workflow, "id" | "createdAt" | "updatedAt" | "executionCount" | "successRate">,
): Workflow => {
  const newWorkflow: Workflow = {
    ...workflow,
    id: `WF-${String(mockWorkflows.length + 1).padStart(3, "0")}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    executionCount: 0,
    successRate: 0,
  }
  mockWorkflows.push(newWorkflow)
  return newWorkflow
}

export const updateWorkflow = (id: string, updates: Partial<Workflow>): boolean => {
  const index = mockWorkflows.findIndex((w) => w.id === id)
  if (index !== -1) {
    mockWorkflows[index] = {
      ...mockWorkflows[index],
      ...updates,
      updatedAt: new Date(),
    }
    return true
  }
  return false
}

export const deleteWorkflow = (id: string): boolean => {
  const index = mockWorkflows.findIndex((w) => w.id === id)
  if (index !== -1) {
    mockWorkflows.splice(index, 1)
    return true
  }
  return false
}

export const toggleWorkflow = (id: string): boolean => {
  const index = mockWorkflows.findIndex((w) => w.id === id)
  if (index !== -1) {
    mockWorkflows[index].enabled = !mockWorkflows[index].enabled
    mockWorkflows[index].updatedAt = new Date()
    return true
  }
  return false
}

// Available triggers, conditions, and actions for the builder
export const availableTriggers: Array<{ type: TriggerType; label: string; description: string }> = [
  { type: "ticket_created", label: "Ticket Created", description: "When a new ticket is submitted" },
  { type: "ticket_updated", label: "Ticket Updated", description: "When a ticket is modified" },
  { type: "priority_changed", label: "Priority Changed", description: "When ticket priority is updated" },
  { type: "status_changed", label: "Status Changed", description: "When ticket status changes" },
  { type: "comment_added", label: "Comment Added", description: "When a comment is posted" },
]

export const availableConditionFields = [
  { value: "category", label: "Category" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
  { value: "title", label: "Title" },
  { value: "description", label: "Description" },
  { value: "source", label: "Source" },
]

export const availableOperators: Array<{ value: ConditionOperator; label: string }> = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
]

export const availableActions: Array<{ type: ActionType; label: string; description: string; icon: string }> = [
  {
    type: "assign_agent",
    label: "Assign to Agent",
    description: "Assign ticket to a specific agent",
    icon: "user-plus",
  },
  { type: "change_status", label: "Change Status", description: "Update ticket status", icon: "refresh-cw" },
  { type: "change_priority", label: "Change Priority", description: "Update ticket priority", icon: "alert-triangle" },
  { type: "send_email", label: "Send Email", description: "Send email notification", icon: "mail" },
  { type: "add_comment", label: "Add Comment", description: "Post an internal comment", icon: "message-square" },
  { type: "escalate", label: "Escalate", description: "Escalate to higher priority", icon: "arrow-up" },
  { type: "auto_reply", label: "Auto Reply", description: "Send automated response to user", icon: "send" },
  { type: "add_tag", label: "Add Tag", description: "Add a tag to the ticket", icon: "tag" },
]
