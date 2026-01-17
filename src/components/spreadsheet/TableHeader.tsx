import { Trash, PlusCircle, FileText, Check, X } from 'lucide-react';
import { Field, DocumentRecord } from './types';
import CreateColumn from '../forms/CreateColumn';
import { useState, useRef, useEffect } from 'react';

type TableHeaderProps = {
  columns: Field[];
  records: DocumentRecord[] | undefined;
  hoveredColumn: string | null;
  setHoveredColumn: (id: string | null) => void;
  onEditColumn: (column: Field) => void;
  onDeleteColumn: (column: Field) => void;
  projectId: string;
  columnWidths: { [key: string]: number };
  onColumnResize: (id: string, width: number) => void;
  onUpdateColumn: (column: Field, newName: string) => void;
};

export default function TableHeader({
  columns,
  records,
  hoveredColumn,
  setHoveredColumn,
  onEditColumn,
  onDeleteColumn,
  projectId,
  columnWidths,
  onColumnResize,
  onUpdateColumn
}: TableHeaderProps) {
  const hasRecords = records && records.length >= 1;
  const hasColumns = columns.length > 0;
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingColumnId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingColumnId]);

  const startEditing = (column: Field) => {
    setEditingColumnId(column.hidden_id);
    setEditValue(column.name);
  };

  const cancelEditing = () => {
    setEditingColumnId(null);
    setEditValue('');
  };

  const saveEditing = (column: Field) => {
    if (editValue.trim() && editValue !== column.name) {
      onUpdateColumn(column, editValue);
    }
    setEditingColumnId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, column: Field) => {
    if (e.key === 'Enter') {
      saveEditing(column);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Resize logic
  const handleMouseDown = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = columnWidths[columnId] || 200;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.pageX - startX;
      onColumnResize(columnId, startWidth + delta);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  return (
    <thead className="bg-gray-50 border-b-2 border-gray-300 sticky top-0 z-20">
      <tr>
        {hasRecords && (
          <>
            <th
              key="actions"
              className={`px-3 md:px-4 ${hasRecords ? 'py-2 md:py-3 lg:py-4' : 'py-0'} text-left text-sm font-semibold text-gray-700 tracking-wide sticky left-0 bg-gray-50 shadow-r md:hidden border-r border-gray-200 z-10 group`}
            >
              Actions
              {/* Resize Handle */}
              <div
                className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-50 flex justify-center group/handle"
                onMouseDown={(e) => handleMouseDown(e, '__actions__')}
              >
                <div className="w-1 h-full hover:bg-blue-400 group-hover/handle:bg-blue-400 transition-colors" />
              </div>
            </th>
            <th
              key="filename"
              className={`px-3 md:px-4 ${hasRecords ? 'py-2 md:py-3 lg:py-4' : 'py-0'} text-left text-sm font-semibold text-gray-700 tracking-wide relative border-r border-gray-200 group`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span>Filename</span>
              </div>
              {/* Resize Handle */}
              <div
                className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-50 flex justify-center group/handle"
                onMouseDown={(e) => handleMouseDown(e, '__filename__')}
              >
                <div className="w-1 h-full hover:bg-blue-400 group-hover/handle:bg-blue-400 transition-colors" />
              </div>
            </th>
          </>
        )}
        {columns.map((column) => (
          <th
            key={`column-${column.hidden_id}`}
            className="px-3 md:px-4 py-2 md:py-3 lg:py-4 text-left text-sm font-semibold text-gray-700 tracking-wide relative border-r border-gray-200 bg-gray-50 group hover:bg-gray-100 transition-colors cursor-pointer"
            onMouseEnter={() => setHoveredColumn(column.hidden_id)}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <div className="flex items-center justify-between h-full">
              {editingColumnId === column.hidden_id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveEditing(column)}
                  onKeyDown={(e) => handleKeyDown(e, column)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span
                  className="font-semibold truncate w-full"
                  onClick={() => startEditing(column)}
                  title="Click to rename"
                >
                  {column.name}
                </span>
              )}

              <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1 ${editingColumnId !== column.hidden_id ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteColumn(column);
                  }}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <Trash className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            {/* Resize Handle */}
            <div
              className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-50 flex justify-center group/handle"
              onMouseDown={(e) => handleMouseDown(e, column.hidden_id)}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Visual Line */}
              <div className="w-1 h-full hover:bg-blue-400 group-hover/handle:bg-blue-400 transition-colors" />
            </div>
          </th>
        ))}

        {/* Add Column Header Cell */}
        <th
          className="px-3 md:px-4 py-2 text-left text-sm font-semibold text-gray-700 tracking-wide sticky right-0 border-l border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors z-30 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]"
          style={{ width: '200px', minWidth: '200px' }}
        >
          {!showCreateColumn ? (
            <button
              onClick={() => setShowCreateColumn(true)}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 w-full h-full justify-center"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="whitespace-nowrap">Add Column</span>
            </button>
          ) : (
            <div className="w-full">
              <CreateColumn
                projectId={projectId}
                onSuccess={() => setShowCreateColumn(false)}
                onCancel={() => setShowCreateColumn(false)}
                showToggle={false}
              />
            </div>
          )}
        </th>
      </tr>
    </thead>
  );
}
