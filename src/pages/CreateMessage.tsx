import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, Store } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Store as StoreIcon, List, Globe, X } from 'lucide-react'

const CreateMessage: React.FC = () => {
  const [subject, setSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [showStoreList, setShowStoreList] = useState(false)
  const [manualStoreInput, setManualStoreInput] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [selectionType, setSelectionType] = useState<'manual' | 'list' | 'all' | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching stores:', error)
      } else {
        setStores(data || [])
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const handleStoreSelection = (type: 'manual' | 'list' | 'all') => {
    setSelectionType(type)
    setSelectedStores([])
    setManualStoreInput('')
    setShowManualInput(false)
    setShowStoreList(false)

    if (type === 'manual') {
      setShowManualInput(true)
    } else if (type === 'list') {
      setShowStoreList(true)
    } else if (type === 'all') {
      setSelectedStores(stores.map(store => store.code))
    }
  }

  const handleManualStoreSubmit = () => {
    if (manualStoreInput.trim()) {
      const storeCodes = manualStoreInput
        .split(',')
        .map(code => code.trim())
        .filter(code => code.length > 0)
      setSelectedStores(storeCodes)
      setShowManualInput(false)
    }
  }

  const handleStoreToggle = (storeCode: string) => {
    setSelectedStores(prev => 
      prev.includes(storeCode)
        ? prev.filter(code => code !== storeCode)
        : [...prev, storeCode]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!subject.trim() || !messageBody.trim()) {
      alert('Please fill in both subject and message body')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            title: subject,
            body: messageBody,
            list_of_stores: selectedStores,
            user_id: user.id
          }
        ])

      if (error) {
        console.error('Error creating message:', error)
        alert('Error creating message')
      } else {
        navigate('/messages')
      }
    } catch (error) {
      console.error('Error creating message:', error)
      alert('Error creating message')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (subject || messageBody || selectedStores.length > 0) {
      if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
        navigate('/messages')
      }
    } else {
      navigate('/messages')
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Message</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter message subject"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your message"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Store Selection
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <button
                type="button"
                onClick={() => handleStoreSelection('manual')}
                className={`p-6 border-2 rounded-lg flex flex-col items-center space-y-3 transition-colors ${
                  selectionType === 'manual' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <StoreIcon className="w-8 h-8 text-blue-600" />
                <span className="font-medium">Enter list of stores</span>
                <span className="text-sm text-gray-500 text-center">
                  Manually enter store codes
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStoreSelection('list')}
                className={`p-6 border-2 rounded-lg flex flex-col items-center space-y-3 transition-colors ${
                  selectionType === 'list' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <List className="w-8 h-8 text-blue-600" />
                <span className="font-medium">Choose stores from list</span>
                <span className="text-sm text-gray-500 text-center">
                  Select from available stores
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStoreSelection('all')}
                className={`p-6 border-2 rounded-lg flex flex-col items-center space-y-3 transition-colors ${
                  selectionType === 'all' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Globe className="w-8 h-8 text-blue-600" />
                <span className="font-medium">Send to all stores</span>
                <span className="text-sm text-gray-500 text-center">
                  Select all available stores
                </span>
              </button>
            </div>

            {/* Manual Store Input */}
            {showManualInput && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter store codes (comma-separated)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={manualStoreInput}
                    onChange={(e) => setManualStoreInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ST001, ST002, ST003"
                  />
                  <button
                    type="button"
                    onClick={handleManualStoreSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Store List Selection */}
            {showStoreList && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Select Stores</h3>
                  <button
                    type="button"
                    onClick={() => setShowStoreList(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {stores.map((store) => (
                    <label key={store.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                      <input
                        type="checkbox"
                        checked={selectedStores.includes(store.code)}
                        onChange={() => handleStoreToggle(store.code)}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {store.code} - {store.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Stores Display */}
            {selectedStores.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Selected Stores ({selectedStores.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStores.map((storeCode) => (
                    <span
                      key={storeCode}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {storeCode}
                      <button
                        type="button"
                        onClick={() => setSelectedStores(prev => prev.filter(code => code !== storeCode))}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateMessage