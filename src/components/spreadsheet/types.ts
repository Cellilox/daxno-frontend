export type Field = {
  id: string;
  hidden_id: string;
  name: string;
  description?: string;
  type: string;
  project_id: string;
};

export type ApiRecord = {
  id: string;
  answers: {
    [key: string]: string;
  };
  updated_at: string;
  created_at: string;
  filename: string;
  project_id: string;
};

export type Record = {
  id: string;
  filename: string;
  project_id: string;
  answers: {
    [key: string]: string;
  };
  created_at: string;
  updated_at: string;
};

export type SpreadSheetProps = {
  columns: Field[] | undefined;
  records: ApiRecord[] | undefined;
  projectId: string;
}; 