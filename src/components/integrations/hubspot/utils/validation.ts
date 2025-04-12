import { HubSpotExportType, PropertyMapping } from '../types';

export const validateAndTransformRecords = (
  records: any[],
  type: HubSpotExportType,
  propertyMappings: PropertyMapping[]
) => {
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