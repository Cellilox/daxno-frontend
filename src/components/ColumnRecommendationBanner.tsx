'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Sparkles, X, Plus, AlertTriangle, Trash2, Info } from 'lucide-react';
import { deleteColumn, createColumn } from '@/actions/column-actions';
import { backfillAwaitingRecords } from '@/actions/backfill-actions';
import { deleteRecord } from '@/actions/record-actions';
import { Field } from './spreadsheet/types';

export interface RecommendationOutlier {
  record_id: string;
  filename: string;
  detected_type: string;
  reason: string;
}

interface ColumnRecommendationBannerProps {
  projectId: string;
  /** Controlled: live column list from Records — syncs automatically with spreadsheet changes */
  fields: Field[];
  /** Majority document type detected by the AI (e.g. "invoice"). Null = no classification available. */
  documentType?: string | null;
  /** Total number of documents the recommendation was based on. */
  totalDocuments?: number;
  /** Files flagged by the AI as not matching the majority type. */
  outliers?: RecommendationOutlier[];
  onClose: () => void;
}

export default function ColumnRecommendationBanner({
  projectId,
  fields,
  documentType = null,
  totalDocuments = 0,
  outliers = [],
  onClose,
}: ColumnRecommendationBannerProps) {
  const [isAnalyzing, startAnalyze] = useTransition();
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const matchingCount = Math.max(0, totalDocuments - outliers.length);

  const handleRemoveOutlier = async (recordId: string) => {
    setRemovingIds(prev => {
      const next = new Set(prev);
      next.add(recordId);
      return next;
    });
    try {
      // record_deleted socket event removes the row from Records state.
      await deleteRecord(recordId);
    } catch (err) {
      console.error('[Banner] Failed to remove outlier:', err);
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(recordId);
        return next;
      });
    }
  };

  const visibleOutliers = outliers.filter(o => !removingIds.has(o.record_id));

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

      {documentType && totalDocuments > 0 && (
        <p className="text-xs text-indigo-700">
          AI analyzed <strong>{totalDocuments}</strong>{' '}
          {totalDocuments === 1 ? 'file' : 'files'} and detected{' '}
          <strong>{matchingCount} {documentType}{matchingCount === 1 ? '' : 's'}</strong>
          {visibleOutliers.length > 0 && (
            <> — {visibleOutliers.length} {visibleOutliers.length === 1 ? 'file looks' : 'files look'} different.</>
          )}
        </p>
      )}

      {visibleOutliers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-600" />
            <span className="text-xs font-semibold text-amber-800">
              Possible outlier{visibleOutliers.length === 1 ? '' : 's'} — {visibleOutliers.length === 1 ? 'this file looks' : 'these files look'} different
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {visibleOutliers.map(outlier => {
              const isRemoving = removingIds.has(outlier.record_id);
              return (
                <div
                  key={outlier.record_id}
                  className="flex items-start justify-between gap-3 bg-white border border-amber-200 rounded px-2.5 py-1.5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-amber-900 truncate">
                      <span className="font-medium">{outlier.filename}</span>
                      {' — looks like a '}
                      <strong>{outlier.detected_type}</strong>
                    </div>
                    {outlier.reason && (
                      <div className="text-[11px] text-amber-700/80 mt-0.5 truncate">
                        {outlier.reason}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveOutlier(outlier.record_id)}
                    disabled={isRemoving}
                    className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    aria-label={`Remove ${outlier.filename}`}
                  >
                    <Trash2 size={12} />
                    {isRemoving ? 'Removing…' : 'Remove file'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-indigo-600">
        Review these columns, remove any you don&apos;t need, or add missing ones — then click{' '}
        <strong>Analyze Now</strong> to extract data from your document.
      </p>

      <div className="flex items-start gap-1.5 bg-white border border-indigo-200 rounded-md px-2.5 py-1.5">
        <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-indigo-700 leading-snug">
          Tip: click a column header to add a <strong>description</strong>. Descriptions help the AI pick the right value when the document has multiple candidates (e.g. &ldquo;the invoice issue date at the top&rdquo;) — they can also invite computed values like &ldquo;sum of all line items&rdquo;.
        </p>
      </div>

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
