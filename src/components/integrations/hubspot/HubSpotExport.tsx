// src/components/HubSpotExport.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { HubSpotIcon } from './ui/HubSpotIcon';
import { SuccessIcon } from './ui/SuccessIcon';
import { ErrorIcon } from './ui/ErrorIcon';
import { HubSpotExportProps, HubSpotExportType } from './types';
import { EXPORT_TYPES } from './constants';
import { checkConnection, handleConnect, exportToHubSpot, getHubSpotProperties, DisconnectHubspot } from '@/actions/hubspot-actions';
import { LoadingSpinner as DisconnectingSpinner } from '../google-drive/ui/LoadingSpinner';
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
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [status, setStatus] = useState<ExportStatus>({
    isLoading: false,
    isConnected: false,
    success: false,
    error: null,
    lastExportDate: null,
    isCheckingConnection: true
  });

  // Define required fields by HubSpot object type
  const REQUIRED_FIELDS = {
    contacts: {
      primary: ['email'],
      alternative: [['firstname', 'lastname']],
      message: 'Contacts typically require "email" OR both "firstname" and "lastname" for best results in HubSpot.'
    },
    companies: {
      primary: ['name'],
      alternative: [['domain']],
      message: 'Companies typically require "name" OR "domain" for best results in HubSpot.'
    },
    deals: {
      primary: ['dealname', 'dealstage', 'pipeline'],
      alternative: [],
      message: 'Deals typically require "dealname", "dealstage", and "pipeline" for best results in HubSpot.'
    }
  };

  // Check if required fields are mapped
  const checkRequiredFields = (): { isValid: boolean; missingFields: string[] } => {
    if (!selectedType) return { isValid: true, missingFields: [] };

    const required = REQUIRED_FIELDS[selectedType];
    const mappedHubSpotFields = Array.from(propertyMappings.values());

    // Check if primary required fields are mapped
    const hasPrimary = required.primary.every(field =>
      mappedHubSpotFields.includes(field)
    );

    // Check if any alternative combination is mapped
    const hasAlternative = required.alternative.some(combo =>
      combo.every(field => mappedHubSpotFields.includes(field))
    );

    if (hasPrimary || hasAlternative) {
      return { isValid: true, missingFields: [] };
    }

    // Determine which fields are missing
    const missingFields = [...required.primary];
    if (required.alternative.length > 0) {
      const altText = required.alternative.map(combo => combo.join(' + ')).join(' OR ');
      return {
        isValid: false,
        missingFields: [`${missingFields.join(', ')} OR ${altText}`]
      };
    }

    return { isValid: false, missingFields };
  };

  const requiredFieldsCheck = checkRequiredFields();

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
    // Validate that at least one field is mapped
    if (propertyMappings.size === 0) {
      setValidationError('Please map at least one field to a HubSpot property before exporting.');
      return;
    }

    if (!selectedType || !records.length) {
      setValidationError('No records to export or type not selected');
      return;
    }

    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    setValidationError(null);

    try {
      // Create mapping from field name to hidden_id
      const fieldNameToHiddenId = new Map(
        fields.map(field => [field.name, field.hidden_id])
      );

      const mappedRecords = records.map(record => {
        if (!record.id) {
          throw new Error('Record ID is required for export');
        }

        const properties: Record<string, string> = {};

        propertyMappings.forEach((hubspotProperty, ourFieldName) => {
          // Get the hidden_id for this field name
          const hiddenId = fieldNameToHiddenId.get(ourFieldName);

          if (hiddenId) {
            // Access answers using hidden_id
            const answer = record.answers[hiddenId];
            properties[hubspotProperty] = answer?.text || '';
          }
        });

        properties['recordidd'] = record.id;

        return {
          id: record.id,
          id_property: 'recordidd',
          properties: properties
        };
      });

      const payload = {
        [selectedType]: mappedRecords
      };

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
          // Try to parse structured error from backend
          if (error.message.includes('HubSpot API Error:')) {
            const errorParts = error.message.split('HubSpot API Error:');
            if (errorParts.length > 1) {
              const hubspotError = errorParts[1].trim();
              try {
                const parsedError = JSON.parse(hubspotError);
                errorMessage = parsedError.detail || hubspotError;
              } catch {
                // If not JSON, use the raw message
                errorMessage = hubspotError;
              }
            }
          } else if (error.message.includes('detail')) {
            // Try to extract detail from error message
            try {
              const errorObj = JSON.parse(error.message);
              errorMessage = errorObj.detail || error.message;
            } catch {
              errorMessage = error.message;
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

  const disconnectHubspot = async () => {
    try {
      setIsDisconnecting(true)
      await DisconnectHubspot();
      setStatus(prev => ({
        ...prev,
        isConnected: false,
      }))
      setIsDisconnecting(false)
    } catch (error) {
      alert('Error disconnecting from HubSpot');
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HubSpotIcon className="w-4 h-4 text-[#FF7A59]" />
          <h3 className="text-sm font-medium text-gray-900">Export to HubSpot</h3>
        </div>
        {status.isConnected && (
          <>
            {isDisconnecting ?
              <div className="flex items-center justify-end">
                <DisconnectingSpinner />
                <span className="text-sm font-medium text-gray-900">
                  Disconnecting...
                </span>
              </div> :
              <h3 onClick={disconnectHubspot} className="text-sm font-medium text-gray-900 cursor-pointer underline">Disconnect</h3>
            }
          </>
        )}
      </div>

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

      {/* Warning for missing required fields */}
      {status.isConnected && selectedType && propertyMappings.size > 0 && !requiredFieldsCheck.isValid && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-amber-800">
              Missing Recommended Fields
            </h4>
            <p className="text-sm text-amber-700 mt-1">
              {REQUIRED_FIELDS[selectedType].message}
            </p>
            <p className="text-xs text-amber-600 mt-2">
              You can still export, but these records may be less useful in HubSpot without these fields.
            </p>
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
              transition-colors duration-200 text-sm
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
                <span className="text-sm font-medium">
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
        <div className="mt-6 relative flex flex-col h-[calc(100vh-16rem)]">
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
            <div className="flex flex-col flex-1">
              {/* Scrollable container for our properties */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="space-y-4 p-2">
                  {fields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex-1 min-w-0">
                        <label className="block text-sm font-medium text-gray-700 truncate">
                          {field.name}
                        </label>
                      </div>
                      <div className="flex items-center">
                        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                      <div className="w-1/2 min-w-0">
                        <button
                          onClick={() => {
                            setSelectedOurField(field.name);
                            setShowHubSpotProperties(true);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF7A59] focus:border-[#FF7A59] truncate"
                        >
                          {propertyMappings.get(field.name)
                            ? availableProperties.find(p => p.name === propertyMappings.get(field.name))?.label
                            : 'Select HubSpot field'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* HubSpot Properties Modal */}
              {showHubSpotProperties && (
                <div className="p-4 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                    <div className="p-4">
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
                              className={`p-3 rounded-md cursor-pointer hover:bg-gray-50 ${propertyMappings.get(selectedOurField || '') === property.name
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
                {/* Show mapped fields count */}
                <div className="mb-2 text-sm text-gray-600">
                  {propertyMappings.size > 0 ? (
                    <span className="text-green-600 font-medium">
                      ✓ {propertyMappings.size} field{propertyMappings.size !== 1 ? 's' : ''} mapped
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium">
                      ⚠ No fields mapped yet
                    </span>
                  )}
                </div>
                <button
                  onClick={handleExport}
                  disabled={status.isLoading || propertyMappings.size === 0}
                  className="w-full bg-[#FF7A59] text-white py-2 px-4 rounded-md hover:bg-[#FF8A69] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  title={propertyMappings.size === 0 ? "Please map at least one field before exporting" : "Export to HubSpot"}
                >
                  {status.isLoading ? (
                    <div className="flex items-center justify-center">
                      <DisconnectingSpinner />
                      <span className="ml-2">Exporting...</span>
                    </div>
                  ) : (
                    'Export to HubSpot'
                  )}
                </button>
              </div>
            </div>
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