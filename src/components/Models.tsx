'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { Model } from '@/types';
import { selecte_model } from '@/actions/ai-models-actions';
import LoadingSpinner from './ui/LoadingSpinner';

type ModelSelectorProps = {
  models: Model[];
  tenantModal: string;
};

export default function ModelSelector({ models, tenantModal }: ModelSelectorProps): JSX.Element {
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


  const handleSelectModal =  async (selectedModal: string) => {
    setPickedModal(selectedModal)
    setIsLoading(true)
    await selecte_model(selectedModal)
    setIsLoading(false)
  }


  const extractLabel = (full: string) =>
    full
      .split(':')
      .slice(1)
      .join(':')
      .replace(/\s*\(free\)/i, '')
      .trim();

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
    if (open && overlayRef.current === e.target) setOpen(false);
    if (showTooltip && tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) setShowTooltip(false);
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
    : '';

  const handleSelect = async (id: string) => {
    await handleSelectModal(id)
    setSelectedModel(id);
    setUserHasSelected(true);
    setOpen(false);
  };

  const handleButtonClick = () => {
    if (autoEnabled && !userHasSelected) {
      setShowTooltip(true);
    } else {
      setOpen(true);
    }
  };

  // calculate tooltip position
  const tooltipStyle: React.CSSProperties = {};
  if (selectorRef.current) {
    const rect = selectorRef.current.getBoundingClientRect();
    tooltipStyle.top = rect.bottom + window.scrollY;
    tooltipStyle.left = rect.left + window.scrollX;
  }

  return (
    <>
      <button
        ref={selectorRef}
        onClick={handleButtonClick}
        className="w-48 text-left border border-blue-400 rounded-md shadow-sm hover:border-blue-500 focus:ring-2 focus:ring-blue-500 p-2 flex items-center justify-between relative"
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
          className="absolute p-4 bg-white border border-gray-200 rounded shadow-lg w-48 z-50"
          style={tooltipStyle}
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[50]"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 max-h-[60vh] overflow-auto">
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
              {filteredModels.map((model) => (
                <li
                  key={model.id}
                  className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => handleSelect(model.id)}
                >
                  <span>{extractLabel(model.name)}</span>
                  {selectedModel === model.id && (
                    <Check size={16} className="text-green-600 ml-2" />
                  )}
                  {model.id === pickedModel && isLoading? <LoadingSpinner/> : null }
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}