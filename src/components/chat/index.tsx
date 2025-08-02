"use client";

import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import OverlayPopup from '../ui/OverlayPopup';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../chat/types'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { sendChat } from '@/actions/chat-bot-actions';
import { storeConversation } from '@/actions/conversations-actions';
import { getCreditUsage } from '@/actions/credits-usage-actions';
import PricingModal from '../pricing/PricingModal';
import BuyCreditsModal from '../pricing/BuyCreditsModal';

export type IntegrationsProps = {
  projectId: string;
  widthClassName?: string;
  chats: Message[]
};

export type UsageData = {
  credit_limit: number,
  is_free_tier: boolean,
  remaining_credits: boolean,
  used_credits: number
}


// Predefined colors for charts
const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

function parseMessage(text: string): { narrative: string; spec: any | null } {
  let spec: any = null;
  const trimmed = text.trim();

  // 1. Raw JSON (no fences)
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      spec = JSON.parse(trimmed);
      return { narrative: '', spec };
    } catch {
      // not JSON, continue
    }
  }

  // 2. Fenced chart-spec
  const fenceRE = /```chart-spec\s*([\s\S]*?)```/m;
  const match = text.match(fenceRE);
  if (match) {
    const narrative = text.replace(fenceRE, '').trim();
    try {
      spec = JSON.parse(match[1]);
    } catch (e) {
      console.error('Failed to parse chart-spec JSON:', e);
    }
    return { narrative, spec };
  }

  // 3. Plain text
  return { narrative: text, spec: null };
}

function ChartRenderer({ spec }: { spec: any }) {
  // Enhanced validation
  if (!spec) {
    console.log('No spec provided');
    return null;
  }

  if (!spec.data) {
    console.log('No data in spec');
    return null;
  }

  if (!Array.isArray(spec.data.labels) || spec.data.labels.length === 0) {
    console.log('Invalid or empty labels array');
    return null;
  }

  if (!Array.isArray(spec.data.datasets) || spec.data.datasets.length === 0) {
    console.log('Invalid or empty datasets array');
    return null;
  }

  // Validate that datasets have actual data
  const hasValidData = spec.data.datasets.some((ds: any) => 
    Array.isArray(ds.data) && ds.data.length > 0
  );

  if (!hasValidData) {
    console.log('No valid data in datasets');
    return null;
  }

  const { chartType, data, options } = spec;
  const { labels, datasets } = data;

  try {
    console.log('Chart spec received:', spec);
    console.log('Chart type:', chartType);
    console.log('Data labels:', labels);
    console.log('Data datasets:', datasets);

    // Build chartData merging multiple datasets with validation
    const chartData = labels.map((lbl: string, i: number) => {
      const entry: Record<string, any> = { name: lbl || `Item ${i + 1}` };
      datasets.forEach((ds: any) => {
        if (ds && ds.label && Array.isArray(ds.data)) {
          entry[ds.label] = ds.data[i] ?? 0;
        }
      });
      return entry;
    });

    // Filter out entries with no data
    const validChartData = chartData.filter((entry: Record<string, any>) => 
      Object.keys(entry).length > 1 // More than just 'name'
    );

    console.log('Processed chart data:', validChartData);

    if (validChartData.length === 0) {
      console.log('No valid chart data after processing');
      return <div className="text-red-500 p-4">No valid data to display in chart</div>;
    }

    const titleText = options?.title?.text;

    // Render the appropriate chart based on type
    const renderChart = () => {
      switch (chartType) {
        case 'bar':
          return (
            <BarChart data={validChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {datasets.map((ds: any, idx: number) => (
                <Bar 
                  key={idx} 
                  dataKey={ds.label} 
                  name={ds.label}
                  fill={ds.backgroundColor || CHART_COLORS[idx % CHART_COLORS.length]}
                />
              ))}
            </BarChart>
          );
        case 'pie':
          return (
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <Pie
                data={validChartData}
                dataKey={datasets[0]?.label}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {validChartData.map((_: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          );
        case 'line':
          return (
            <LineChart data={validChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {datasets.map((ds: any, idx: number) => (
                <Line 
                  key={idx} 
                  type="monotone" 
                  dataKey={ds.label} 
                  name={ds.label}
                  stroke={ds.borderColor || CHART_COLORS[idx % CHART_COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          );
        default:
          return <div className="text-yellow-600 p-4">Unsupported chart type: {chartType}</div>;
      }
    };

    return (
      <div className="mb-4">
        {titleText && <h3 className="text-center font-semibold mb-2">{titleText}</h3>}
        <div className="w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering chart:', error);
    return <div className="text-red-500 p-4">Error rendering chart: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }
}

export default function InsightsAndChat({ projectId, chats, widthClassName = 'w-[480px]' }: IntegrationsProps) {
  const [messages, setMessages] = useState<Message[]>([...chats]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [creditUsage, setCreditUsage] = useState<UsageData | undefined>()
  const [isLowCredit, setIsLowCredit] = useState<boolean>(false)
  const chatContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text || isLoading) return;
    const chatToSend: Message[] = []
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    chatToSend.push({ role: 'user', content: text })
    setChatInput('');
    setTimeout(() => {
      setIsLoading(true);
    }, 100)

    const data = await getCreditUsage()
    if (data) {
        setCreditUsage(data)
      }

    if(data.remaining_credits <= 0) {
      setIsLowCredit(true)
      return;
    }

    const historyPayload = [...messages, { role: 'user', content: text }].map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    try {
      const result = await sendChat({
        message: text,
        project_id: projectId,
        history: historyPayload,
      });

      const aiContent = result.response ?? '';
      setMessages((prev) => [...prev, { role: 'ai', content: aiContent }]);
      if(aiContent) {
        setIsLoading(false)
      }
      chatToSend.push({ role: 'ai', content: aiContent })
      if (chatToSend.length === 2) {
        const conversationData = {
        project_id: projectId,
        messages: [...chatToSend]
      }
      await storeConversation(conversationData)
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'ai', content: 'Sorry, something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
  const handleGetCredits = async () => {
    try {
      const data = await getCreditUsage();
      if (data) {
        setCreditUsage(data)
      }
      if(data.remaining_credits <= 0) {
        setIsLowCredit(true)
      }
    } catch (err) {
      console.error("Failed to fetch credits:", err);
    }
  };

  handleGetCredits();
}, []);

  return (
    <OverlayPopup
      widthClassName={widthClassName}
      buttonLabel="Insights & Chat"
      creditUsage={creditUsage}
    >
        <div className="relative flex flex-col max-h-[75vh] mx-auto w-full lg:w-3/4">
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 pb-24"
          >
          <div className='flex justify-center items-center'>
            <h1 className='text-xl'>Hi, I am your chatbot, what can I help you today?</h1>
          </div>

            {messages.map((msg, i) => {
              const { narrative, spec } = parseMessage(msg.content);
              const hasChart = !!spec;
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[100%] w-fit px-4 py-2 break-words ${
                    msg.role === 'user'
                      ? 'ml-auto bg-gray-100 text-black rounded-2xl shadow-sm max-w-[50%]'
                      : 'mr-auto text-black'
                  }`}
                >
                  {narrative && (
                    <div className="prose prose-md max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {narrative}
                      </ReactMarkdown>
                    </div>
                  )}
                  {spec && (
                    <div className="mt-5">
                      <ChartRenderer spec={spec} />
                    </div>
                  )}
                </motion.div>
              );
            })}
            
            {/* Loading message */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[70%] w-fit mr-auto bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl shadow-sm"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                  </div>
                  <span className="text-gray-600 text-sm">AI thinking...</span>
                </div>
              </motion.div>
            )}
          </div>

          {isLowCredit && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-2 text-center font-semibold flex flex-col justify-center items-center">
              You have run out of credits. Please top up to continue chatting.
              <BuyCreditsModal/>
            </div>
          )}

          <div className="flex items-center">
            <textarea
              rows={3}
              disabled={isLowCredit}
              className="flex-1 bg-gray-100 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none overflow-hidden"
              placeholder="Ask anything"
              value={chatInput}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setChatInput(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button 
              className={`-ml-8 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={handleSend}
              disabled={isLoading || isLowCredit }
            >
              <Send className={`h-6 w-6 ${isLoading ? 'text-gray-400' : 'text-blue-600'}`} />
            </button>
          </div>
        </div>
    </OverlayPopup>
  );
}