import React from 'react';
import { HubSpotExportType } from '../types';
import { CRITICAL_PROPERTIES, REQUIRED_PROPERTIES } from '../constants';

interface CriticalPropertiesProps {
  type: HubSpotExportType;
}

export const CriticalProperties: React.FC<CriticalPropertiesProps> = ({ type }) => {
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