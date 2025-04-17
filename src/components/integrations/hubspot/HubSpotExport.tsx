// src/components/HubSpotExport.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { HubSpotIcon } from './components/HubSpotIcon';
import { SuccessIcon } from './components/SuccessIcon';
import { ErrorIcon } from './components/ErrorIcon';
import { HubSpotExportProps, HubSpotExportType } from './types';
import { EXPORT_TYPES } from './constants';
import { checkConnection, handleConnect, exportToHubSpot, getHubSpotProperties } from '@/actions/hubspot-actions';

interface HubSpotProperty {
  name: string;
  label: string;
  fieldType: string;
}

interface LoadingSpinnerProps {
  className?: string;
}

interface ExportStatus {
  isLoading: boolean;
  isConnected: boolean;
  success: boolean;
  error: string | null;
  lastExportDate: string | null;
  isCheckingConnection: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = '' }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const HubSpotExport: React.FC<HubSpotExportProps> = ({ 
  projectId, 
  className = '',
  fields = [],
  records = []
}) => {
  const [selectedType, setSelectedType] = useState<HubSpotExportType | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [availableProperties, setAvailableProperties] = useState<HubSpotProperty[]>([]);
  const [propertyMappings, setPropertyMappings] = useState<Map<string, string>>(new Map());
  const [showOptions, setShowOptions] = useState(false);
  const [showHubSpotProperties, setShowHubSpotProperties] = useState(false);
  const [selectedOurField, setSelectedOurField] = useState<string | null>(null);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [status, setStatus] = useState<ExportStatus>({
    isLoading: false,
    isConnected: false,
    success: false,
    error: null,
    lastExportDate: null,
    isCheckingConnection: true
  });

  useEffect(() => {
    const initConnection = async () => {
      try {
        setStatus(prev => ({ ...prev, isCheckingConnection: true }));
        const isConnected = await checkConnection();
        setStatus(prev => ({ ...prev, isConnected, isCheckingConnection: false }));
      } catch (error) {
        console.error('Error checking connection:', error);
        setStatus(prev => ({ ...prev, isCheckingConnection: false }));
      }
    };
    initConnection();

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'HUBSPOT_AUTH_SUCCESS') {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: true,
          error: null,
          isCheckingConnection: false
        }));
      } else if (event.data.type === 'HUBSPOT_AUTH_ERROR') {
        setStatus(prev => ({ 
          ...prev, 
          error: event.data.data.error || 'Failed to connect to HubSpot',
          isConnected: false,
          isCheckingConnection: false
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleTypeChange = async (newType: HubSpotExportType) => {
    setSelectedType(newType);
    setShowOptions(false);
    setIsLoadingProperties(true);
    try {
      const result = await getHubSpotProperties(newType);
      setAvailableProperties(result.properties);
      setPropertyMappings(new Map());
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Failed to fetch properties');
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const handleMappingChange = (hubspotProperty: string, answerField: string) => {
    setPropertyMappings(new Map(propertyMappings.set(answerField, hubspotProperty)));
  };

  const handleExport = async () => {
    if (!selectedType || !records.length) {
      setValidationError('No records to export or type not selected');
      return;
    }

    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    setValidationError(null);
    
    try {
      const mappedRecords = records.map(record => {
        if (!record.id) {
          throw new Error('Record ID is required for export');
        }

        // Initialize properties as a plain object
        const properties: Record<string, string> = {};
        
        // Process each mapping - our field is the key, HubSpot property is the value
        propertyMappings.forEach((hubspotProperty, ourField) => {
          // Get the value from our record
          const value = record.answers[ourField];
          
          // For all properties, use the value as is or empty string if undefined
          properties[hubspotProperty] = value !== undefined && value !== null ? String(value) : '';
        });

        // Always add recordidd to properties
        properties['recordidd'] = record.id;

        // Return the record with recordidd as the unique identifier
        return {
          id: record.id,
          id_property: 'recordidd',
          properties: properties
        };
      });

      // Create the final payload
      const payload = {
        [selectedType]: mappedRecords
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));
      
      // Send the payload
      await exportToHubSpot(selectedType, mappedRecords);

      setStatus(prev => ({
        ...prev,
        isLoading: false,
        success: true,
        lastExportDate: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error exporting to HubSpot:', error);
      
      let errorMessage = 'Failed to export to HubSpot';
      
      if (error instanceof Error) {
        try {
          if (error.message.includes('HubSpot API Error:')) {
            const hubspotError = JSON.parse(error.message.split('HubSpot API Error:')[1].trim());
            if (hubspotError.detail) {
              errorMessage = hubspotError.detail;
            }
          } else {
            errorMessage = error.message;
          }
        } catch (parseError) {
          console.error('Error parsing HubSpot error:', parseError);
          errorMessage = error.message;
        }
      }

      setValidationError(errorMessage);
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  };

  const handleHubSportConnection = async () => {
    if (!status.isConnected) {
      try {
        const data = await handleConnect();
        const width = 600;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          //@ts-ignore
          data.auth_url,
          'Connect to HubSpot',
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        if (popup) {
          const checkPopup = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkPopup);
            }
          }, 1000);
        }
      } catch (error) {
        setStatus(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to connect to HubSpot'
        }));
      }
    }
  };

  // Filter HubSpot properties based on search query
  const filteredProperties = availableProperties.filter(property => 
    property.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {(status.error || validationError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <ErrorIcon />
          <div className="flex-1">
            <p className="text-sm text-red-800 whitespace-pre-line">
              {status.error || validationError}
            </p>
            <button
              onClick={() => {
                setStatus(prev => ({ ...prev, error: null }));
                setValidationError(null);
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {status.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <SuccessIcon />
          <div className="flex-1">
            <p className="text-sm text-green-800">
              Successfully exported to HubSpot!
            </p>
            {status.lastExportDate && (
              <p className="text-xs text-green-600 mt-1">
                Last exported: {new Date(status.lastExportDate).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="relative">
          <button
            onClick={() => status.isConnected ? setShowOptions(true) : handleHubSportConnection()}
            disabled={status.isLoading || status.isCheckingConnection}
            className={`
              w-full flex items-center justify-between px-4 py-2 rounded-lg
              ${status.isConnected 
                ? 'bg-[#FF7A59] hover:bg-[#FF8A69] text-white' 
                : 'bg-[#FF7A59] hover:bg-[#FF8A69] text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            `}
          >
            <div className="flex items-center space-x-2">
              <HubSpotIcon />
              {status.isCheckingConnection ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner className="w-4 h-4" />
                  <span>Checking connection...</span>
                </div>
              ) : (
                <span>
                  {status.isConnected 
                    ? selectedType 
                      ? `Export as ${selectedType}` 
                      : 'Select export type'
                    : 'Connect HubSpot'}
                </span>
              )}
            </div>
            {status.isConnected && !status.isCheckingConnection && <ChevronDown className="w-4 h-4" />}
          </button>

          {showOptions && status.isConnected && (
            <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Choose export type:</h3>
                <div className="space-y-2">
                  {EXPORT_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center justify-between"
                    >
                      <span className="capitalize">{type}</span>
                      {selectedType === type && (
                        <span className="text-[#FF7A59]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {status.isConnected && selectedType && (
        <div className="mt-6 relative">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Map Your Fields to HubSpot</h3>
          
          {isLoadingProperties || !records.length ? (
            <div className="flex flex-col items-center justify-center py-8">
              <LoadingSpinner className="w-8 h-8 text-[#FF7A59]" />
              <p className="mt-4 text-sm text-gray-500">
                {isLoadingProperties 
                  ? "Loading HubSpot properties..." 
                  : "Loading your data..."}
              </p>
            </div>
          ) : availableProperties.length > 0 ? (
            <>
              {/* Scrollable container for our properties */}
              <div className="max-h-[400px] overflow-y-auto mb-4 pr-2">
                <div className="space-y-4">
                  {Object.keys(records[0]?.answers || {}).map((ourField) => (
                    <div key={ourField} className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          {ourField}
                        </label>
                      </div>
                      <div className="w-1/2">
                        <button
                          onClick={() => {
                            setSelectedOurField(ourField);
                            setShowHubSpotProperties(true);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF7A59] focus:border-[#FF7A59]"
                        >
                          {propertyMappings.get(ourField) 
                            ? availableProperties.find(p => p.name === propertyMappings.get(ourField))?.label 
                            : 'Select HubSpot field'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* HubSpot Properties Modal */}
              {showHubSpotProperties && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          Map to HubSpot Property
                        </h3>
                        <button
                          onClick={() => {
                            setShowHubSpotProperties(false);
                            setSelectedOurField(null);
                            setSearchQuery(''); // Clear search when closing
                          }}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Select a HubSpot property to map "{selectedOurField}" to
                      </p>
                      
                      {/* Search input */}
                      <div className="mt-4 relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search properties..."
                          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF7A59] focus:border-[#FF7A59]"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 overflow-y-auto">
                      <div className="space-y-2">
                        {filteredProperties.length > 0 ? (
                          filteredProperties.map((property) => (
                            <div
                              key={property.name}
                              onClick={() => {
                                if (selectedOurField) {
                                  handleMappingChange(property.name, selectedOurField);
                                  setShowHubSpotProperties(false);
                                  setSelectedOurField(null);
                                  setSearchQuery(''); // Clear search after selection
                                }
                              }}
                              className={`p-3 rounded-md cursor-pointer hover:bg-gray-50 ${
                                propertyMappings.get(selectedOurField || '') === property.name
                                  ? 'bg-[#FF7A59] bg-opacity-10 border border-[#FF7A59]'
                                  : 'border border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{property.label}</p>
                                  <p className="text-xs text-gray-500">{property.name}</p>
                                </div>
                                {propertyMappings.get(selectedOurField || '') === property.name && (
                                  <span className="text-[#FF7A59]">✓</span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-sm text-gray-500">
                              No properties match your search
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fixed export button */}
              <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
                <button
                  onClick={handleExport}
                  disabled={status.isLoading || propertyMappings.size === 0}
                  className="w-full bg-[#FF7A59] text-white py-2 px-4 rounded-md hover:bg-[#FF8A69] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status.isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner className="w-5 h-5 mr-2" />
                      <span>Exporting...</span>
                    </div>
                  ) : (
                    'Export to HubSpot'
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No HubSpot properties available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HubSpotExport;