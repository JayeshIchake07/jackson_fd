import { useEffect } from 'react'

interface KeyboardShortcutsProps {
  onCreateTicket: () => void
  onNavigateToTab: (tab: string) => void
  userRole?: string
}

export function useKeyboardShortcuts({ onCreateTicket, onNavigateToTab, userRole }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Check for Ctrl/Cmd key combinations
      const isCtrlOrCmd = event.ctrlKey || event.metaKey

      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case 'n':
            event.preventDefault()
            onCreateTicket()
            break
          case '1':
            event.preventDefault()
            onNavigateToTab('overview')
            break
          case '2':
            event.preventDefault()
            if (userRole === 'employee') {
              onNavigateToTab('tickets')
            } else if (userRole === 'agent') {
              onNavigateToTab('agent-tickets')
            }
            break
          case '3':
            event.preventDefault()
            onNavigateToTab('knowledge')
            break
          case '4':
            event.preventDefault()
            if (userRole === 'admin') {
              onNavigateToTab('analytics')
            }
            break
          case '5':
            event.preventDefault()
            if (userRole === 'admin') {
              onNavigateToTab('users')
            }
            break
          case '6':
            event.preventDefault()
            if (userRole === 'admin') {
              onNavigateToTab('ai-routing')
            }
            break
          case '7':
            event.preventDefault()
            if (userRole === 'admin') {
              onNavigateToTab('workflows')
            }
            break
          case '8':
            event.preventDefault()
            if (userRole === 'admin') {
              onNavigateToTab('settings')
            }
            break
        }
      }

      // Single key shortcuts (when not in input fields)
      switch (event.key.toLowerCase()) {
        case '/':
          event.preventDefault()
          // Focus search if available
          const searchInput = document.querySelector('input[placeholder*="search"], input[placeholder*="Search"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
          break
        case '?':
          event.preventDefault()
          // Show help modal or shortcuts info
          alert(`Keyboard Shortcuts:
          
Ctrl/Cmd + N: Create New Ticket
Ctrl/Cmd + 1: Dashboard
Ctrl/Cmd + 2: ${userRole === 'employee' ? 'My Tickets' : userRole === 'agent' ? 'Manage Tickets' : 'Tickets'}
Ctrl/Cmd + 3: Knowledge Base
${userRole === 'admin' ? `Ctrl/Cmd + 4: Analytics
Ctrl/Cmd + 5: Users
Ctrl/Cmd + 6: AI Routing
Ctrl/Cmd + 7: Workflows
Ctrl/Cmd + 8: Settings` : ''}
/ : Focus Search
? : Show this help`)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCreateTicket, onNavigateToTab, userRole])
}
