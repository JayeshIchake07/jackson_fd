export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  author: string
  createdAt: Date
  updatedAt: Date
  views: number
  helpful: number
  notHelpful: number
}

export interface KnowledgeCategory {
  id: string
  name: string
  description: string
  icon: string
  articleCount: number
}

// Mock knowledge base data
export const mockCategories: KnowledgeCategory[] = [
  {
    id: "network",
    name: "Network & Connectivity",
    description: "Network issues, WiFi problems, and connectivity troubleshooting",
    icon: "Wifi",
    articleCount: 8,
  },
  {
    id: "software",
    name: "Software & Applications",
    description: "Software installation, updates, and application issues",
    icon: "Monitor",
    articleCount: 12,
  },
  {
    id: "hardware",
    name: "Hardware & Equipment",
    description: "Computer hardware, peripherals, and equipment support",
    icon: "HardDrive",
    articleCount: 6,
  },
  {
    id: "security",
    name: "Security & Access",
    description: "Password resets, account access, and security policies",
    icon: "Shield",
    articleCount: 5,
  },
  {
    id: "email",
    name: "Email & Communication",
    description: "Email setup, Outlook issues, and communication tools",
    icon: "Mail",
    articleCount: 7,
  },
  {
    id: "mobile",
    name: "Mobile Devices",
    description: "Smartphones, tablets, and mobile device management",
    icon: "Smartphone",
    articleCount: 4,
  },
]

export const mockArticles: KnowledgeArticle[] = [
  {
    id: "1",
    title: "How to Reset Your Domain Password",
    content: `# How to Reset Your Domain Password

If you've forgotten your domain password or need to reset it for security reasons, follow these steps:

## Self-Service Password Reset

1. **Go to the Password Reset Portal**
   - Navigate to https://password.company.com
   - Click on "Forgot Password"

2. **Enter Your Information**
   - Enter your username or email address
   - Complete the security verification (CAPTCHA)

3. **Choose Verification Method**
   - SMS to your registered phone number
   - Email to your backup email address
   - Security questions (if configured)

4. **Create New Password**
   - Password must be at least 8 characters
   - Include uppercase, lowercase, numbers, and symbols
   - Cannot be one of your last 5 passwords

## Contact IT Support

If self-service doesn't work:
- Call IT Helpdesk: ext. 2222
- Submit a ticket through the helpdesk portal
- Visit IT office in Building A, Room 101

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- At least one special character (!@#$%^&*)
- Cannot contain your username
- Must be different from last 5 passwords

## Tips for Strong Passwords

- Use a passphrase with random words
- Consider using a password manager
- Enable two-factor authentication when available
- Never share your password with others`,
    category: "security",
    tags: ["password", "reset", "domain", "security"],
    author: "IT Security Team",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
    views: 245,
    helpful: 23,
    notHelpful: 2,
  },
  {
    id: "2",
    title: "Troubleshooting WiFi Connection Issues",
    content: `# Troubleshooting WiFi Connection Issues

Having trouble connecting to the company WiFi? Here's a step-by-step guide to resolve common issues.

## Quick Fixes

### 1. Restart Your WiFi
- Turn WiFi off and on again
- Wait 10 seconds between off/on
- Try connecting again

### 2. Forget and Reconnect
- Go to WiFi settings
- Find "CompanyWiFi" network
- Click "Forget" or "Remove"
- Reconnect with password: **CompanyWiFi2024**

### 3. Restart Network Adapter
**Windows:**
1. Right-click network icon in system tray
2. Select "Open Network & Internet settings"
3. Click "Change adapter options"
4. Right-click WiFi adapter → Disable
5. Wait 10 seconds, then Enable

**Mac:**
1. System Preferences → Network
2. Select WiFi → Advanced
3. Click "Renew DHCP Lease"

## Advanced Troubleshooting

### Check Network Settings
- Ensure automatic IP assignment is enabled
- DNS should be set to automatic
- Proxy settings should be disabled

### Update Network Drivers
- Windows: Device Manager → Network Adapters
- Mac: System Preferences → Software Update

### Clear Network Cache
**Windows:**
\`\`\`
ipconfig /flushdns
ipconfig /release
ipconfig /renew
\`\`\`

**Mac:**
\`\`\`
sudo dscacheutil -flushcache
\`\`\`

## Still Having Issues?

Contact IT Support:
- Phone: ext. 2222
- Email: support@company.com
- Submit a helpdesk ticket

Include this information:
- Device type and operating system
- Error messages you're seeing
- When the problem started
- What you were doing when it occurred`,
    category: "network",
    tags: ["wifi", "network", "connectivity", "troubleshooting"],
    author: "Network Team",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-12"),
    views: 189,
    helpful: 31,
    notHelpful: 4,
  },
  {
    id: "3",
    title: "Installing Software from the Company Portal",
    content: `# Installing Software from the Company Portal

Learn how to install approved software applications through our self-service portal.

## Accessing the Software Portal

1. **Open Software Center**
   - Windows: Start Menu → "Software Center"
   - Mac: Applications → "Self Service"

2. **Browse Available Software**
   - Click on categories to filter
   - Use search to find specific applications
   - Check system requirements

## Installation Process

### For Windows Users

1. **Select Application**
   - Click on the software you need
   - Review description and requirements
   - Click "Install"

2. **Monitor Installation**
   - Installation progress will be shown
   - Do not close Software Center during install
   - Restart if prompted

### For Mac Users

1. **Choose Application**
   - Select from available software list
   - Click "Install" button
   - Enter admin password if prompted

2. **Complete Installation**
   - Follow any additional setup prompts
   - Application will appear in Applications folder

## Commonly Requested Software

### Productivity Tools
- Microsoft Office 365
- Adobe Acrobat Reader
- Zoom
- Slack
- Notepad++

### Development Tools
- Visual Studio Code
- Git
- Python
- Node.js
- Docker Desktop

### Design Tools
- Adobe Creative Suite
- Figma Desktop
- Canva Desktop

## Requesting New Software

If you need software not in the portal:

1. **Submit a Request**
   - Use the helpdesk ticket system
   - Provide business justification
   - Include software details and vendor info

2. **Approval Process**
   - Manager approval required
   - Security review by IT
   - License procurement if needed

3. **Installation Timeline**
   - Standard software: 1-2 business days
   - New software: 5-10 business days
   - Custom software: 2-4 weeks

## Troubleshooting Installation Issues

### Common Problems
- Insufficient disk space
- Admin rights required
- Conflicting software
- Network connectivity issues

### Solutions
- Free up disk space (minimum 2GB)
- Contact IT for admin rights
- Uninstall conflicting applications
- Try installation during off-peak hours

## Need Help?

Contact IT Support:
- Helpdesk Portal: Submit a ticket
- Phone: ext. 2222
- Email: support@company.com`,
    category: "software",
    tags: ["software", "installation", "portal", "applications"],
    author: "Software Management Team",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-10"),
    views: 156,
    helpful: 28,
    notHelpful: 1,
  },
  {
    id: "4",
    title: "Setting Up Email on Mobile Devices",
    content: `# Setting Up Email on Mobile Devices

Configure your company email on smartphones and tablets for secure access on the go.

## Before You Start

You'll need:
- Your company email address
- Your domain password
- Mobile device with internet connection

## iPhone/iPad Setup

### Using Built-in Mail App

1. **Open Settings**
   - Go to Settings → Mail
   - Tap "Accounts" → "Add Account"
   - Select "Microsoft Exchange"

2. **Enter Account Details**
   - Email: your.name@company.com
   - Password: Your domain password
   - Description: Company Email

3. **Server Settings**
   - Server: mail.company.com
   - Domain: COMPANY
   - Username: your.username

4. **Choose What to Sync**
   - Mail: On
   - Contacts: On (recommended)
   - Calendars: On (recommended)
   - Reminders: Optional

### Using Outlook App (Recommended)

1. **Download Outlook**
   - Install from App Store
   - Open and tap "Get Started"

2. **Add Account**
   - Enter your company email
   - Tap "Add Account"
   - Enter your password

3. **Complete Setup**
   - Allow notifications (recommended)
   - Set up additional security if prompted

## Android Setup

### Using Gmail App

1. **Open Gmail**
   - Tap menu (three lines)
   - Select "Add account"
   - Choose "Exchange"

2. **Account Configuration**
   - Email: your.name@company.com
   - Password: Your domain password
   - Server: mail.company.com

3. **Sync Settings**
   - Choose sync frequency
   - Select folders to sync
   - Enable notifications

### Using Outlook App (Recommended)

1. **Install Outlook**
   - Download from Google Play Store
   - Open and tap "Get Started"

2. **Add Account**
   - Enter company email address
   - Tap "Continue"
   - Enter password when prompted

## Security Features

### Multi-Factor Authentication
- You may be prompted to set up MFA
- Use Microsoft Authenticator app
- Follow the setup wizard

### App PIN
- Set up a PIN for the Outlook app
- Required for accessing company data
- Choose a secure 4-6 digit PIN

### Remote Wipe
- IT can remotely wipe company data
- Only affects work data, not personal
- Helps protect company information

## Troubleshooting

### Common Issues
- "Cannot verify server identity"
- "Account setup failed"
- "Sync errors"

### Solutions
1. **Check Credentials**
   - Verify email address spelling
   - Confirm password is correct
   - Try logging in on computer first

2. **Network Issues**
   - Ensure strong WiFi/cellular signal
   - Try different network
   - Disable VPN temporarily

3. **App Issues**
   - Force close and reopen app
   - Clear app cache (Android)
   - Reinstall app if necessary

## Best Practices

### Security
- Always lock your device
- Use strong device passcode
- Enable automatic screen lock
- Keep apps updated

### Email Management
- Set up focused inbox
- Use rules and folders
- Enable out-of-office replies
- Regularly clean up old emails

## Need Assistance?

Contact IT Support:
- Submit helpdesk ticket
- Call ext. 2222
- Email support@company.com

Include:
- Device type and OS version
- Email app you're using
- Specific error messages
- Screenshots if helpful`,
    category: "email",
    tags: ["email", "mobile", "setup", "outlook", "exchange"],
    author: "Mobile Support Team",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-08"),
    views: 203,
    helpful: 35,
    notHelpful: 3,
  },
]

export const getKnowledgeCategories = (): KnowledgeCategory[] => {
  return mockCategories
}

export const getKnowledgeArticles = (): KnowledgeArticle[] => {
  return mockArticles
}

export const getArticlesByCategory = (categoryId: string): KnowledgeArticle[] => {
  return mockArticles.filter((article) => article.category === categoryId)
}

export const searchArticles = (query: string): KnowledgeArticle[] => {
  const lowercaseQuery = query.toLowerCase()
  return mockArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.content.toLowerCase().includes(lowercaseQuery) ||
      article.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  )
}

export const getArticleById = (id: string): KnowledgeArticle | undefined => {
  return mockArticles.find((article) => article.id === id)
}

export const incrementArticleViews = (id: string): void => {
  const article = mockArticles.find((a) => a.id === id)
  if (article) {
    article.views++
  }
}

export const rateArticle = (id: string, helpful: boolean): void => {
  const article = mockArticles.find((a) => a.id === id)
  if (article) {
    if (helpful) {
      article.helpful++
    } else {
      article.notHelpful++
    }
  }
}

export const getRecommendedArticles = (ticketDescription: string): KnowledgeArticle[] => {
  const keywords = ticketDescription.toLowerCase().split(/\s+/)
  const scoredArticles = mockArticles.map((article) => {
    let score = 0
    const articleText = `${article.title} ${article.content} ${article.tags.join(" ")}`.toLowerCase()

    keywords.forEach((keyword) => {
      if (keyword.length > 3 && articleText.includes(keyword)) {
        score++
      }
    })

    return { article, score }
  })

  return scoredArticles
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.article)
}

export const getTrendingArticles = (limit = 5): KnowledgeArticle[] => {
  return [...mockArticles]
    .sort((a, b) => {
      const scoreA = a.views * 0.5 + a.helpful * 2 - a.notHelpful
      const scoreB = b.views * 0.5 + b.helpful * 2 - b.notHelpful
      return scoreB - scoreA
    })
    .slice(0, limit)
}

export const getRelatedArticles = (articleId: string, limit = 3): KnowledgeArticle[] => {
  const article = getArticleById(articleId)
  if (!article) return []

  const scoredArticles = mockArticles
    .filter((a) => a.id !== articleId)
    .map((a) => {
      let score = 0
      if (a.category === article.category) score += 3
      const commonTags = a.tags.filter((tag) => article.tags.includes(tag))
      score += commonTags.length * 2
      return { article: a, score }
    })

  return scoredArticles
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.article)
}
