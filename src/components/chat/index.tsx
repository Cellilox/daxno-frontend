import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import OverlayPopup from '../ui/OverlayPopup'
import { Send } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

export type OverlayPopupProps = {
  widthClassName: string;
  buttonLabel: string;
  children: React.ReactNode;
}

export type IntegrationsProps = {
  widthClassName?: string
}

export default function InsightsAndChat({ widthClassName = 'w-[480px]' }: IntegrationsProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'visualization'>('chat')
  const [messages, setMessages] = useState<{ from: 'user' | 'ai'; text: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [vizPrompt, setVizPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // auto-resize textarea
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value)
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const sendChat = () => {
    if (!chatInput.trim()) return
    setMessages(prev => [...prev, { from: 'user', text: chatInput }])
    setChatInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    setLoading(true)
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'ai', text: 'AI response based on chat input.' }])
      setLoading(false)
    }, 1000)
  }

  return (
    <OverlayPopup widthClassName={widthClassName} buttonLabel="Insights & Chat">
      <div className="flex border-b border-gray-200">
        {['chat', 'visualization'].map(tab => (
          <button
            key={tab}
            className={
              `flex-1 py-3 text-center font-medium transition-all ${
                activeTab === tab
                  ? 'border-b-4 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
            onClick={() => setActiveTab(tab as 'chat' | 'visualization')}
          >
            {tab === 'chat' ? 'Chat' : 'Visualization'}
          </button>
        ))}
      </div>

      {activeTab === 'chat' && (
        <div className="relative flex flex-col max-h-[65vh] lg:max-h-[75vh] lg:w-[60%] mx-auto">
          {/* Messages area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 pb-24"
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                Hey, I am Cellilox. What can I help you?
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`block w-max max-w-[70%] px-4 py-2 rounded-2xl shadow-sm break-words ${
                      msg.from === 'user'
                        ? 'ml-auto bg-blue-50 text-gray-800'
                        : 'mr-auto bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.text}
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="block w-max max-w-[70%] mr-auto px-4 py-2 rounded-2xl shadow-sm bg-gray-100 text-gray-500"
                  >
                    Loading...
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Fixed auto‑expanding input bar */}
          
            <div className="flex items-center">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  rows={3}
                  className="w-full border border-gray-300 bg-gray-100 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none overflow-hidden"
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={handleInputChange}
                  onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChat();
                    }
                  }}
                />
                <button
                  className="absolute right-2 bottom-0 transform -translate-y-1/2"
                  onClick={sendChat}
                >
                  <Send className="h-6 w-6 text-blue-600" />
                </button>
              </div>
            </div>
        </div>
      )}

      {activeTab === 'visualization' && (
        <div className="flex flex-col max-h-[75vh] w-[60%] mx-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <textarea
                rows={3}
                className="w-full border border-gray-300 bg-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
                placeholder="Describe the visualization you want..."
                value={vizPrompt}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setVizPrompt(e.target.value)}
              />
            </div>
            <button
              className="mt-3 bg-green-600 text-white rounded-lg px-6 py-2 shadow hover:bg-green-700 transition"
              onClick={() => {}}
            >
              Generate Chart
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
              Chart will render here.
            </div>
          </div>
        </div>
      )}
    </OverlayPopup>
  )
}
