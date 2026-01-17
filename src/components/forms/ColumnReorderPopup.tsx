
import React, { useState, useEffect, useRef } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { Field } from "../spreadsheet/types";
import StandardPopup from "../ui/StandardPopup";
import { reorderColumns } from "@/actions/column-actions";
interface Props {
  columns: Field[];
  isOpen: boolean;
  onClose: () => void;
  onReorder: (newColumns: Field[]) => void;
}

// Item type for drag and drop
const ItemTypes = {
  COLUMN: 'column'
};

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const ColumnItem = ({
  column,
  index,
  moveColumn
}: {
  column: Field;
  index: number;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.COLUMN,
    item: { type: ItemTypes.COLUMN, id: column.hidden_id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.COLUMN,
    hover: (item: DragItem, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset ? clientOffset.y - hoverBoundingRect.top : 0;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveColumn(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`p-3 mb-2 border rounded flex items-center justify-between ${isDragging ? "bg-blue-100 opacity-50" : "bg-white"
        }`}
      style={{ cursor: "move" }}
    >
      <span className="font-medium">{column.name}</span>
      <div className="w-6 h-6 flex items-center justify-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="6" r="1" />
          <circle cx="8" cy="12" r="1" />
          <circle cx="8" cy="18" r="1" />
          <circle cx="16" cy="6" r="1" />
          <circle cx="16" cy="12" r="1" />
          <circle cx="16" cy="18" r="1" />
        </svg>
      </div>
    </div>
  );
};

const ColumnReorderPopup: React.FC<Props> = ({ columns, isOpen, onClose, onReorder }) => {
  const [localColumns, setLocalColumns] = useState<Field[]>([]);

  useEffect(() => {
    setLocalColumns([...columns]);
  }, [columns]);

  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    const newColumns = [...localColumns];
    const draggedColumn = newColumns[dragIndex];

    // Remove the dragged item
    newColumns.splice(dragIndex, 1);
    // Insert it at the new position
    newColumns.splice(hoverIndex, 0, draggedColumn);

    setLocalColumns(newColumns);
  };

  const handleSave = async () => {
    onReorder(localColumns);

    // Process each moved column
    for (let i = 0; i < localColumns.length; i++) {
      const column = localColumns[i];
      const prevOrder = i > 0 ? localColumns[i - 1]?.order_number : null;
      const nextOrder = i < localColumns.length - 1 ? localColumns[i + 1]?.order_number : null;

      try {
        await reorderColumns(prevOrder, nextOrder, column.hidden_id);
        onClose();
      } catch (error) {
        console.error(`Error reordering column ${column.name}:`, error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <StandardPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Reorder Columns"
      subtitle="Drag and drop to rearrange your columns"
      icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>}
    >

      <DndProvider backend={HTML5Backend}>
        <div className="flex-1 overflow-y-auto mb-4 max-h-[60vh]">
          {localColumns.map((column, index) => (
            <ColumnItem
              key={column.hidden_id}
              column={column}
              index={index}
              moveColumn={moveColumn}
            />
          ))}
        </div>
      </DndProvider>

      <div className="mt-auto flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Order
        </button>
      </div>
    </StandardPopup>
  );
};

export default ColumnReorderPopup;