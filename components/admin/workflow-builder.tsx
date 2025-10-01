"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  getWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  toggleWorkflow,
  availableTriggers,
  availableConditionFields,
  availableOperators,
  availableActions,
  type Workflow,
  type WorkflowTrigger,
  type WorkflowCondition,
  type WorkflowAction,
  type TriggerType,
  type ActionType,
  type ConditionOperator,
} from "@/lib/workflows"
import { Plus, Trash2, Play, Edit, Zap, GitBranch, CheckCircle2, ArrowRight, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setWorkflows(getWorkflows())
  }, [])

  const handleToggle = (id: string) => {
    toggleWorkflow(id)
    setWorkflows(getWorkflows())
    toast({
      title: "Workflow updated",
      description: "Workflow status has been changed",
    })
  }

  const handleDelete = (id: string) => {
    deleteWorkflow(id)
    setWorkflows(getWorkflows())
    toast({
      title: "Workflow deleted",
      description: "The workflow has been removed",
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workflow Automation</h2>
          <p className="text-muted-foreground">Create no-code automation rules for ticket management</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>Build automated ticket handling rules without code</DialogDescription>
            </DialogHeader>
            <WorkflowEditor
              onSave={(workflow) => {
                createWorkflow(workflow)
                setWorkflows(getWorkflows())
                setIsCreating(false)
                toast({
                  title: "Workflow created",
                  description: "Your automation workflow has been created successfully",
                })
              }}
              onCancel={() => setIsCreating(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflow Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.filter((w) => w.enabled).length}</div>
            <p className="text-xs text-muted-foreground">Out of {workflows.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.reduce((sum, w) => sum + w.executionCount, 0)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows.length > 0
                ? Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Average across all workflows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24h</div>
            <p className="text-xs text-muted-foreground">Estimated this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow List */}
      <div className="space-y-4">
        {workflows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
              <p className="text-muted-foreground mb-4">Create your first automation workflow to get started</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workflow
              </Button>
            </CardContent>
          </Card>
        ) : (
          workflows.map((workflow) => (
            <Card key={workflow.id} className={workflow.enabled ? "" : "opacity-60"}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {workflow.id}
                      </Badge>
                      {workflow.enabled ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <CardDescription>{workflow.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={workflow.enabled} onCheckedChange={() => handleToggle(workflow.id)} />
                    <Button variant="ghost" size="sm" onClick={() => setEditingWorkflow(workflow)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(workflow.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Workflow Visualization */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      {workflow.trigger.label}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    {workflow.conditions.length > 0 && (
                      <>
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          {workflow.conditions.length} condition{workflow.conditions.length !== 1 ? "s" : ""}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </>
                    )}
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      {workflow.actions.length} action{workflow.actions.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      <span>{workflow.executionCount} executions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{workflow.successRate}% success rate</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {editingWorkflow && (
        <Dialog open={!!editingWorkflow} onOpenChange={() => setEditingWorkflow(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Workflow</DialogTitle>
              <DialogDescription>Modify your automation workflow</DialogDescription>
            </DialogHeader>
            <WorkflowEditor
              workflow={editingWorkflow}
              onSave={(workflow) => {
                updateWorkflow(editingWorkflow.id, workflow)
                setWorkflows(getWorkflows())
                setEditingWorkflow(null)
                toast({
                  title: "Workflow updated",
                  description: "Your changes have been saved",
                })
              }}
              onCancel={() => setEditingWorkflow(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface WorkflowEditorProps {
  workflow?: Workflow
  onSave: (workflow: Omit<Workflow, "id" | "createdAt" | "updatedAt" | "executionCount" | "successRate">) => void
  onCancel: () => void
}

function WorkflowEditor({ workflow, onSave, onCancel }: WorkflowEditorProps) {
  const [name, setName] = useState(workflow?.name || "")
  const [description, setDescription] = useState(workflow?.description || "")
  const [enabled, setEnabled] = useState(workflow?.enabled ?? true)
  const [trigger, setTrigger] = useState<WorkflowTrigger>(
    workflow?.trigger || {
      id: "trigger-1",
      type: "ticket_created",
      label: "When ticket is created",
    },
  )
  const [conditions, setConditions] = useState<WorkflowCondition[]>(workflow?.conditions || [])
  const [actions, setActions] = useState<WorkflowAction[]>(workflow?.actions || [])

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        id: `cond-${Date.now()}`,
        field: "category",
        operator: "equals",
        value: "",
      },
    ])
  }

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id))
  }

  const updateCondition = (id: string, updates: Partial<WorkflowCondition>) => {
    setConditions(conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const addAction = (type: ActionType) => {
    const actionDef = availableActions.find((a) => a.type === type)
    if (!actionDef) return

    setActions([
      ...actions,
      {
        id: `action-${Date.now()}`,
        type,
        label: actionDef.label,
        config: {},
      },
    ])
  }

  const removeAction = (id: string) => {
    setActions(actions.filter((a) => a.id !== id))
  }

  const updateAction = (id: string, updates: Partial<WorkflowAction>) => {
    setActions(actions.map((a) => (a.id === id ? { ...a, ...updates } : a)))
  }

  const handleSave = () => {
    if (!name || !trigger || actions.length === 0) {
      return
    }

    onSave({
      name,
      description,
      enabled,
      trigger,
      conditions,
      actions,
    })
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Workflow Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Auto-assign Critical Tickets"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what this workflow does..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={enabled} onCheckedChange={setEnabled} />
          <Label>Enable workflow immediately</Label>
        </div>
      </div>

      <Separator />

      {/* Trigger */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <h3 className="font-medium">Trigger</h3>
            <p className="text-sm text-muted-foreground">When should this workflow run?</p>
          </div>
        </div>

        <Select
          value={trigger.type}
          onValueChange={(value: TriggerType) => {
            const triggerDef = availableTriggers.find((t) => t.type === value)
            if (triggerDef) {
              setTrigger({
                id: trigger.id,
                type: value,
                label: triggerDef.label,
              })
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableTriggers.map((t) => (
              <SelectItem key={t.type} value={t.type}>
                <div>
                  <p className="font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Conditions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <GitBranch className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-medium">Conditions</h3>
              <p className="text-sm text-muted-foreground">Optional filters for when to run</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={addCondition}>
            <Plus className="mr-2 h-4 w-4" />
            Add Condition
          </Button>
        </div>

        {conditions.length === 0 ? (
          <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
            No conditions - workflow will run for all triggers
          </div>
        ) : (
          <div className="space-y-2">
            {conditions.map((condition, index) => (
              <div key={condition.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                {index > 0 && <span className="text-sm font-medium text-muted-foreground">AND</span>}
                <Select
                  value={condition.field}
                  onValueChange={(value) => updateCondition(condition.id, { field: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableConditionFields.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={condition.operator}
                  onValueChange={(value: ConditionOperator) => updateCondition(condition.id, { operator: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOperators.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                  className="flex-1"
                />

                <Button variant="ghost" size="sm" onClick={() => removeCondition(condition.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium">Actions *</h3>
              <p className="text-sm text-muted-foreground">What should happen?</p>
            </div>
          </div>
          <Select onValueChange={(value: ActionType) => addAction(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Add action..." />
            </SelectTrigger>
            <SelectContent>
              {availableActions.map((a) => (
                <SelectItem key={a.type} value={a.type}>
                  <div>
                    <p className="font-medium">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {actions.length === 0 ? (
          <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
            Add at least one action to complete the workflow
          </div>
        ) : (
          <div className="space-y-2">
            {actions.map((action, index) => (
              <div key={action.id} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {index + 1}. {action.label}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeAction(action.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Configure action..."
                    className="text-sm"
                    value={JSON.stringify(action.config)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value)
                        updateAction(action.id, { config })
                      } catch (e) {
                        // Invalid JSON, ignore
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!name || actions.length === 0}>
          Save Workflow
        </Button>
      </div>
    </div>
  )
}
