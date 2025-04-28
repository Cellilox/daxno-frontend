import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import type {Field} from "../spreadsheet/types"
interface Props {
  columns: Field[];
  isOpen: boolean;
  onClose: () => void;
  onReorder: (newColumns: Field[]) => void;
}

const ColumnReorderPopup: React.FC<Props> = ({ columns, isOpen, onClose, onReorder }) => {
  const [localColumns, setLocalColumns] = useState(columns);

  React.useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(localColumns);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setLocalColumns(reordered);
    onReorder(reordered);

    // Prepare payload
    const movedField = reordered[result.destination.index];
    const prevOrder = reordered[result.destination.index - 1]?.order_number ?? null;
    const nextOrder = reordered[result.destination.index + 1]?.order_number ?? null;

    // Send request
    await axios.post(
      `http://localhost:8001/fields/fields/${movedField.hidden_id}/reorder`,
      {
        previous_order: prevOrder,
        next_order: nextOrder,
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-lg z-50 flex flex-col p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Reorder Columns</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="columns">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {localColumns.map((col, idx) => (
                <Draggable key={col.hidden_id} draggableId={col.hidden_id} index={idx}>
                  {(provided) => (
                    <div
                      className="mb-3 p-4 bg-blue-50 rounded flex items-center justify-between"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <span className="font-medium">{col.name}</span>
                      <span className="text-gray-400 cursor-move">⠿</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ColumnReorderPopup;