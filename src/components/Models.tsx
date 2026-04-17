'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Check, Search, Plus, Lock } from 'lucide-react';
import { Model } from '@/types';
import { selectModel } from '@/actions/ai-models-actions';
import LoadingSpinner from './ui/LoadingSpinner';

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
}

type ModelSelectorProps = {
  models: Model[];
  tenantModal: string;
  disabled?: boolean;
  projectId?: string;
  isFreePlan?: boolean;
};

export default function ModelSelector({ models, tenantModal, disabled = false, projectId, isFreePlan = false }: ModelSelectorProps): JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>();
  const [userHasSelected, setUserHasSelected] = useState(false);
  const [filter, setFilter] = useState('');
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
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
      return (full.split('/').pop() || full).trim();
    }
    // Otherwise assume it's "Vendor: Model Name" format
    const parts = full.split(':');
    if (parts.length > 1) {
      return parts.slice(1).join(':').trim();
    }
    return full.trim();
  }

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
    setShowUpgradeBanner(false);
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
    setShowUpgradeBanner(false);
  };

  const handleButtonClick = () => {
    if (disabled) return;
    setShowUpgradeBanner(false);
    if (autoEnabled && !userHasSelected) {
      setShowTooltip(true);
    } else {
      setOpen(true);
    }
  };

  const handleAddMoreModelsClick = () => {
    if (isFreePlan) {
      setShowUpgradeBanner((prev) => !prev);
      return;
    }

    setOpen(false);
    router.push('/billing?tab=configuration');
  };

  const handleUpgradeClick = () => {
    setOpen(false);
    setShowUpgradeBanner(false);
    router.push('/billing?tab=configuration&option=managed');
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
            <span className="px-1 py-0.5 mr-1 bg-gray-200 text-gray-600 text-xs rounded font-medium">Auto</span>
          )}
          <span className="text-sm font-medium truncate">{displayLabel}</span>
        </div>
        <ChevronDown size={16} className="ml-2 text-blue-600" />
      </button>

      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute z-50 mt-2 w-48 p-4 bg-white border border-gray-200 rounded shadow-lg left-0 top-full"
        >
          <p className="text-sm text-gray-600 mb-2">
            Balanced quality and speed, recommended for most tasks.
          </p>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3.5 h-3.5"
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
              {filteredModels.map((model) => (
                <li
                  key={model.id}
                  className="flex justify-between items-center p-2 rounded hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelect(model.id)}
                >
                  <div className="flex items-center">
                    <span className="text-sm">{extractLabel(model.name)}</span>
                  </div>
                  {selectedModel === model.id && (
                    <Check size={16} className="text-green-600 ml-2" />
                  )}
                  {model.id === pickedModel && isLoading ? <LoadingSpinner /> : null}
                </li>
              ))}
            </ul>
            {!disabled && (
              <div className="border-t border-gray-100 mt-2 pt-2 px-1">
                <button
                  type="button"
                  onClick={handleAddMoreModelsClick}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2.5 rounded transition-colors w-full text-left"
                >
                  <Plus size={16} />
                  Add more models
                </button>

                {isFreePlan && showUpgradeBanner && (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-start gap-2">
                      <Lock size={14} className="mt-0.5 text-amber-700 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-900">
                          Upgrade to add more models
                        </p>
                        <p className="mt-1 text-xs text-amber-800">
                          Free standard users stay on the Free Models Router. Upgrade to Managed to unlock additional model choices.
                        </p>
                        <button
                          type="button"
                          onClick={handleUpgradeClick}
                          className="mt-3 inline-flex items-center rounded-md bg-amber-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
                        >
                          Upgrade in billing
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
