'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { Model } from '@/types';
import { selectModel } from '@/actions/ai-models-actions';
import LoadingSpinner from './ui/LoadingSpinner';

type ModelSelectorProps = {
  models: Model[];
  tenantModal: string;
  plan: string;
  disabled?: boolean;
  projectId?: string;
};

export default function ModelSelector({ models, tenantModal, plan, disabled = false, projectId }: ModelSelectorProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>();
  const [userHasSelected, setUserHasSelected] = useState(false);
  const [filter, setFilter] = useState('');
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [pickedModel, setPickedModal] = useState('')
  useEffect(() => {
    setSelectedModel(tenantModal)
  }, [tenantModal])


  const handleSelectModal = async (selectedModal: string) => {
    setPickedModal(selectedModal)
    setIsLoading(true)
    await selectModel(selectedModal, projectId)
    setIsLoading(false)
  }


  const extractLabel = (full: string) => {
    // If it looks like a model ID (contains /), return the part after /
    if (full.includes('/')) {
      const afterSlash = full.split('/').pop() || full;
      return afterSlash.replace(':free', '').trim();
    }
    // Otherwise assume it's "Vendor: Model Name" format
    const parts = full.split(':');
    if (parts.length > 1) {
      return parts.slice(1).join(':').replace(/\s*\(free\)/i, '').trim();
    }
    return full.replace(/\s*\(free\)/i, '').trim();
  }

  //   useEffect(() => {
  //     if (models.some((m) => m.id.endsWith(':free'))) {
  //       const deep = models.find((m) => m.id.includes(`${process.env.NEXT_PUBLIC_DEFAULT_FREE_MODEL}`));
  //       setSelectedModel(deep?.id || models[0]?.id || '');
  //     } else {
  //       const mistral = models.find((m) =>
  //         extractLabel(m.name).toLowerCase().includes(`${process.env.NEXT_PUBLIC_DEFAULT_PAID_MODEL}`)
  //       );
  //       setSelectedModel(mistral?.id || models[0]?.id || '');
  //     }
  //   }, [models]);

  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLButtonElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    // If clicking inside the wrapper (which includes button + dropdown), ignore
    if (overlayRef.current && overlayRef.current.contains(e.target as Node)) {
      return;
    }
    // If clicking the toggle button itself (handled by its own onClick)
    if (selectorRef.current && selectorRef.current.contains(e.target as Node)) {
      return;
    }

    // Otherwise close everything
    setOpen(false);
    if (showTooltip && tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
      setShowTooltip(false);
    }
  };
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, showTooltip]);

  const filteredModels = models.filter((m) =>
    extractLabel(m.name).toLowerCase().includes(filter.toLowerCase())
  );

  const displayLabel = models.find((m) => m.id === selectedModel)
    ? extractLabel(models.find((m) => m.id === selectedModel)!.name)
    : extractLabel(selectedModel || 'Auto');

  const handleSelect = async (id: string) => {
    await handleSelectModal(id)
    setSelectedModel(id);
    setUserHasSelected(true);
    setOpen(false);
  };

  const handleButtonClick = () => {
    if (disabled) return;
    if (autoEnabled && !userHasSelected) {
      setShowTooltip(true);
    } else {
      setOpen(true);
    }
  };


  return (
    <div className="relative inline-block text-left">
      <button
        ref={selectorRef}
        onClick={handleButtonClick}
        disabled={disabled}
        className={`w-48 text-left border rounded-md shadow-sm p-2 flex items-center justify-between relative transition-colors
          ${disabled
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            : 'border-blue-400 hover:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white'
          }`}
      >
        <div className="flex items-center overflow-hidden">
          {autoEnabled && !userHasSelected && (
            <span className="px-1 mr-1 bg-gray-200 text-gray-600 text-xs rounded">Auto</span>
          )}
          <span className="text-sm font-medium truncate">{displayLabel}</span>
        </div>
        <ChevronDown size={20} className="ml-2 text-blue-600" />
      </button>

      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute z-50 mt-2 w-48 p-4 bg-white border border-gray-200 rounded shadow-lg left-0 top-full"
        >
          <p className="text-sm text-gray-700 mb-2">
            Balanced quality and speed, recommended for most tasks.
          </p>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!autoEnabled}
              onChange={() => {
                setAutoEnabled(false);
                setShowTooltip(false);
                setOpen(true);
              }}
            />
            <span className="text-sm">Disable Auto</span>
          </label>
        </div>
      )}

      {open && (
        <div
          ref={overlayRef}
          className="absolute z-50 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none max-h-[60vh] overflow-auto"
        >
          <div className="p-4">
            <div className="flex items-center mb-4">
              <Search size={16} className="text-gray-500 mr-2" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter models..."
                className="w-full border-b border-gray-300 focus:outline-none p-1 text-sm"
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
            <ul>
              {filteredModels.map((model) => {
                const tier = model.tier || 'free';
                const isSpecialPlan = ['gyok', 'byok', 'managed'].includes(plan?.toLowerCase());

                let isDisabled = false;
                if (!isSpecialPlan) {
                  if (tier === 'starter') {
                    isDisabled = !['Starter', 'Professional'].includes(plan);
                  } else if (tier === 'professional') {
                    isDisabled = plan !== 'Professional';
                  }
                }

                return (
                  <li
                    key={model.id}
                    className={`flex justify-between items-center p-2 rounded ${isDisabled
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-100 cursor-pointer'
                      }`}
                    onClick={() => !isDisabled && handleSelect(model.id)}
                  >
                    <div className="flex items-center">
                      <span>{extractLabel(model.name)}</span>
                      {!isSpecialPlan && tier === 'starter' && <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-1 rounded font-bold">STARTER</span>}
                      {!isSpecialPlan && tier === 'professional' && <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded font-bold">PRO</span>}
                    </div>
                    {selectedModel === model.id && (
                      <Check size={16} className="text-green-600 ml-2" />
                    )}
                    {model.id === pickedModel && isLoading ? <LoadingSpinner /> : null}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}