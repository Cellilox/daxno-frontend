import { useRef } from 'react';
import TableCell from './TableCell';
import { Pencil, Trash, MessageCircle, Eye } from 'lucide-react';
import { Field, DocumentRecord } from './types';

type TableRowProps = {
  row: DocumentRecord;
  columns: Field[];
  rowIndex: number;
  hoveredRow: number | null;
  setHoveredRow: (index: number | null) => void;
  editingCell: { rowIndex: number, columnId: string } | null;
  editedRecords: { [rowIndex: number]: DocumentRecord };
  onCellChange: (rowIndex: number, columnId: string, value: string) => void;
  onSaveRow: (rowIndex: number) => void;
  onCancelEdit: (rowIndex: number) => void;
  onEditCell: (rowIndex: number, columnId: string) => void;
  onDeleteRow: (row: DocumentRecord) => void;
  handleReviewRecord: (row: DocumentRecord) => void;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
};

export default function TableRow({
  row,
  columns,
  rowIndex,
  hoveredRow,
  setHoveredRow,
  editingCell,
  editedRecords,
  onCellChange,
  onSaveRow,
  onCancelEdit,
  onEditCell,
  onDeleteRow,
  handleReviewRecord,
  columnWidths,
  isSelected = false,
  onSelect
}: TableRowProps & { columnWidths: { [key: string]: number } }) {
  const isRowEditing = editingCell?.rowIndex === rowIndex;
  const editedRow = editedRecords[rowIndex] || row;

  return (
    <tr
      key={row.id}
      className={`border-b transition-colors group ${isSelected ? 'bg-blue-50 hover:bg-blue-50' : 'hover:bg-gray-50 bg-white'}`}
      onMouseEnter={() => setHoveredRow(rowIndex)}
      onMouseLeave={() => setHoveredRow(null)}
    >
      {/* Checkbox Column - Sticky Left */}
      <td className={`px-3 py-2 border-r border-gray-100 sticky left-0 z-20 w-[40px] text-center ${isSelected ? 'bg-blue-50 group-hover:bg-blue-50' : 'bg-white group-hover:bg-gray-50'}`}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect && onSelect(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </td>

      <td className={`z-10 px-3 md:px-4 py-2 md:py-3 lg:py-4 sticky left-[40px] shadow-r md:hidden border-r ${isSelected ? 'bg-blue-50 group-hover:bg-blue-50' : 'bg-white group-hover:bg-gray-50'}`}>
        <div className="flex items-center justify-center gap-3">
          {!isRowEditing && (
            <>
              <button
                onClick={() => onEditCell(rowIndex, columns[0]?.hidden_id)}
                className="p-1.5 hover:bg-blue-50 rounded-full transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => handleReviewRecord(row)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                title="Review"
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => onDeleteRow(row)}
                className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                title="Delete"
              >
                <Trash className="w-4 h-4 text-red-600" />
              </button>
            </>
          )}
        </div>
      </td>
      <td className="px-3 md:px-4 py-2 text-sm text-gray-900 border-r overflow-hidden leading-relaxed relative group/filename">
        <div className="flex items-center h-full gap-2">
          <span className="relative z-0 truncate block font-medium text-gray-800">{row.original_filename}</span>
          {row.answers?.__status__ === 'processing' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full flex-shrink-0 animate-pulse">
              <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">Analyzing</span>
            </div>
          )}
          {row.answers?.__status__ === 'error' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 border border-red-100 rounded-full flex-shrink-0">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-tight">Failed</span>
            </div>
          )}

          {/* Floating actions for larger screens - moved to top-right */}
          {hoveredRow === rowIndex && !isRowEditing && (
            <div className="hidden md:flex items-center gap-1.5 absolute right-2 top-2 bg-white/90 backdrop-blur-sm shadow-sm rounded-lg px-2 py-1.5 z-20 border border-gray-100 group-hover/filename:opacity-100 opacity-0 transition-opacity">
              <button
                onClick={() => onEditCell(rowIndex, columns[0]?.hidden_id)}
                className="p-1 hover:bg-blue-50 rounded transition-colors group/edit"
                title="Edit Cell"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-600" />
              </button>
              <button
                onClick={() => handleReviewRecord(row)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Review Document"
              >
                <Eye className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <button
                onClick={() => onDeleteRow(row)}
                className="p-1 hover:bg-red-50 rounded transition-colors"
                title="Delete Row"
              >
                <Trash className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          )}
        </div>
      </td>
      {columns.map((column) => (
        <TableCell
          key={column.hidden_id}
          column={column}
          rowIndex={rowIndex}
          isCellEditing={editingCell?.rowIndex === rowIndex && editingCell?.columnId === column.hidden_id}
          onEditCell={onEditCell}
          editedRow={editedRow}
          onCellChange={onCellChange}
          onSaveRow={onSaveRow}
          onCancelEdit={onCancelEdit}
        />
      ))}
      {/* Empty spacer cell removed as per user request to prevent covering data cells */}
    </tr>
  );
} 