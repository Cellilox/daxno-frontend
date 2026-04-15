'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Sparkles, X, Plus } from 'lucide-react';
import { deleteColumn, createColumn } from '@/actions/column-actions';
import { backfillAwaitingRecords } from '@/actions/backfill-actions';
import { Field } from './spreadsheet/types';

interface ColumnRecommendationBannerProps {
  projectId: string;
  /** Controlled: live column list from Records — syncs automatically with spreadsheet changes */
  fields: Field[];
  onClose: () => void;
}

export default function ColumnRecommendationBanner({
  projectId,
  fields,
  onClose,
}: ColumnRecommendationBannerProps) {
  const [isAnalyzing, startAnalyze] = useTransition();
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  const handleRemoveField = async (fieldId: string) => {
    // field_deleted socket event will update `columns` in Records → prop updates automatically
    await deleteColumn(fieldId, projectId);
  };

  const handleAddField = async () => {
    const name = inputValue.trim();
    if (!name) { setShowInput(false); return; }
    setIsAdding(true);
    try {
      const id = crypto.randomUUID();
      // field_created socket event will update `columns` in Records → prop updates automatically
      await createColumn({ name, id, description: '' }, projectId);
    } catch (err) {
      console.error('[Banner] Failed to add column:', err);
    } finally {
      setInputValue('');
      setShowInput(false);
      setIsAdding(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddField();
    if (e.key === 'Escape') { setInputValue(''); setShowInput(false); }
  };

  const handleAnalyze = () => {
    startAnalyze(async () => {
      await backfillAwaitingRecords(projectId);
      onClose();
    });
  };

  return (
    <div className="mb-3 bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-800">
            AI recommended columns based on your document
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-indigo-400 hover:text-indigo-600 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>

      <p className="text-xs text-indigo-600">
        Review these columns, remove any you don&apos;t need, or add missing ones — then click{' '}
        <strong>Analyze Now</strong> to extract data from your document.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        {fields.map(field => (
          <span
            key={field.hidden_id}
            className="flex items-center gap-1 bg-white border border-indigo-200 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {field.name}
            <button
              onClick={() => handleRemoveField(field.hidden_id)}
              className="hover:text-red-500 transition-colors ml-0.5"
              aria-label={`Remove ${field.name}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}

        {/* Inline add-column input */}
        {showInput ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onBlur={handleAddField}
              placeholder="Column name…"
              disabled={isAdding}
              className="text-xs border border-indigo-300 rounded-full px-2.5 py-1 bg-white text-indigo-800 placeholder-indigo-300 outline-none focus:ring-1 focus:ring-indigo-400 w-32 disabled:opacity-50"
            />
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 border border-dashed border-indigo-300 hover:border-indigo-500 px-2.5 py-1 rounded-full transition-colors"
          >
            <Plus size={11} />
            Add column
          </button>
        )}

        {fields.length === 0 && !showInput && (
          <span className="text-xs text-indigo-400 italic">
            No columns — add one above or type a name.
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || fields.length === 0}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Sparkles size={13} />
          {isAnalyzing ? 'Starting analysis…' : 'Analyze Now'}
        </button>
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
