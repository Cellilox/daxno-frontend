export type Field = {
  id: string;
  hidden_id: string;
  name: string;
  description?: string;
  order_number: number;
  type: string;
  project_id: string;
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
};

export type ApiRecord = {
  id: string;
  answers: { [key: string]: AnswerData }; // Changed to object map
  updated_at: string;
  created_at: string;
  filename: string;
  orginal_file_name: string;
  file_key: string;
  project_id: string;
};

export type Record = {
  id: string;
  filename: string;
  orginal_file_name: string;
  file_key: string;
  project_id: string;
  answers: { [key: string]: AnswerData }; // Matches ApiRecord structure
  created_at: string;
  updated_at: string;
};

export type SpreadSheetProps = {
  columns: Field[] | undefined;
  records: ApiRecord[] | undefined;
  projectId: string;
};