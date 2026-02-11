import React, { useState, useEffect, useRef, useCallback } from 'react'
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

  const fetchCase = useCallback(async () => {
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
  }, [id])

  const fetchFiles = useCallback(async () => {
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
  }, [id])

  const fetchMessages = useCallback(async () => {
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
  }, [id])

  useEffect(() => {
    if (id) {
      fetchCase()
      fetchFiles()
      fetchMessages()
    }
  }, [id, fetchCase, fetchFiles, fetchMessages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      <div className="min-h-screen bg-law-charcoal-50 flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    )
  }

  if (!case_) {
    return (
      <div className="min-h-screen bg-law-charcoal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-law-charcoal-100 rounded-law-lg flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-law-charcoal-400" />
          </div>
          <h1 className="heading-3 text-law-charcoal-900 mb-4">Case not found</h1>
          <Link href="/dashboard">
            <Button className="btn-primary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-law-charcoal-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="sidebar w-64">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center space-x-3 mb-8 group">
              <div className="w-10 h-10 bg-law-blue-600 rounded-law flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-law-charcoal-900">LawCaseAI</span>
            </Link>
            
            <nav className="space-y-2">
              <Link href="/dashboard" className="sidebar-item sidebar-item-inactive">
                <FileText className="w-5 h-5 mr-3" />
                Cases
              </Link>
              <Link href="/dashboard/settings" className="sidebar-item sidebar-item-inactive">
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-law border-b border-law-charcoal-200">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard">
                    <Button className="btn-secondary" size="sm">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Cases
                    </Button>
                  </Link>
                  <div>
                    <h1 className="heading-3 text-law-charcoal-900">{case_.name}</h1>
                    <p className="text-law-charcoal-600 mt-1">Client: {case_.client}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`badge ${
                    case_.status === 'active' ? 'badge-success' :
                    case_.status === 'closed' ? 'bg-law-charcoal-100 text-law-charcoal-800' :
                    'badge-warning'
                  }`}>
                    {case_.status.charAt(0).toUpperCase() + case_.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Files Section */}
              <div className="lg:col-span-2">
                <div className="card-premium">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="heading-4">Case Documents</CardTitle>
                      <Button onClick={() => setShowUploadModal(true)} className="btn-primary">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search */}
                    <div className="mb-6">
                      <Input
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Search className="w-5 h-5 text-law-charcoal-400" />}
                        className="input-field"
                      />
                    </div>

                    {/* Files List */}
                    <div className="space-y-3">
                      {filteredFiles.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-law-charcoal-100 rounded-law-lg flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-8 h-8 text-law-charcoal-400" />
                          </div>
                          <h3 className="heading-4 text-law-charcoal-900 mb-3">No documents uploaded</h3>
                          <p className="text-law-charcoal-600 mb-6">Upload your first document to get started</p>
                          <Button
                            className="btn-outline"
                            onClick={() => setShowUploadModal(true)}
                          >
                            Upload First Document
                          </Button>
                        </div>
                      ) : (
                        filteredFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-4 border border-law-charcoal-200 rounded-law-lg hover:bg-law-charcoal-50 transition-colors duration-200">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-law-blue-100 rounded-law flex items-center justify-center">
                                <FileText className="w-5 h-5 text-law-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-law-charcoal-900">{file.name}</p>
                                <p className="text-sm text-law-charcoal-500">
                                  {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                className="btn-outline"
                                size="sm"
                                onClick={() => handleFileDownload(file)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                className="text-error-600 hover:text-error-800 hover:bg-error-50"
                                size="sm"
                                onClick={() => handleFileDelete(file.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </div>
              </div>

              {/* AI Chat Section */}
              <div className="lg:col-span-1">
                <div className="card-premium h-[650px] flex flex-col">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center heading-4">
                      <MessageCircle className="w-5 h-5 mr-2 text-law-blue-600" />
                      AI Legal Assistant
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto mb-6 space-y-4 scrollbar-hide">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-12 h-12 bg-law-blue-100 rounded-law-lg flex items-center justify-center mx-auto mb-4">
                            <Bot className="w-6 h-6 text-law-blue-600" />
                          </div>
                          <h4 className="heading-4 text-law-charcoal-900 mb-2">AI Legal Assistant</h4>
                          <p className="text-law-charcoal-600">Ask me anything about this case</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                          >
                            <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                              <div className={`flex items-start space-x-3 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  message.sender === 'user' ? 'bg-law-blue-600' : 'bg-law-charcoal-200'
                                }`}>
                                  {message.sender === 'user' ? (
                                    <User className="w-4 h-4 text-white" />
                                  ) : (
                                    <Bot className="w-4 h-4 text-law-charcoal-600" />
                                  )}
                                </div>
                                <div className={`px-4 py-3 rounded-law-lg ${
                                  message.sender === 'user' 
                                    ? 'bg-law-blue-600 text-white' 
                                    : 'bg-law-charcoal-100 text-law-charcoal-900'
                                }`}>
                                  {message.isTyping ? (
                                    <div className="flex space-x-1">
                                      <div className="w-2 h-2 bg-law-charcoal-400 rounded-full animate-bounce"></div>
                                      <div className="w-2 h-2 bg-law-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                      <div className="w-2 h-2 bg-law-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                  ) : (
                                    <p className="text-sm leading-relaxed">{message.content}</p>
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
                    <form onSubmit={handleSendMessage} className="flex space-x-3">
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Ask about this case..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={isSending}
                          leftIcon={<Paperclip className="w-5 h-5 text-law-charcoal-400" />}
                          className="input-field"
                        />
                      </div>
                      <Button type="submit" className="btn-primary" disabled={isSending || !newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </CardContent>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Legal Document"
      >
        <form onSubmit={handleFileUpload}>
          <div className="space-y-6">
            <div className="form-group">
              <label className="form-label">
                Select Document
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="input-field"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              {selectedFile && (
                <div className="mt-3 p-3 bg-law-blue-50 rounded-law border border-law-blue-200">
                  <p className="text-sm text-law-blue-800">
                    <strong>Selected:</strong> {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              className="btn-secondary"
              onClick={() => setShowUploadModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={!selectedFile || isUploading}
              loading={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
