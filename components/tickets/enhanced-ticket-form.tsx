"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { createTicket } from "@/lib/tickets"
import type { TicketCategory, TicketPriority } from "@/lib/tickets"
import { analyzeTicketContent, extractErrorFromMedia, getKBSuggestions, getRealtimeSuggestions } from "@/lib/ai-service"
import type { AIAnalysisResult, ErrorExtractionResult, AISuggestion } from "@/lib/ai-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, X, FileText, ImageIcon, Video, Sparkles, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EnhancedTicketFormProps {
  onTicketCreated?: () => void
}

export function EnhancedTicketForm({ onTicketCreated }: EnhancedTicketFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<TicketCategory>("other")
  const [priority, setPriority] = useState<TicketPriority>("medium")
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [extractedErrors, setExtractedErrors] = useState<ErrorExtractionResult[]>([])
  const [kbSuggestions, setKbSuggestions] = useState<string[]>([])
  const [showKbSuggestions, setShowKbSuggestions] = useState(false)
  const [isProcessingFiles, setIsProcessingFiles] = useState(false)
  const [realtimeSuggestion, setRealtimeSuggestion] = useState<AISuggestion | null>(null)
  const [isAnalyzingTitle, setIsAnalyzingTitle] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Prevent default drag and drop behavior on the page
  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    document.addEventListener('dragover', preventDefaults)
    document.addEventListener('drop', preventDefaults)
    document.addEventListener('dragenter', preventDefaults)
    document.addEventListener('dragleave', preventDefaults)

    return () => {
      document.removeEventListener('dragover', preventDefaults)
      document.removeEventListener('drop', preventDefaults)
      document.removeEventListener('dragenter', preventDefaults)
      document.removeEventListener('dragleave', preventDefaults)
    }
  }, [])

  // Process files (shared logic for both file input and drag & drop)
  const processFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    setIsProcessingFiles(true)

    try {
      // Validate file types and sizes
      const validFiles = files.filter((file) => {
        const isValidType =
          file.type.startsWith("image/") || file.type.startsWith("video/") || file.type === "application/pdf"
        const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
        return isValidType && isValidSize
      })

      if (validFiles.length !== files.length) {
        toast({
          title: "Invalid files",
          description: "Some files were skipped. Only images, videos, and PDFs under 10MB are allowed.",
          variant: "destructive",
        })
      }

      setAttachments((prev) => [...prev, ...validFiles])

      // Extract errors from media files (only for files that appear to be error screenshots)
      for (const file of validFiles) {
        if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
          try {
            const error = await extractErrorFromMedia(file)
            if (error) {
              setExtractedErrors((prev) => [...prev, error])
              toast({
                title: "Error detected in media",
                description: `AI analysis found: ${error.errorMessage}`,
                variant: "default",
              })
            } else {
              // File uploaded successfully, no errors detected
              toast({
                title: "File uploaded successfully",
                description: `${file.name} has been attached to your ticket`,
                variant: "default",
              })
            }
          } catch (error) {
            console.error('Error processing file:', error)
            toast({
              title: "File processing error",
              description: "Could not analyze the uploaded file, but it has been attached to your ticket",
              variant: "destructive",
            })
          }
        }
      }
    } catch (error) {
      console.error('Error during file upload:', error)
      toast({
        title: "Upload error",
        description: "An error occurred while processing files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingFiles(false)
    }
  }, [toast])

  // Handle file upload from input
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      await processFiles(files)
    },
    [processFiles],
  )

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle drag and drop events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only set drag over to false if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (isProcessingFiles) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    // Process files directly using the same logic as file upload
    processFiles(files)
  }, [processFiles, isProcessingFiles])

  // Handle title changes with real-time AI analysis
  const handleTitleChange = useCallback(async (value: string) => {
    setTitle(value)

    if (value.length > 5) {
      setIsAnalyzingTitle(true)
      try {
        const suggestion = await getRealtimeSuggestions(value, description)
        setRealtimeSuggestion(suggestion)
        
        // Auto-apply suggestions with high confidence
        if (suggestion && suggestion.confidence > 0.7) {
          setCategory(suggestion.category as TicketCategory)
          setPriority(suggestion.priority as TicketPriority)
          
          toast({
            title: "AI Suggestion Applied",
            description: `Category: ${suggestion.category}, Priority: ${suggestion.priority}`,
            variant: "default",
          })
        }
      } catch (error) {
        console.error('Error getting real-time suggestions:', error)
      } finally {
        setIsAnalyzingTitle(false)
      }
    } else {
      setRealtimeSuggestion(null)
    }
  }, [description, toast])

  // Get KB suggestions as user types
  const handleDescriptionChange = useCallback(async (value: string) => {
    setDescription(value)

    if (value.length > 20) {
      const suggestions = await getKBSuggestions(value)
      setKbSuggestions(suggestions)
      setShowKbSuggestions(suggestions.length > 0)
    } else {
      setShowKbSuggestions(false)
    }
  }, [])

  // Analyze ticket with AI
  const handleAnalyze = async () => {
    if (!title || !description) {
      toast({
        title: "Missing information",
        description: "Please provide both title and description for AI analysis.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const analysis = await analyzeTicketContent(title, description, attachments)
      setAiAnalysis(analysis)

      // Auto-apply suggestions
      setCategory(analysis.suggestedCategory as TicketCategory)
      setPriority(analysis.suggestedPriority as TicketPriority)

      toast({
        title: "AI Analysis Complete",
        description: `Confidence: ${(analysis.confidence * 100).toFixed(0)}% - Category and priority updated.`,
      })
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Unable to analyze ticket. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Submit ticket
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setIsSubmitting(true)

    try {
      createTicket({
        title,
        description,
        category,
        priority,
        status: "open",
        source: "portal",
        submittedBy: user.id,
        tags: aiAnalysis?.relatedArticles.map((article) => article.split(":")[0]) || [],
      })

      // Show success message
      setShowSuccessMessage(true)
      
      toast({
        title: "Ticket created successfully",
        description: "Your ticket has been submitted and will be reviewed shortly.",
      })

      // Reset form after a short delay to show success message
      setTimeout(() => {
        setTitle("")
        setDescription("")
        setCategory("other")
        setPriority("medium")
        setAttachments([])
        setAiAnalysis(null)
        setExtractedErrors([])
        setKbSuggestions([])
        setShowKbSuggestions(false)
        setRealtimeSuggestion(null)
        setShowSuccessMessage(false)
        
        onTicketCreated?.()
      }, 3000) // Show success message for 3 seconds
    } catch (error) {
      toast({
        title: "Error creating ticket",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    if (file.type.startsWith("video/")) return <Video className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Support Ticket</CardTitle>
        <CardDescription>Submit a new IT support request with AI-powered assistance</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <div className="relative">
        <Input
          id="title"
          placeholder="Brief description of the issue"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          disabled={isSubmitting || showSuccessMessage}
          required
        />
              {isAnalyzingTitle && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
            </div>
            
            {/* Real-time AI Suggestions */}
            {realtimeSuggestion && (
              <Alert className="border-blue-500/20 bg-blue-500/10">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium text-blue-700">AI Suggestion (Confidence: {Math.round(realtimeSuggestion.confidence * 100)}%)</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Category:</span> {realtimeSuggestion.category}
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span> {realtimeSuggestion.priority}
                      </div>
                    </div>
                    <p className="text-xs text-blue-600">{realtimeSuggestion.reasoning}</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCategory(realtimeSuggestion.category as TicketCategory)
                          setPriority(realtimeSuggestion.priority as TicketPriority)
                          toast({
                            title: "Suggestion Applied",
                            description: "Category and priority updated based on AI analysis",
                          })
                        }}
                      >
                        Apply Suggestion
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setRealtimeSuggestion(null)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about your issue..."
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={6}
              disabled={isSubmitting || showSuccessMessage}
              required
            />
            {showKbSuggestions && kbSuggestions.length > 0 && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Related Knowledge Base Articles:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {kbSuggestions.map((article, index) => (
                        <li key={index} className="text-muted-foreground">
                          {article}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Attachments (Screenshots, Videos, Documents)</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                isDragOver 
                  ? 'border-primary bg-primary/5 scale-105' 
                  : 'border-border hover:border-primary/50'
              } ${isProcessingFiles ? 'pointer-events-none opacity-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept="image/*,video/*,application/pdf"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {isProcessingFiles ? (
                  <Loader2 className="h-8 w-8 mx-auto mb-2 text-primary animate-spin" />
                ) : (
                  <Upload className={`h-8 w-8 mx-auto mb-2 transition-colors ${
                    isDragOver ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                )}
                <p className={`text-sm transition-colors ${
                  isDragOver ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {isProcessingFiles ? (
                    <>
                      Processing files...
                      <br />
                      <span className="text-xs">Please wait</span>
                    </>
                  ) : isDragOver ? (
                    <>
                      Drop files here
                      <br />
                      <span className="text-xs">Release to upload</span>
                    </>
                  ) : (
                    <>
                      Click to upload or drag and drop
                      <br />
                      Images, Videos, PDFs (Max 10MB each)
                    </>
                  )}
                </p>
              </label>
            </div>


            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-sm text-muted-foreground">Attached files ({attachments.length}):</p>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    {getFileIcon(file)}
                    <span className="text-sm flex-1 truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extracted Errors */}
          {extractedErrors.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">AI Detected Errors:</p>
                  {extractedErrors.map((error, index) => (
                    <div key={index} className="text-sm space-y-1">
                      <p className="font-medium">{error.errorType}</p>
                      <p className="text-muted-foreground">{error.errorMessage}</p>
                      {error.affectedComponent && (
                        <p className="text-xs text-muted-foreground">Component: {error.affectedComponent}</p>
                      )}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* AI Analysis Button */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !title || !description}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze with AI
                </>
              )}
            </Button>
          </div>

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">AI Analysis Results</p>
                    <Badge variant="outline">Confidence: {(aiAnalysis.confidence * 100).toFixed(0)}%</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Suggested Category:</p>
                      <p className="font-medium capitalize">{aiAnalysis.suggestedCategory}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Suggested Priority:</p>
                      <p className="font-medium capitalize">{aiAnalysis.suggestedPriority}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sentiment:</p>
                      <p className="font-medium capitalize">{aiAnalysis.sentiment}</p>
                    </div>
                  </div>

                  {aiAnalysis.extractedIssues.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Detected Issues:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {aiAnalysis.extractedIssues.map((issue, index) => (
                          <li key={index} className="text-muted-foreground">
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiAnalysis.relatedArticles.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Related Articles:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {aiAnalysis.relatedArticles.map((article, index) => (
                          <li key={index} className="text-muted-foreground">
                            {article}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as TicketCategory)} disabled={isSubmitting || showSuccessMessage}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="printer">Printer</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="disaster-recovery">Disaster Recovery</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TicketPriority)} disabled={isSubmitting || showSuccessMessage}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <Alert className="border-green-500/20 bg-green-500/10 animate-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <div className="space-y-1">
                  <p className="font-semibold">🎉 Ticket Created Successfully!</p>
                  <p className="text-sm">
                    Your ticket has been submitted and assigned ticket ID. You will receive email updates as we work on resolving your issue.
                  </p>
                  <p className="text-xs text-green-600">
                    Form will reset automatically in a few seconds...
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting || showSuccessMessage}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Ticket...
              </>
            ) : showSuccessMessage ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Ticket Created!
              </>
            ) : (
              "Create Ticket"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
