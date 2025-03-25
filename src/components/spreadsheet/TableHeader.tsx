import { Pencil, Trash } from 'lucide-react';
import { Field, ApiRecord } from './types';

type TableHeaderProps = {
  columns: Field[];
  records: ApiRecord[] | undefined
  hoveredColumn: string | null;
  setHoveredColumn: (id: string | null) => void;
  onEditColumn: (column: Field) => void;
  onDeleteColumn: (column: Field) => void;
};

export default function TableHeader({
  columns,
  records,
  hoveredColumn,
  setHoveredColumn,
  onEditColumn,
  onDeleteColumn,
}: TableHeaderProps) {
    console.log('RRLE', records)
  return (
    <thead>
      <tr>
        <th className={`px-4 ${records && records.length >= 1? 'py-2' : 'py-0'} text-left text-sm font-semibold text-gray-600 sticky left-0 bg-white shadow-r md:hidden`}>
          {records && records.length >= 1 ? 'Actions' : ''}
        </th>
        <th className={`px-4 ${records && records.length >= 1? 'py-2' : 'py-0'} text-left text-sm font-semibold text-gray-600 min-w-[200px] relative`}>
          {records && records.length >= 1 ? 'Filename' : ''}
        </th>
        {columns.map((column) => (
          <th
            key={column.id}
            className="px-4 py-2 text-left text-sm font-semibold text-gray-600 relative min-w-[200px]"
            onMouseEnter={() => setHoveredColumn(column.id)}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <div className="flex items-center justify-between">
              <span>{column.name}</span>
              {hoveredColumn === column.id && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <button
                    onClick={() => onEditColumn(column)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Pencil className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => onDeleteColumn(column)}
                    className="p-1 hover:bg-gray-100 rounded"
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