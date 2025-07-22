import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import OverlayPopup from '../ui/OverlayPopup'
import { Send } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'

export type IntegrationsProps = {
  widthClassName?: string
}

interface Message {
  from: 'user' | 'ai'
  content: string
}

// Hard‑coded AI response (no backticks!)
const initialAIResponse: string =
  "Here's a visualization of the \"Due total\" amounts across different invoices, providing insight into the invoice-related financial standings in your data.\n\n" +
  "```chart-spec\n" +
  "{\n" +
  "  \"chartType\": \"bar\",\n" +
  "  \"data\": {\n" +
  "    \"labels\": [\n" +
  "      \"SI-2025-001\",\n" +
  "      \"SI-2025-002\",\n" +
  "      \"SI-2025-003\",\n" +
  "      \"SI-2025-004\",\n" +
  "      \"SI-2025-005\"\n" +
  "    ],\n" +
  "    \"datasets\": [\n" +
  "      {\n" +
  "        \"label\": \"Due total\",\n" +
  "        \"data\": [2343.00, 2574.00, 2625.00, 4080.72, 3096.00]\n" +
  "      }\n" +
  "    ]\n" +
  "  }\n" +
  "}\n" +
  "```\n\n" +
  "This bar chart illustrates the \"Due total\" for each invoice, helping identify which invoices have higher due amounts."

function parseMessage(text: string): { narrative: string; spec: any | null } {
  const fenceRE = /```chart-spec\s*([\s\S]*?)```/m
  const match = text.match(fenceRE)
  if (!match) return { narrative: text, spec: null }
  const narrative = text.replace(fenceRE, '').trim()
  let spec = null
  try {
    spec = JSON.parse(match[1])
  } catch (e) {
    console.error('Failed to parse chart-spec JSON:', e)
  }
  return { narrative, spec }
}

function ChartRenderer({ spec }: { spec: any }) {
  if (!spec) return null
  const { chartType, data } = spec
  const chartData = data.labels.map((lbl: string, i: number) => ({
    name: lbl,
    value: data.datasets[0].data[i],
  }))

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name={data.datasets[0].label} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return <div>Unsupported chart type: {chartType}</div>
}

export default function InsightsAndChat({
  widthClassName = 'w-[480px]',
}: IntegrationsProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'visualization'>('chat')
  const [messages, setMessages] = useState<Message[]>([
    { from: 'ai', content: initialAIResponse },
  ])
  const [chatInput, setChatInput] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = chatContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const sendChat = () => {
    const text = chatInput.trim()
    if (!text) return
    setMessages((m) => [...m, { from: 'user', content: text }])
    setChatInput('')
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'ai', content: initialAIResponse }])
    }, 1000)
  }

  return (
    <OverlayPopup widthClassName={widthClassName} buttonLabel="Insights & Chat">
      <div className="flex border-b border-gray-200">
        {['chat', 'visualization'].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-3 text-center font-medium transition-all ${
              activeTab === tab
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab as 'chat' | 'visualization')}
          >
            {tab === 'chat' ? 'Chat' : 'Visualization'}
          </button>
        ))}
      </div>

      {activeTab === 'chat' && (
        <div className="relative flex flex-col max-h-[65vh] w-full mx-auto">
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 pb-24"
          >
            {messages.map((msg, i) => {
              const { narrative, spec } = parseMessage(msg.content)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm break-words ${
                    msg.from === 'user'
                      ? 'ml-auto bg-blue-50 text-gray-800'
                      : 'mr-auto bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="prose">{narrative}</div>
                  {spec && <ChartRenderer spec={spec} />}
                </motion.div>
              )
            })}
          </div>

          <div className="flex items-center p-4 border-t border-gray-200">
            <textarea
              ref={inputRef}
              rows={1}
              className="flex-1 border border-gray-300 bg-gray-100 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none overflow-hidden"
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setChatInput(e.target.value)
              }
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendChat()
                }
              }}
            />
            <button className="ml-2" onClick={sendChat}>
              <Send className="h-6 w-6 text-blue-600" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'visualization' && (
        <div className="flex flex-col max-h-[75vh] w-full mx-auto">
          {/* Visualization tab content */}
        </div>
      )}
    </OverlayPopup>
  )
}
