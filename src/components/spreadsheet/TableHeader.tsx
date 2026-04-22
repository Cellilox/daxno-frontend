import { Trash, PlusCircle, FileText, Check, X, Sparkles } from 'lucide-react';
import { Field, DocumentRecord } from './types';
import CreateColumn from '../forms/CreateColumn';
import ColumnEditor from '../forms/ColumnEditor';
import { useState } from 'react';

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
  onUpdateColumn: (column: Field, update: { name: string; description: string }) => void;
  onBackfillColumn: (column: Field) => void;
  selectedCount?: number;
  totalCount?: number;
  onSelectAll?: (checked: boolean) => void;
  backfillingFieldId?: string | null;
  isOnline?: boolean;
  isCreatingColumn: boolean;
  setIsCreatingColumn: (val: boolean) => void;
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
  onUpdateColumn,
  onBackfillColumn,
  selectedCount = 0,
  totalCount = 0,
  onSelectAll,
  backfillingFieldId,
  isOnline = true,
  isCreatingColumn,
  setIsCreatingColumn
}: TableHeaderProps) {
  const hasRecords = records && records.length >= 1;
  const hasColumns = columns.length > 0;
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);

  const startEditing = (column: Field) => {
    if (!isOnline) return; // Disable editing offline
    setEditingColumnId(column.hidden_id);
  };

  const cancelEditing = () => {
    setEditingColumnId(null);
  };

  const saveEditing = (column: Field, values: { name: string; description: string }) => {
    const name = values.name.trim();
    const description = values.description.trim();
    const nameChanged = !!name && name !== column.name;
    const descriptionChanged = description !== (column.description ?? '');
    if (name && (nameChanged || descriptionChanged)) {
      onUpdateColumn(column, { name, description });
    }
    setEditingColumnId(null);
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
            {/* Checkbox Column */}
            <th className="px-3 py-2 border-r border-gray-200 sticky left-0 z-30 bg-gray-50 text-center w-[40px]">
              <input
                type="checkbox"
                checked={totalCount > 0 && selectedCount === totalCount}
                ref={el => { if (el) el.indeterminate = selectedCount > 0 && selectedCount < totalCount }}
                onChange={e => onSelectAll && onSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </th>

            <th
              key="actions"
              className={`px-3 md:px-4 ${hasRecords ? 'py-2 md:py-3 lg:py-4' : 'py-0'} text-left text-sm font-semibold text-gray-700 tracking-wide sticky left-[40px] bg-gray-50 shadow-r md:hidden border-r border-gray-200 z-10 group`}
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
        {columns.map((column, colIndex) => (
          <th
            key={`column-${column.hidden_id}`}
            data-testid={`column-header-${column.name}`}
            className={`px-3 md:px-4 py-2 md:py-3 lg:py-4 text-left text-sm font-semibold tracking-wide relative border-r border-gray-200 transition-all cursor-pointer group
              ${backfillingFieldId === column.hidden_id
                ? 'bg-purple-100 text-purple-900 border-b-2 border-b-purple-600'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            onMouseEnter={() => setHoveredColumn(column.hidden_id)}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <div className="flex items-center justify-between h-full gap-2 px-1">
              {editingColumnId === column.hidden_id ? (
                <ColumnEditor
                  initialName={column.name}
                  initialDescription={column.description ?? ''}
                  onSave={(values) => saveEditing(column, values)}
                  onCancel={cancelEditing}
                  nameTestId="column-edit-input"
                  descriptionTestId="column-edit-description"
                />
              ) : (
                <span
                  className={`font-semibold truncate flex-1 min-w-0 ${isOnline ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={() => isOnline && startEditing(column)}
                  title={isOnline ? (column.description ? `${column.name} — ${column.description}` : 'Click to rename') : column.name}
                  data-testid="column-name-text"
                >
                  {column.name}
                </span>
              )}

              {editingColumnId !== column.hidden_id && isOnline && (
                <div className="flex items-center gap-1 flex-shrink-0 opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBackfillColumn(column);
                    }}
                    className="p-1 hover:bg-purple-50 rounded transition-colors group/backfill"
                    title="Smart Backfill - Re-analyze all records for this column"
                  >
                    <Sparkles className="w-4 h-4 text-purple-600 group-hover/backfill:text-purple-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteColumn(column);
                    }}
                    data-testid={`delete-column-${column.name}`}
                    className="p-1 hover:bg-gray-200 rounded transition-colors column-delete-trigger"
                    title="Delete Column"
                  >
                    <Trash className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )}
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

        <th
          className={`px-2 md:px-4 py-2 text-left text-sm font-semibold text-gray-700 tracking-wide sticky right-0 border-l border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors z-30 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] 
            ${isCreatingColumn ? 'w-[200px] min-w-[200px]' : 'w-[60px] md:w-[200px] min-w-[60px] md:min-w-[200px]'}`}
        >
          {isOnline && !isCreatingColumn ? (
            <button
              onClick={() => setIsCreatingColumn(true)}
              data-testid="add-column-button"
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 w-full h-full justify-center"
            >
              <PlusCircle className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">Add Column</span>
            </button>
          ) : isOnline && isCreatingColumn ? (
            <div className="w-full">
              <CreateColumn
                projectId={projectId}
                onSuccess={() => setIsCreatingColumn(false)}
                onCancel={() => setIsCreatingColumn(false)}
                showToggle={false}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <span className="text-xs uppercase font-bold tracking-tighter">Read Only</span>
            </div>
          )}
        </th>
      </tr>
    </thead>
  );
}
