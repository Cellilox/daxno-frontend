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
  orginal_file_name: string;
  file_key: string;
  project_id: string;
  answers: { [key: string]: AnswerData };
  created_at: string;
  updated_at: string;
  pages: number;
};

export type SpreadSheetProps = {
  columns: Field[];
  records: DocumentRecord[];
  projectId: string;
  project: any;
};