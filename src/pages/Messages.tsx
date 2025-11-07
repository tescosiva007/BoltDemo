import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, Message } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Eye, Trash2, Plus } from 'lucide-react'

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const messagesPerPage = 10
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchMessages = async (page: number = 1) => {
    if (!user) return

    setLoading(true)
    try {
      const from = (page - 1) * messagesPerPage
      const to = from + messagesPerPage - 1

      const { data, error, count } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('date_created', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Error fetching messages:', error)
      } else {
        setMessages(data || [])
        setTotalPages(Math.ceil((count || 0) / messagesPerPage))
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages(currentPage)
  }, [user, currentPage])

  const handleView = (message: Message) => {
    setSelectedMessage(message)
    setShowViewModal(true)
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        console.error('Error deleting message:', error)
        alert('Error deleting message')
      } else {
        fetchMessages(currentPage)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Error deleting message')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 border rounded-md ${
              currentPage === page 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <button
          onClick={() => navigate('/create-message')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Message</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Body
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No messages found. Create your first message!
                    </td>
                  </tr>
                ) : (
                  messages.map((message) => (
                    <tr key={message.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {message.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(message.date_created)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {message.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {message.body.length > 50 
                          ? `${message.body.substring(0, 50)}...` 
                          : message.body}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(message)}
                            className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDelete(message.id)}
                            className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {messages.length > 0 && totalPages > 1 && (
            <div className="mt-6">
              {renderPagination()}
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      {showViewModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <p className="text-gray-900">{selectedMessage.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Created</label>
                <p className="text-gray-900">{formatDate(selectedMessage.date_created)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.body}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selected Stores</label>
                <div className="bg-gray-50 rounded-md p-3">
                  {selectedMessage.list_of_stores && selectedMessage.list_of_stores.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {selectedMessage.list_of_stores.map((store, index) => (
                        <li key={index} className="text-gray-900">{store}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No stores selected</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages