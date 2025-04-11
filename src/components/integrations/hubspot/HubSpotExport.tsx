// src/components/HubSpotExport.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';

interface PropertyMapping {
  ourProperty: string;
  hubspotProperty: string;
  isRequired?: boolean;
  isHubspotField?: boolean;
  defaultValue?: string;
}

interface HubSpotExportProps {
  projectId: string;
  className?: string;
  fields: {
    id: string;
    name: string;
    type: string;
  }[];
  records: {
    id: string;
    answers: {
      [key: string]: string;
    };
    filename: string;
    file_key: string;
    project_id: string;
    created_at: string;
    updated_at: string;
  }[];
}

interface ExportStatus {
  isLoading: boolean;
  isConnected: boolean;
  success: boolean;
  error: string | null;
  lastExportDate: string | null;
}

// HubSpot Icon Component
const HubSpotIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0ZM12 22.5C6.201 22.5 1.5 17.799 1.5 12C1.5 6.201 6.201 1.5 12 1.5C17.799 1.5 22.5 6.201 22.5 12C22.5 17.799 17.799 22.5 12 22.5Z" fill="#FF7A59"/>
    <path d="M12 3C6.477 3 3 6.477 3 12C3 17.523 6.477 21 12 21C17.523 21 21 17.523 21 12C21 6.477 17.523 3 12 3ZM12 19.5C7.305 19.5 4.5 16.695 4.5 12C4.5 7.305 7.305 4.5 12 4.5C16.695 4.5 19.5 7.305 19.5 12C19.5 16.695 16.695 19.5 12 19.5Z" fill="#FF7A59"/>
    <path d="M12 6C8.686 6 6 8.686 6 12C6 15.314 8.686 18 12 18C15.314 18 18 15.314 18 12C18 8.686 15.314 6 12 6ZM12 16.5C9.518 16.5 7.5 14.482 7.5 12C7.5 9.518 9.518 7.5 12 7.5C14.482 7.5 16.5 9.518 16.5 12C16.5 14.482 14.482 16.5 12 16.5Z" fill="#FF7A59"/>
    <path d="M12 9C10.343 9 9 10.343 9 12C9 13.657 10.343 15 12 15C13.657 15 15 13.657 15 12C15 10.343 13.657 9 12 9Z" fill="#FF7A59"/>
  </svg>
);

// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Success Icon Component
const SuccessIcon: React.FC = () => (
  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Error Icon Component
const ErrorIcon: React.FC = () => (
  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Update back to include all export types
type HubSpotExportType = 'contacts' | 'companies' | 'deals' | 'tickets';

// Define standard properties for each HubSpot object type
const STANDARD_PROPERTIES = {
  contacts: [
    { label: 'Email', value: 'email', required: true },
    { label: 'First Name', value: 'firstname' },
    { label: 'Last Name', value: 'lastname' },
    { label: 'Phone', value: 'phone' }
  ],
  companies: [
    { label: 'Company Name', value: 'name', required: true },
    { label: 'Domain', value: 'domain' },
    { label: 'Phone', value: 'phone' }
  ],
  deals: [
    { label: 'Deal Name', value: 'dealname', required: true },
    { label: 'Amount', value: 'amount' },
    { label: 'Close Date', value: 'closedate' }
  ],
  tickets: [
    { label: 'Subject', value: 'subject', required: true },
    { label: 'Priority', value: 'priority' },
    { label: 'Description', value: 'content' }
  ]
} as const;

// Add this after the STANDARD_PROPERTIES constant
const REQUIRED_PROPERTIES = {
  contacts: [
    { name: 'email', defaultValue: '' },
  ],
  companies: [
    { name: 'name', defaultValue: 'Unnamed Company' },
    { name: 'domain', defaultValue: '' }
  ],
  deals: [
    { name: 'dealname', defaultValue: 'Unnamed Deal' },
    { name: 'pipeline', defaultValue: 'default' },
    { name: 'dealstage', defaultValue: 'appointmentscheduled' }
  ],
  tickets: [
    { name: 'subject', defaultValue: 'New Ticket' },
    { name: 'content', defaultValue: 'No content provided' },
    { name: 'hs_pipeline', defaultValue: 'default' },
    { name: 'hs_pipeline_stage', defaultValue: 'default' }
  ]
} as const;

// Add this after the REQUIRED_PROPERTIES constant
const CRITICAL_PROPERTIES = {
  contacts: [
    { name: 'email', description: 'Primary email of the contact', example: 'john@example.com' },
    { name: 'firstname', description: 'First name of the contact', example: 'John' },
    { name: 'lastname', description: 'Last name of the contact', example: 'Doe' }
  ],
  companies: [
    { name: 'name', description: 'Company name', example: 'Acme Corp' },
    { name: 'domain', description: 'Company website domain', example: 'acme.com' },
    { name: 'industry', description: 'Company industry', example: 'Technology' }
  ],
  deals: [
    { name: 'dealname', description: 'Name of the deal', example: 'Project X Contract' },
    { name: 'pipeline', description: 'Sales pipeline', example: 'default' },
    { name: 'dealstage', description: 'Stage in the pipeline', example: 'appointmentscheduled' },
    { name: 'amount', description: 'Deal amount', example: '5000' }
  ],
  tickets: [
    { name: 'subject', description: 'Ticket subject', example: 'Technical Support Request' },
    { name: 'content', description: 'Ticket description', example: 'Customer reported an issue...' },
    { name: 'hs_pipeline', description: 'Ticket pipeline', example: 'default' },
    { name: 'hs_pipeline_stage', description: 'Stage in the pipeline', example: 'default' },
    { name: 'priority', description: 'Ticket priority', example: 'HIGH, MEDIUM, LOW' }
  ]
} as const;

// Add this before the HubSpotExport component
const DUMMY_INVOICE_DATA = {
  "Invoice Number": "INV-2024-001",
  "Due Date": "2024-03-15",
  "Payment Terms": "Net 30",
  "Invoice Date": "2024-02-15",
  "Total Amount": "1,500.00",
  "Currency": "USD",
  "Customer Name": "Acme Corporation",
  "Customer Email": "billing@acmecorp.com",
  "Customer Address": "123 Business Ave, Suite 100, New York, NY 10001",
  "Customer Phone": "+1 (555) 123-4567",
  "Customer Tax ID": "US123456789",
  "Company Name": "Tech Solutions Inc.",
  "Company Address": "456 Tech Street, San Francisco, CA 94105",
  "Company Phone": "+1 (555) 987-6543",
  "Company Email": "finance@techsolutions.com",
  "Company Tax ID": "US987654321",
  "Bank Name": "Global Bank",
  "Bank Account": "1234567890",
  "Bank Routing": "021000021",
  "SWIFT Code": "GBANKUS33",
  "Item 1 Description": "Software Development Services",
  "Item 1 Quantity": "1",
  "Item 1 Unit Price": "1,500.00",
  "Item 1 Amount": "1,500.00",
  "Subtotal": "1,500.00",
  "Tax Rate": "8.5%",
  "Tax Amount": "127.50",
  "Total": "1,627.50",
  "Notes": "Payment due within 30 days of invoice date",
  "Status": "Pending",
  "Payment Method": "Bank Transfer",
  "Payment Reference": "PAY-2024-001",
  "Payment Date": "",
  "Payment Amount": "",
  "Payment Status": "Unpaid"
};

// Update the CriticalProperties component
const CriticalProperties: React.FC<{ type: HubSpotExportType }> = ({ type }) => {
  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h5 className="text-sm font-medium text-gray-700 mb-3">
        Critical Properties for {type.charAt(0).toUpperCase() + type.slice(1)}
      </h5>
      <div className="space-y-2">
        {CRITICAL_PROPERTIES[type].map((prop) => (
          <div key={prop.name} className="text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-[#FF7A59]">{prop.name}</span>
              {REQUIRED_PROPERTIES[type].some(req => req.name === prop.name) && (
                <span className="text-xs text-red-500">*required</span>
              )}
            </div>
            <p className="text-gray-600 text-xs mt-0.5">{prop.description}</p>
            <p className="text-gray-400 text-xs">Example: {prop.example}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

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
    // Start with our app fields only
    return fields.map(field => ({
      ourProperty: field.name,
      hubspotProperty: '',
      isRequired: false,
      isHubspotField: false
    }));
  });

  // Function to update property mappings when type changes
  const updatePropertyMappingsForType = (type: HubSpotExportType) => {
    // Keep our app fields
    const appFields = propertyMappings.filter(mapping => !mapping.isHubspotField);
    
    // Add required HubSpot fields for the selected type
    const hubspotFields = REQUIRED_PROPERTIES[type].map(prop => {
      // Find if this HubSpot field was previously mapped
      const existingMapping = propertyMappings.find(
        m => m.isHubspotField && m.hubspotProperty === prop.name
      );

      // If there's an existing mapping, use its ourProperty value
      // Otherwise, use the default hs_ prefix
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
    
    // Update property mappings for the new type
    const appFields = propertyMappings
      .filter(mapping => !mapping.isHubspotField)
      .map(mapping => ({
        ...mapping,
        hubspotProperty: ''
      }));

    const hubspotFields = REQUIRED_PROPERTIES[newType].map(prop => {
      const existingMapping = propertyMappings.find(
        m => m.isHubspotField && m.hubspotProperty === prop.name
      );
      return {
        ourProperty: existingMapping?.ourProperty || `hs_${prop.name}`,
        hubspotProperty: prop.name,
        isRequired: true,
        isHubspotField: true,
        defaultValue: prop.defaultValue
      };
    });
    
    setPropertyMappings([...appFields, ...hubspotFields]);
  };

  const validateAndTransformRecords = (records: any[], type: HubSpotExportType) => {
    console.log('Starting transformation with:', {
      totalRecords: records.length,
      type: type
    });

    // Transform records with validation and defaults
    const transformedRecords = records.map((record, index) => {
      const hubspotRecord: Record<string, string> = {};
      const usedFields = new Set<string>();

      // First, handle HubSpot required fields
      propertyMappings.forEach(mapping => {
        if (mapping.isHubspotField) {
          // If this HubSpot field is mapped to an existing field
          if (mapping.ourProperty && mapping.ourProperty !== `hs_${mapping.hubspotProperty}`) {
            // Use the value from the mapped field
            hubspotRecord[mapping.hubspotProperty] = record.answers[mapping.ourProperty] || mapping.defaultValue || '';
            // Mark the original field as used
            usedFields.add(mapping.ourProperty);
          } else {
            // Use default value if no mapping
            hubspotRecord[mapping.hubspotProperty] = mapping.defaultValue || '';
          }
        }
      });

      // Then, add remaining unmapped fields
      Object.entries(record.answers).forEach(([key, value]) => {
        if (!usedFields.has(key)) {
          // Find if this field is mapped to any HubSpot property
          const mapping = propertyMappings.find(m => m.ourProperty === key && !m.isHubspotField);
          if (mapping && mapping.hubspotProperty) {
            hubspotRecord[mapping.hubspotProperty] = value as string;
          }
        }
      });

      console.log(`Record ${index + 1}:`, {
        original: record.answers,
        transformed: hubspotRecord,
        usedFields: Array.from(usedFields)
      });

      return hubspotRecord;
    });

    console.log('Final HubSpot Records:', {
      type: type,
      records: transformedRecords
    });

    return transformedRecords;
  };

  useEffect(() => {
    // Check if user has connected their HubSpot account
    checkConnection();

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

  const checkConnection = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/export/hubspot/status`);
      if (!response.ok) {
        throw new Error('Failed to check connection status');
      }
      const data = await response.json();
      setStatus(prev => ({ ...prev, isConnected: data.connected }));
    } catch (error) {
      console.error('Error checking HubSpot connection:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: 'Failed to check HubSpot connection status' 
      }));
    }
  };

  const handleConnect = async () => {
    try {
      // Get the authorization URL from the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/export/hubspot/auth`);
      if (!response.ok) {
        throw new Error('Failed to get authorization URL');
      }
      const data = await response.json();
      
      // Open the authorization URL in a popup window
      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        data.auth_url,
        'Connect to HubSpot',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Add event listener for the popup window
      if (popup) {
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            // Check connection status after popup closes
            checkConnection();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error connecting to HubSpot:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: 'Failed to connect to HubSpot' 
      }));
    }
  };

  // Modify the handleExport function to handle different types appropriately
  const handleExport = async () => {
    if (!status.isConnected) {
      handleConnect();
      return;
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
      // Transform records based on the selected type
      const transformedRecords = validateAndTransformRecords(records, selectedType);
      
      console.log('Records to Send:', {
        type: selectedType,
        records: transformedRecords
      });

      // Send data in chunks to avoid overwhelming the API
      const CHUNK_SIZE = 10;
      const chunks = [];
      for (let i = 0; i < transformedRecords.length; i += CHUNK_SIZE) {
        chunks.push(transformedRecords.slice(i, i + CHUNK_SIZE));
      }

      let successCount = 0;
      let failureCount = 0;

      await Promise.all(chunks.map(async (chunk) => {
        const submissions = await Promise.allSettled(chunk.map(async (record) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/export/hubspot/${selectedType}/${projectId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                properties: record
              })
            });

            if (!response.ok) {
              throw new Error(`Failed to create ${selectedType}`);
            }

            successCount++;
            return response.json();
          } catch (error) {
            failureCount++;
            console.error(`Error creating ${selectedType}:`, error);
            throw error;
          }
        }));

        return submissions;
      }));

      setStatus(prev => ({
        ...prev,
        isLoading: false,
        success: true,
        lastExportDate: new Date().toISOString()
      }));

      // Show summary of results
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

  // Add this function after the propertyMappings state
  const getMappedFields = () => {
    const mappedFields = new Set<string>();
    propertyMappings.forEach(mapping => {
      if (mapping.isHubspotField && mapping.ourProperty !== `hs_${mapping.hubspotProperty}`) {
        mappedFields.add(mapping.ourProperty);
      }
    });
    return mappedFields;
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
            onClick={() => status.isConnected ? setShowOptions(true) : handleConnect()}
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
            {/* Only render CriticalProperties when we have a valid type */}
            {selectedType && (
              <CriticalProperties type={selectedType} />
            )}
            
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Map your fields to HubSpot properties:</h4>
              <span className="text-xs text-red-500">* Required HubSpot fields</span>
            </div>
            <div className="space-y-3">
              {propertyMappings.map((mapping, index) => {
                // Skip rendering if this field is mapped to a required HubSpot field
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
                              // Allow the currently selected field or fields that aren't mapped elsewhere
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