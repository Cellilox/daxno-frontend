// src/components/HubSpotExport.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { HubSpotIcon } from './components/HubSpotIcon';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SuccessIcon } from './components/SuccessIcon';
import { ErrorIcon } from './components/ErrorIcon';
import { CriticalProperties } from './components/CriticalProperties';
import { HubSpotExportProps, HubSpotExportType, PropertyMapping, ExportStatus } from './types';
import { STANDARD_PROPERTIES, REQUIRED_PROPERTIES } from './constants';
import { validateAndTransformRecords } from './utils/validation';
import { checkConnection, handleConnect, exportToHubSpot } from './utils/api';

const HubSpotExport: React.FC<HubSpotExportProps> = ({ 
  projectId, 
  className = '',
  fields = [],
  records = []
}) => {
  const [selectedType, setSelectedType] = useState<HubSpotExportType | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [status, setStatus] = useState<ExportStatus>({
    isLoading: false,
    isConnected: false,
    success: false,
    error: null,
    lastExportDate: null
  });
  const [showOptions, setShowOptions] = useState(false);

  // Initialize property mappings with both our fields and required HubSpot fields
  const [propertyMappings, setPropertyMappings] = useState<PropertyMapping[]>(() => {
    return fields.map(field => ({
      ourProperty: field.name,
      hubspotProperty: '',
      isRequired: false,
      isHubspotField: false
    }));
  });

  // Function to update property mappings when type changes
  const updatePropertyMappingsForType = (type: HubSpotExportType) => {
    const appFields = propertyMappings.filter(mapping => !mapping.isHubspotField);
    
    const hubspotFields = REQUIRED_PROPERTIES[type].map(prop => {
      const existingMapping = propertyMappings.find(
        m => m.isHubspotField && m.hubspotProperty === prop.name
      );

      const ourProperty = existingMapping?.ourProperty || `hs_${prop.name}`;

      return {
        ourProperty,
        hubspotProperty: prop.name,
        isRequired: true,
        isHubspotField: true,
        defaultValue: prop.defaultValue
      };
    });

    setPropertyMappings([...appFields, ...hubspotFields]);
  };

  const handleTypeChange = (newType: HubSpotExportType) => {
    setSelectedType(newType);
    setShowOptions(false);
    setValidationError(null);
    setShowValidationErrors(false);
    setStatus(prev => ({
      ...prev,
      error: null,
      success: false
    }));
    
    updatePropertyMappingsForType(newType);
  };

  useEffect(() => {
    // Check if user has connected their HubSpot account
    const initConnection = async () => {
      try {
        const isConnected = await checkConnection();
        setStatus(prev => ({ ...prev, isConnected }));
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };
    initConnection();

    // Add event listener for messages from the OAuth popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'HUBSPOT_AUTH_SUCCESS') {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: true,
          error: null 
        }));
      } else if (event.data.type === 'HUBSPOT_AUTH_ERROR') {
        setStatus(prev => ({ 
          ...prev, 
          error: event.data.data.error || 'Failed to connect to HubSpot',
          isConnected: false
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const getMappedFields = () => {
    const mappedFields = new Set<string>();
    propertyMappings.forEach(mapping => {
      if (mapping.isHubspotField && mapping.ourProperty !== `hs_${mapping.hubspotProperty}`) {
        mappedFields.add(mapping.ourProperty);
      }
    });
    return mappedFields;
  };

  const handleExport = async () => {
    if (!status.isConnected) {
      try {
        await handleConnect();
        return;
      } catch (error) {
        setStatus(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to connect to HubSpot'
        }));
        return;
      }
    }

    if (!selectedType) {
      setValidationError('Please select an export type first');
      return;
    }

    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    setValidationError(null);
    setShowValidationErrors(true);

    // Add validation for unmapped fields
    const unmappedFields = propertyMappings
      .filter(mapping => !mapping.isHubspotField && !getMappedFields().has(mapping.ourProperty))
      .filter(mapping => !mapping.hubspotProperty);

    if (unmappedFields.length > 0) {
      const fieldNames = unmappedFields.map(mapping => mapping.ourProperty).join(', ');
      setValidationError(`Please specify HubSpot property names for: ${fieldNames}`);
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const transformedRecords = validateAndTransformRecords(records, selectedType, propertyMappings);
      const { successCount, failureCount } = await exportToHubSpot(selectedType, projectId, transformedRecords);

      setStatus(prev => ({
        ...prev,
        isLoading: false,
        success: true,
        lastExportDate: new Date().toISOString()
      }));

      if (failureCount > 0) {
        setValidationError(`Export completed with ${successCount} successful and ${failureCount} failed records`);
      }

    } catch (error) {
      console.error('Error exporting to HubSpot:', error);
      setValidationError(error instanceof Error ? error.message : 'Unknown error occurred');
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to export to HubSpot'
      }));
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {status.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <ErrorIcon />
          <div className="flex-1">
            <p className="text-sm text-red-800">{status.error}</p>
            <button
              onClick={() => setStatus(prev => ({ ...prev, error: null }))}
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

      {validationError && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {validationError}
        </div>
      )}

      <div className="space-y-2">
        <div className="relative">
          <button
            onClick={() => status.isConnected ? setShowOptions(true) : handleExport()}
            disabled={status.isLoading}
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
              <span>
                {status.isConnected 
                  ? selectedType 
                    ? `Export as ${selectedType}` 
                    : 'Select export type'
                  : 'Connect HubSpot'}
              </span>
            </div>
            {status.isConnected && <ChevronDown className="w-4 h-4" />}
          </button>

          {showOptions && status.isConnected && (
            <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Choose export type:</h3>
                <div className="space-y-2">
                  {(Object.keys(STANDARD_PROPERTIES) as HubSpotExportType[]).map((type) => (
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

      {status.isConnected && !showOptions && selectedType && (
        <>
          <div className="mt-4 space-y-3">
            {selectedType && (
              <CriticalProperties type={selectedType} />
            )}
            
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Map your fields to HubSpot properties:</h4>
              <span className="text-xs text-red-500">* Required HubSpot fields</span>
            </div>
            <div className="space-y-3">
              {propertyMappings.map((mapping, index) => {
                if (!mapping.isHubspotField && getMappedFields().has(mapping.ourProperty)) {
                  return null;
                }

                const isUnmapped = !mapping.isHubspotField && !getMappedFields().has(mapping.ourProperty);
                const hasError = showValidationErrors && isUnmapped && !mapping.hubspotProperty;

                return (
                  <div key={mapping.ourProperty} 
                    className={`flex items-center space-x-2 ${mapping.isHubspotField ? 'bg-orange-50 p-2 rounded' : ''} ${hasError ? 'border border-red-200 rounded p-2' : ''}`}
                  >
                    <span className="text-sm text-gray-600 w-1/3 truncate">
                      {mapping.isHubspotField ? `hs_${mapping.hubspotProperty}` : mapping.ourProperty}
                      {mapping.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </span>
                    <span className="text-gray-400">→</span>
                    <div className="flex-1 relative">
                      {mapping.isHubspotField ? (
                        <select
                          value={mapping.ourProperty !== `hs_${mapping.hubspotProperty}` ? mapping.ourProperty : `hs_${mapping.hubspotProperty}`}
                          onChange={(e) => {
                            const newMappings = propertyMappings.map((m, i) => {
                              if (i === index) {
                                return {
                                  ...m,
                                  ourProperty: e.target.value
                                };
                              }
                              return m;
                            });
                            setPropertyMappings(newMappings);
                          }}
                          className="w-full text-sm px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF7A59]"
                        >
                          <option value={`hs_${mapping.hubspotProperty}`}>Use default value</option>
                          {fields
                            .filter(field => {
                              return field.name === mapping.ourProperty || !getMappedFields().has(field.name);
                            })
                            .map(field => (
                              <option key={field.id} value={field.name}>
                                {field.name}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            value={mapping.hubspotProperty}
                            onChange={(e) => {
                              const newMappings = propertyMappings.map((m, i) => {
                                if (i === index) {
                                  return {
                                    ...m,
                                    hubspotProperty: e.target.value
                                  };
                                }
                                return m;
                              });
                              setPropertyMappings(newMappings);
                            }}
                            placeholder="HubSpot property name"
                            className={`w-full text-sm px-3 py-1 border ${hasError ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF7A59]`}
                          />
                          {hasError && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleExport}
              disabled={status.isLoading}
              className="mt-4 w-full bg-[#FF7A59] text-white py-2 px-4 rounded-md hover:bg-[#FF8A69] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status.isLoading ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HubSpotExport;