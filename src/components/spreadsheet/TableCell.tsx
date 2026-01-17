import { useCallback } from 'react';
import { Field, DocumentRecord } from './types';

type TableCellProps = {
    column: Field;
    rowIndex: number;
    isCellEditing: boolean;
    onEditCell: (rowIndex: number, columnId: string) => void;
    editedRow: DocumentRecord;
    onCellChange: (rowIndex: number, columnId: string, value: string) => void;
    onSaveRow: (rowIndex: number) => void;
    onCancelEdit: (rowIndex: number) => void;
};

export default function TableCell({
    column,
    rowIndex,
    isCellEditing,
    onEditCell,
    editedRow,
    onCellChange,
    onSaveRow,
    onCancelEdit,
}: TableCellProps) {
    // Callback ref to auto-resize textarea - now at top level of component
    const textareaRef = useCallback((node: HTMLTextAreaElement | null) => {
        if (node) {
            node.style.height = '0px';
            const scrollHeight = node.scrollHeight;
            node.style.height = `${scrollHeight}px`;
            node.focus();
        }
    }, []);

    return (
        <td
            key={column.hidden_id}
            className={`px-3 md:px-4 py-2 text-sm text-gray-900 border-r overflow-hidden leading-relaxed cursor-pointer transition-colors relative ${isCellEditing ? 'bg-blue-50/10 ring-2 ring-blue-400 ring-inset' : 'hover:bg-gray-100/30'}`}
            onClick={() => !isCellEditing && onEditCell(rowIndex, column.hidden_id)}
        >
            {isCellEditing ? (
                <textarea
                    ref={textareaRef}
                    value={editedRow.answers[column.hidden_id]?.text ?? ''}
                    onChange={(e) => onCellChange(rowIndex, column.hidden_id, e.target.value)}
                    onBlur={() => onSaveRow(rowIndex)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSaveRow(rowIndex);
                        } else if (e.key === 'Escape') {
                            onCancelEdit(rowIndex);
                        }
                    }}
                    className="w-full bg-white focus:outline-none resize-none overflow-hidden text-sm leading-relaxed p-0 m-0 block"
                    placeholder="..."
                />
            ) : (
                <div className="line-clamp-3 min-h-[1.5em]">
                    {editedRow.answers[column.hidden_id]?.text || (
                        <span className="text-gray-300 italic text-xs">Click to edit</span>
                    )}
                </div>
            )}
        </td>
    );
}
