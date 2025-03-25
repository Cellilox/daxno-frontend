export type Field = {
  id: string;
  name: string;
  description: string | null;
  hidden_id: string;
};

export type ApiRecord = {
  id: string;
  filename?: string;
  project_id: string;
  fields_data: {
    [key: string]: {
      answer: string;
      confidence: string;
      page: string;
      source: string;
    };
  };
};

export type Record = {
  hiddenId: string;
  filename: string;
  [columnId: string]: string | { 
    value: string;
    confidence: string;
  };
};

export type SpreadSheetProps = {
  columns: Field[] | undefined;
  records: ApiRecord[] | undefined;
  projectId: string;
}; 