import { Pencil, Trash, PlusCircle, FileSpreadsheet } from 'lucide-react';
import { Field, ApiRecord } from './types';
import CreateColumn from '../forms/CreateColumn';
import { useState } from 'react';

type TableHeaderProps = {
  columns: Field[];
  records: ApiRecord[] | undefined;
  hoveredColumn: string | null;
  setHoveredColumn: (id: string | null) => void;
  onEditColumn: (column: Field) => void;
  onDeleteColumn: (column: Field) => void;
  projectId: string;
};

export default function TableHeader({
  columns,
  records,
  hoveredColumn,
  setHoveredColumn,
  onEditColumn,
  onDeleteColumn,
  projectId,
}: TableHeaderProps) {
  const hasRecords = records && records.length >= 1;
  const hasColumns = columns.length > 0;
  const [showCreateColumn, setShowCreateColumn] = useState(false);

  if (!hasRecords && !hasColumns) {
    return (
      <thead className="h-[50vh] bg-gray-50">
        <tr>
          <th className="px-4 py-8 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <FileSpreadsheet className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Welcome to your spreadsheet!</p>
                <p className="text-xs text-gray-400 mt-1">Add columns to get started</p>
              </div>
              {!showCreateColumn ? (
                <button 
                  onClick={() => setShowCreateColumn(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Column
                </button>
              ) : (
                <div className="w-full max-w-xs">
                  <CreateColumn 
                    projectId={projectId}
                    onSuccess={() => {
                      setShowCreateColumn(false);
                    }}
                    showToggle={false}
                  />
                </div>
              )}
            </div>
          </th>
        </tr>
      </thead>
    );
  }

  return (
      <thead className="bg-gray-50 border-b-2 border-gray-200">
        <tr>
          {hasRecords && (
            <>
              <th
                key="actions"
                className={`px-4 ${hasRecords ? 'py-3' : 'py-0'} text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 shadow-r md:hidden border-r border-gray-200 z-10`}
              >
                Actions
              </th>
              <th
                key="filename"
                className={`px-4 ${hasRecords ? 'py-3' : 'py-0'} text-left text-sm font-semibold text-gray-700 min-w-[200px] relative border-r border-gray-200`}
              >
                Filename
              </th>
            </>
          )}
          {columns.map((column) => (
            <th
              key={`column-${column.hidden_id}`}
              className="px-4 py-3 text-left text-sm font-semibold text-gray-700 relative min-w-[200px] border-r border-gray-200"
              onMouseEnter={() => setHoveredColumn(column.hidden_id)}
              onMouseLeave={() => setHoveredColumn(null)}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{column.name}</span>
                {hoveredColumn === column.hidden_id && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <button
                      onClick={() => onEditColumn(column)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => onDeleteColumn(column)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Trash className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
    );
} 