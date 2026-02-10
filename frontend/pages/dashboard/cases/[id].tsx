import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Upload,
  Download,
  Trash2,
  Send,
  MessageCircle,
  Plus,
  Search,
  Filter,
  User,
  Bot,
  Paperclip,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { formatDate, formatFileSize } from '@/utils/helpers'

interface CaseFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  url: string
}

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
  isTyping?: boolean
}

interface Case {
  id: string
  name: string
  client: string
  description: string
  status: 'active' | 'closed' | 'archived'
  createdAt: string
  updatedAt: string
  files: CaseFile[]
}

export default function CaseDetail() {
  const router = useRouter()
  const { id } = router.query
  const [case_, setCase] = useState<Case | null>(null)
  const [files, setFiles] = useState<CaseFile[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) {
      fetchCase()
      fetchFiles()
      fetchMessages()
    }
  }, [id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchCase = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/cases/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCase(data)
      }
    } catch (error) {
      console.error('Failed to fetch case:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/cases/${id}/files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error('Failed to fetch files:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/cases/${id}/chat`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('caseId', id as string)

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFiles(prev => [...prev, data])
        setShowUploadModal(false)
        setSelectedFile(null)
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsSending(true)

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      content: '',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      isTyping: true
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/cases/${id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage.content })
      })

      if (response.ok) {
        const data = await response.json()
        // Remove typing indicator and add AI response
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== 'typing')
          return [...filtered, {
            id: Date.now().toString(),
            content: data.response,
            sender: 'ai',
            timestamp: new Date().toISOString()
          }]
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove typing indicator on error
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'))
    } finally {
      setIsSending(false)
    }
  }

  const handleFileDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setFiles(prev => prev.filter(file => file.id !== fileId))
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  const handleFileDownload = async (file: CaseFile) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(file.url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download file:', error)
    }
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!case_) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">Case not found</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900">LawCaseAI</span>
            </Link>
            
            <nav className="space-y-2">
              <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900">
                <FileText className="w-5 h-5 mr-3" />
                Cases
              </Link>
              <Link href="/dashboard/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900">
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-secondary-100">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900">{case_.name}</h1>
                    <p className="text-secondary-600">Client: {case_.client}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    case_.status === 'active' ? 'bg-success-100 text-success-800' :
                    case_.status === 'closed' ? 'bg-secondary-100 text-secondary-800' :
                    'bg-warning-100 text-warning-800'
                  }`}>
                    {case_.status}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Files Section */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Case Files</CardTitle>
                      <Button onClick={() => setShowUploadModal(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search */}
                    <div className="mb-4">
                      <Input
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Search className="w-5 h-5 text-secondary-400" />}
                      />
                    </div>

                    {/* Files List */}
                    <div className="space-y-2">
                      {filteredFiles.length === 0 ? (
                        <div className="text-center py-8 text-secondary-500">
                          <FileText className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
                          <p>No files uploaded yet</p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setShowUploadModal(true)}
                          >
                            Upload first file
                          </Button>
                        </div>
                      ) : (
                        filteredFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-secondary-400" />
                              <div>
                                <p className="font-medium text-secondary-900">{file.name}</p>
                                <p className="text-sm text-secondary-500">
                                  {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFileDownload(file)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFileDelete(file.id)}
                                className="text-error-600 hover:text-error-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Chat Section */}
              <div className="lg:col-span-1">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      AI Assistant
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <Bot className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
                          <p className="text-secondary-500">Ask me anything about this case</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                              <div className={`flex items-start space-x-2 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  message.sender === 'user' ? 'bg-primary-600' : 'bg-secondary-200'
                                }`}>
                                  {message.sender === 'user' ? (
                                    <User className="w-4 h-4 text-white" />
                                  ) : (
                                    <Bot className="w-4 h-4 text-secondary-600" />
                                  )}
                                </div>
                                <div className={`px-3 py-2 rounded-lg ${
                                  message.sender === 'user' 
                                    ? 'bg-primary-600 text-white' 
                                    : 'bg-secondary-100 text-secondary-900'
                                }`}>
                                  {message.isTyping ? (
                                    <div className="flex space-x-1">
                                      <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
                                      <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                      <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                  ) : (
                                    <p className="text-sm">{message.content}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Ask about this case..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={isSending}
                          leftIcon={<Paperclip className="w-5 h-5 text-secondary-400" />}
                        />
                      </div>
                      <Button type="submit" disabled={isSending || !newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload File"
      >
        <form onSubmit={handleFileUpload}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Select File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-secondary-600">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowUploadModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || isUploading}
              loading={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
