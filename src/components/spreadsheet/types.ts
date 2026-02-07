export type Field = {
  id: string;
  hidden_id: string;
  name: string;
  description?: string;
  order_number: number;
  type: string;
  project_id: string;
  width?: number;
};

export type Geometry = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type AnswerData = {
  text: string;
  geometry: Geometry;
  page: number;
};

export type DocumentRecord = {
  id: string;
  filename: string;
  original_filename: string;
  file_key: string;
  project_id: string;
  answers: { [key: string]: any };
  created_at: string;
  updated_at: string;
  pages: number;
  _isRowBackfilling?: boolean;
};

export type SpreadSheetProps = {
  columns: Field[];
  records: DocumentRecord[];
  projectId: string;
  project: any;
  user?: any;
  isOnline?: boolean;
  onDeleteRecord?: (id: string) => Promise<void>;
  onDeleteBatch?: (ids: string[]) => Promise<void>;
  onUpdateRecord?: (id: string, data: any) => void;
  onUpdateColumn?: (id: string, name: string) => void;
  onDeleteColumn?: (id: string) => void;
};