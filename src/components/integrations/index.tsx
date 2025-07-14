import DownLoadCSV from './DownlaodCSV';
import GoogleDriveExport from './google-drive/GoogleDriveExport';
import HubSpotExport from './hubspot/HubSpotExport';
import OverayPopup from '../ui/OverayPopup';
import { Field, Record } from '../spreadsheet/types';

export type IntegrationsProps = {
  projectId: string;
  fields: Field[];
  records: Record[];
  widthClassName?: string;
};

export function Integrations({ projectId, fields, records, widthClassName }: IntegrationsProps) {
  return (
    <OverayPopup widthClassName={widthClassName} buttonLabel = 'Integrations'>
      {/* Download Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Download your data</h3>
        <DownLoadCSV projectId={projectId} />
      </div>
      {/* Google Drive Section */}
      <div className="space-y-3">
        <GoogleDriveExport projectId={projectId} />
      </div>
      {/* HubSpot Section */}
      <div className="space-y-3">
        <HubSpotExport 
          projectId={projectId}
          fields={fields}
          records={records}
        />
      </div>
    </OverayPopup>
  );
}

export * from './types';
export default Integrations; 