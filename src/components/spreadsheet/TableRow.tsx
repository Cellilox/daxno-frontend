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
  handleReviewRecord: (row: Record) => void;
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
  handleReviewRecord,
  columnWidths
}: TableRowProps & { columnWidths: { [key: string]: number } }) {
  const isEditing = editingRow === rowIndex;
  const editedRow = editedRecords[rowIndex] || row;

  return (
    <tr
      key={row.id}
      className="border-b hover:bg-gray-50 bg-white transition-colors"
      onMouseEnter={() => setHoveredRow(rowIndex)}
      onMouseLeave={() => setHoveredRow(null)}
    >
      <td className="z-10 px-3 md:px-4 py-2 md:py-3 lg:py-4 sticky left-0 bg-white shadow-r md:hidden border-r" style={{ width: `${columnWidths['__actions__'] || 100}px` }}>
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
                onClick={() => handleReviewRecord(row)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                Review
              </button>
            </>
          )}
        </div>
      </td>
      <td className="px-3 md:px-4 py-2 md:py-3 lg:py-4 text-xs sm:text-sm md:text-base text-gray-900 relative border-r overflow-hidden leading-relaxed" style={{ width: `${columnWidths['__filename__'] || 250}px` }}>
        <div className="flex items-center gap-4">
          <span className="relative z-0 truncate block w-full">{row.orginal_file_name}</span>
          {/* <span className="relative z-0 text-blue-500 underline cursor-pointer">View</span> */}
          {/* Floating actions for larger screens */}
          {hoveredRow === rowIndex && (
            <div className="hidden md:flex items-center gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-md px-2 py-1 z-20 border border-gray-100">
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
                  {/* <button
                    onClick={() => onChatRow(row)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MessageCircle className="w-4 h-4 text-gray-600" />
                  </button> */}

                  <button
                    onClick={() => handleReviewRecord(row)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {/* <Eye className="w-4 h-4 text-gray-600" /> */}
                    Review
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </td>
      {columns.map((column) => (
        <td
          key={column.hidden_id}
          className="px-3 md:px-4 py-2 md:py-3 lg:py-4 text-xs sm:text-sm md:text-base text-gray-900 border-r overflow-hidden leading-relaxed"
          style={{ width: `${columnWidths[column.hidden_id]}px` }}
        >
          {isEditing ? (
            <textarea
              value={editedRow.answers[column.hidden_id]?.text ?? ''}
              onChange={(e) => onCellChange(rowIndex, column.hidden_id, e.target.value)}
              className="w-full p-1 border rounded min-h-[200px]"
            />
          ) : (
            <div className="line-clamp-3">
              {editedRow.answers[column.hidden_id]?.text ?? ''}
            </div>
          )}
        </td>
      ))}
      {/* Empty spacer cell to match "Add Column" header */}
      <td className="border-r border-gray-100 bg-gray-50/30"></td>
    </tr>
  );
} 