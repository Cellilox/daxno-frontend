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
  columnWidths,
  onColumnResize
}: TableHeaderProps & { columnWidths: { [key: string]: number }, onColumnResize: (id: string, width: number) => void }) {
  const hasRecords = records && records.length >= 1;
  const hasColumns = columns.length > 0;
  const [showCreateColumn, setShowCreateColumn] = useState(false);

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
    <thead className="bg-gray-50 border-b-2 border-gray-200">
      <tr>
        {hasRecords && (
          <>
            <th
              key="actions"
              className={`px-4 ${hasRecords ? 'py-3' : 'py-0'} text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 shadow-r md:hidden border-r border-gray-200 z-10 group`}
              style={{ width: `${columnWidths['__actions__'] || 100}px` }}
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
              className={`px-4 ${hasRecords ? 'py-3' : 'py-0'} text-left text-sm font-semibold text-gray-700 relative border-r border-gray-200 group`}
              style={{ width: `${columnWidths['__filename__'] || 250}px` }}
            >
              Filename
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
            className="px-4 py-3 text-left text-sm font-semibold text-gray-700 relative border-r border-gray-200 bg-gray-50 group"
            style={{ width: `${columnWidths[column.hidden_id]}px` }}
            onMouseEnter={() => setHoveredColumn(column.hidden_id)}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <div className="flex items-center justify-between h-full">
              <span className="font-semibold truncate">{column.name}</span>
              <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1 ${hoveredColumn === column.hidden_id ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
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
            </div>

            {/* Resize Handle */}
            <div
              className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-50 flex justify-center group/handle"
              onMouseDown={(e) => handleMouseDown(e, column.hidden_id)}
            >
              {/* Visual Line */}
              <div className="w-1 h-full hover:bg-blue-400 group-hover/handle:bg-blue-400 transition-colors" />
            </div>
          </th>
        ))}

        {/* Add Column Header Cell */}
        <th
          className="px-4 py-3 text-left text-sm font-semibold text-gray-700 relative border-r border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
          style={{ width: '200px' }}
        >
          {!showCreateColumn ? (
            <button
              onClick={() => setShowCreateColumn(true)}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 w-full h-full"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add Column</span>
            </button>
          ) : (
            <div className="min-w-[200px]">
              <CreateColumn
                projectId={projectId}
                onSuccess={() => setShowCreateColumn(false)}
                onCancel={() => setShowCreateColumn(false)}
                showToggle={false}
              />         </div>
          )}
        </th>
      </tr>
    </thead>
  );
}
