import { Pencil, Trash, MessageCircle, Eye } from 'lucide-react';
import { Field, Record } from './types';

type TableRowProps = {
  row: Record;
  columns: Field[];
  rowIndex: number;
  hoveredRow: number | null;
  setHoveredRow: (index: number | null) => void;
  editingRow: number | null;
  editedRecords: { [rowIndex: number]: Record };
  onCellChange: (rowIndex: number, columnId: string, value: string) => void;
  onSaveRow: (rowIndex: number) => void;
  onCancelEdit: (rowIndex: number) => void;
  onEditRow: (rowIndex: number) => void;
  onDeleteRow: (row: Record) => void;
  onChatRow: (row: Record) => void;
};

export default function TableRow({
  row,
  columns,
  rowIndex,
  hoveredRow,
  setHoveredRow,
  editingRow,
  editedRecords,
  onCellChange,
  onSaveRow,
  onCancelEdit,
  onEditRow,
  onDeleteRow,
  onChatRow,
}: TableRowProps) {
  const isEditing = editingRow === rowIndex;
  const editedRow = editedRecords[rowIndex] || row;

  return (
    <tr
      key={row.id}
      className="border-b hover:bg-gray-50"
      onMouseEnter={() => setHoveredRow(rowIndex)}
      onMouseLeave={() => setHoveredRow(null)}
    >
      <td className="z-10 px-4 py-2 sticky left-0 bg-white shadow-r md:hidden border-r">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => onSaveRow(rowIndex)}
                className="p-1 hover:bg-gray-100 rounded text-green-600"
              >
                Save
              </button>
              <button
                onClick={() => onCancelEdit(rowIndex)}
                className="p-1 hover:bg-gray-100 rounded text-red-600"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEditRow(rowIndex)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Pencil className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => onDeleteRow(row)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Trash className="w-4 h-4 text-red-600" />
              </button>
              <button
                onClick={() => onChatRow(row)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MessageCircle className="w-4 h-4 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </td>
      <td className="px-4 py-2 text-sm text-gray-900 min-w-[200px] relative border-r">
        <div className="flex items-center gap-4">
          <span className="relative z-0">{row.orginal_file_name}</span>
          {/* <span className="relative z-0 text-blue-500 underline cursor-pointer">View</span> */}
          {/* Floating actions for larger screens */}
          {hoveredRow === rowIndex && (
            <div className="hidden md:flex items-center gap-2 absolute bg-white shadow-md rounded-md px-2 py-1 z-20">
              {isEditing ? (
                <>
                  <button
                    onClick={() => onSaveRow(rowIndex)}
                    className="p-1 hover:bg-gray-100 rounded text-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => onCancelEdit(rowIndex)}
                    className="p-1 hover:bg-gray-100 rounded text-red-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onEditRow(rowIndex)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Pencil className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => onDeleteRow(row)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash className="w-4 h-4 text-red-600" />
                  </button>
                  <button
                    onClick={() => onChatRow(row)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MessageCircle className="w-4 h-4 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </td>
      {columns.map((column) => (
        <td key={column.hidden_id} className="px-4 py-2 text-sm text-gray-900 min-w-[200px] border-r">
          {isEditing ? (
            <textarea
              value={editedRow.answers[column.id] ?? ''}
              onChange={(e) => onCellChange(rowIndex, column.id, e.target.value)}
              className="w-full p-1 border rounded min-h-[200px]"
            />
          ) : (
            <span>{editedRow.answers[column.id] ?? ''}</span>
          )}
        </td>
      ))}
    </tr>
  );
} 