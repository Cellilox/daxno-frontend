"use client"

import { useEffect, useState } from 'react';
import { Pencil, Trash, MessageCircle } from 'lucide-react';
import AlertDialog from './ui/AlertDialog';
import FormModal from './ui/Popup';
import { deleteColumn, updateColumn } from '@/actions/column-actions';
import { deleteRecord, updateRecord } from '@/actions/record-actions';
import RecordChat from './RecordChat';

type Field = {
  id: string;
  name: string;
  description: string | null;
  hidden_id: string;
};

type ApiRecord = {
  id: string;
  filename?: string;
  project_id: string;
  fields_data: {
    [key: string]: {
      answer: string;
      confidence: string;
      page: string;
      source: string;
    };
  };
};

type Record = {
  hiddenId: string;
  filename: string;
  [columnId: string]: string | { 
    value: string;
    confidence: string;
  };
};

type SpreadSheetProps = {
  columns: Field[] | undefined;
  records: ApiRecord[] | undefined;
  projectId: string
};

export default function SpreadSheet({ columns, records, projectId }: SpreadSheetProps) {
  const [localColumns, setLocalColumns] = useState<Field[] | undefined>([]);
  const [localRows, setLocalRows] = useState<Record[] | undefined>([]);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedColumnToUpdate, setSelectedColumnToUpdate] = useState<Field | null>(null);
  

  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [selectedColumnToDelte, setSelectedColumnTolete] = useState<Field | null>(null);
  const [selectedRecordToDelete, setSelectedRecordToDelete] = useState<Record | null>(null);

  // For row editing
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedRecords, setEditedRecords] = useState<{ [rowIndex: number]: Record }>({});

  // Add this state for chat
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [selectedRecordForChat, setSelectedRecordForChat] = useState<Record | null>(null);

  useEffect(() => {
    if (columns) {
      setLocalColumns(columns);
    }
    
    if (records) {
      const transformedRecords = records.map(record => {
        const transformedRecord: Record = {
          hiddenId: record.id,
          filename: record.filename || '',
        };
        
        Object.entries(record.fields_data).forEach(([fieldId, fieldData]) => {
          transformedRecord[fieldId] = {
            value: fieldData.answer,
            confidence: fieldData.confidence
          };
        });
        
        return transformedRecord;
      });
      
      setLocalRows(transformedRecords);
    }
  }, [columns, records]);

  // --- Column Popup Functions ---
  const handleShowColumnUpdatePopup = (column: Field) => {
    setSelectedColumnToUpdate(column);
    setIsPopupVisible(true);
  };

  const handleCloseColumnUpdatePopup = () => {
    setIsPopupVisible(false);
    setSelectedColumnToUpdate(null);
  };


  const handleUpdateColumnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const updateData = {
      id: selectedColumnToUpdate?.id,
      name: selectedColumnToUpdate?.name,
      description: selectedColumnToUpdate?.description,
      related_project: projectId
    }

    try {
      await updateColumn(selectedColumnToUpdate?.hidden_id, updateData)
      setIsPopupVisible(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  }


  const handleShowDeleteColumnAlert = (column: Field) => {
    setIsAlertVisible(true);
    setSelectedColumnTolete(column)
  };

  const handleCloseDeleteColumnAlert = () => {
    setIsAlertVisible(false);
    setSelectedColumnTolete(null)

  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
       await deleteColumn(columnId)
       setIsAlertVisible(false)
    } catch (error) {
      alert('Error deleting column')
    }
  }

  const handleShowDeleteRecordAlert = (record: Record) => {
    setIsAlertVisible(true);
    setSelectedRecordToDelete(record)
  };

  const handleCloseDeleteRecordAlert = () => {
    setIsAlertVisible(false);
    setSelectedRecordToDelete(null)

  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await deleteRecord(recordId);
      setIsAlertVisible(false);
      
      setLocalRows((prev) => 
        prev?.filter(row => row.hiddenId !== recordId)
      );
    } catch (error) {
      alert('Error deleting a record');
    }
  }


  // --- Row Editing Functions ---
  // Trigger edit mode for a row by clicking the pencil icon
  const handleEditRow = (rowIndex: number) => {
    setEditingRow(rowIndex);
    setEditedRecords((prev) => ({
      ...prev,
      [rowIndex]: localRows?.[rowIndex] ? { ...localRows[rowIndex] } : {} as Record
    }));
  };

  // Update a cell's value while editing
  const handleCellChange = (rowIndex: number, columnId: string, value: string) => {
    setEditedRecords((prev) => ({
      ...prev,
      [rowIndex]: { ...prev[rowIndex], [columnId]: value }
    }));
  };

  // Save the row's changes (triggered by clicking "save")
  const handleSaveRow = async (rowIndex: number) => {
    const updatedRow = { ...localRows?.[rowIndex], ...editedRecords[rowIndex] };
    console.log("Updated Row before API:", updatedRow);

    // Find the original record to maintain its structure
    const originalRecord = records?.find(record => record.id === updatedRow.hiddenId);
    
    if (!originalRecord) {
      console.error("Original record not found");
      return;
    }

    // Create the fields_data structure while preserving existing data
    const fields_data: { [key: string]: any } = {};
    
    // Preserve the original fields_data structure and update only the answers
    Object.entries(originalRecord.fields_data).forEach(([fieldId, fieldData]) => {
      fields_data[fieldId] = {
        ...fieldData, // Preserve all original field data (including hiddenId)
        answer: updatedRow[fieldId] || fieldData.answer // Update only the answer if changed
      };
    });

    // Create the complete record structure for the API
    const apiRecord = {
      id: updatedRow.hiddenId,
      fields_data: fields_data,
      project_id: projectId,
      filename: originalRecord.filename
    };

    try {
      await updateRecord(updatedRow.hiddenId, apiRecord);
      console.log("API Record being sent:", apiRecord);

      // Update the local state with the new values
      setLocalRows((prev) => {
        if (!prev) return prev;
        
        return prev.map(row => {
          if (row.hiddenId === updatedRow.hiddenId) {
            // Create a new transformed record that matches our display format
            const transformedRecord: Record = {
              hiddenId: updatedRow.hiddenId,
              filename: updatedRow.filename,
            };

            // Map the answers from fields_data to our flat structure
            Object.entries(fields_data).forEach(([fieldId, fieldData]) => {
              transformedRecord[fieldId] = fieldData.answer;
            });
            
            console.log("Transformed Record for display:", transformedRecord);
            return transformedRecord;
          }
          return row;
        });
      });

      setEditingRow(null);
      setEditedRecords((prev) => {
        const newEdited = { ...prev };
        delete newEdited[rowIndex];
        return newEdited;
      });
    } catch (error) {
      console.error("Error updating record:", error);
      alert('Error updating a record');
    }
  };

  const handleCancelRow = (rowIndex: number) => {
    setEditingRow(null);
    setEditedRecords((prev) => {
      const newEdited = { ...prev };
      delete newEdited[rowIndex];
      return newEdited;
    });
  };

  // Add this function to handle chat opening
  const handleOpenChat = (record: Record) => {
    setSelectedRecordForChat(record);
    setIsChatVisible(true);
  };

  return (
    <div className="overflow-auto h-[70vh] w-full border border-gray-200 rounded-lg">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            {columns?.map((column) => (
              <th
                key={column.id}
                className="border border-gray-200 p-2 sticky top-0 bg-gray-50 relative min-w-[200px]"
                onMouseEnter={() => setHoveredColumn(column.id)}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                <div className="flex items-center gap-2 relative">
                  <span className="flex-1 text-left">{column.name}</span>
                  <div
                    className={`absolute right-0 ${
                      // On small screens, always show at top; on larger, show on hover.
                      'top-0 sm:top-1/2 sm:-translate-y-1/2'
                      }  px-1 flex gap-1 transition-opacity duration-200 ${hoveredColumn === column.id ? 'opacity-100' : 'opacity-100 sm:opacity-0'
                      }`}
                  >
                    <button
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      title="Edit column"
                      onClick={() => handleShowColumnUpdatePopup(column)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="ml-3 text-red-500 hover:text-red-700 text-sm"
                      title="Delete column"
                      onClick={() => handleShowDeleteColumnAlert(column)}
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {localRows?.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`relative ${editingRow === rowIndex ? 'border-2 border-blue-500' : ''}`}
              onMouseEnter={() => setHoveredRow(rowIndex)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {localColumns?.map((column, colIndex) => (
                <td
                  key={column.id}
                  className={`border p-4 sm:p-2 bg-white relative min-w-[200px] ${editingRow === rowIndex ? 'border-blue-500' : 'border-gray-200'
                    }`}
                >
                  {colIndex === 0 ? (
                    // On small screens, push the content down to avoid icon overlap; on larger, no extra margin.
                    <div className="mt-6 sm:mt-0">
                      {editingRow === rowIndex ? (
                        <input
                          type="text"
                          className="w-full outline-none"
                          value={
                            typeof editedRecords[rowIndex]?.[column.id] === 'object'
                              ? (editedRecords[rowIndex]?.[column.id] as any)?.value
                              : editedRecords[rowIndex]?.[column.id] ??
                                (typeof row[column.id] === 'object'
                                  ? (row[column.id] as any).value
                                  : row[column.id]) ??
                                ''
                          }
                          onChange={(e) =>
                            handleCellChange(rowIndex, column.id, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveRow(rowIndex);
                            }
                          }}
                        />
                      ) : (
                        <div className="group relative">
                          <span className="flex-1">
                            {typeof row[column.id] === 'object'
                              ? (row[column.id] as any).value
                              : row[column.id]}
                          </span>
                          {/* Confidence Score Overlay */}
                          {typeof row[column.id] === 'object' && (
                            <div className="
                              absolute 
                              invisible 
                              group-hover:visible 
                              bg-gray-800/90
                              text-white 
                              text-xs
                              px-2 
                              py-1 
                              rounded-md
                              right-0
                              top-0
                              transform
                              translate-x-1
                              -translate-y-1
                              shadow-lg
                              z-10
                              min-w-[80px]
                              text-center
                              backdrop-blur-sm
                              border border-gray-700
                            ">
                              <div className="flex items-center gap-1">
                                <span>Confidence:</span>
                                <span className="font-semibold">
                                  {(row[column.id] as any).confidence}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    editingRow === rowIndex ? (
                      <input
                        type="text"
                        className="w-full outline-none"
                        value={
                          typeof editedRecords[rowIndex]?.[column.id] === 'object'
                            ? (editedRecords[rowIndex]?.[column.id] as any)?.value
                            : editedRecords[rowIndex]?.[column.id] ??
                              (typeof row[column.id] === 'object'
                                ? (row[column.id] as any).value
                                : row[column.id]) ??
                              ''
                        }
                        onChange={(e) =>
                          handleCellChange(rowIndex, column.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveRow(rowIndex);
                          }
                        }}
                      />
                    ) : (
                      <div className="group relative">
                        <span className="flex-1">
                          {typeof row[column.id] === 'object'
                            ? (row[column.id] as any).value
                            : row[column.id]}
                        </span>
                        {/* Confidence Score Overlay */}
                        {typeof row[column.id] === 'object' && (
                          <div className="
                            absolute 
                            invisible 
                            group-hover:visible 
                            bg-gray-800/90
                            text-white 
                            text-xs
                            px-2 
                            py-1 
                            rounded-md
                            right-0
                            top-0
                            transform
                            translate-x-1
                            -translate-y-1
                            shadow-lg
                            z-10
                            min-w-[80px]
                            text-center
                            backdrop-blur-sm
                            border border-gray-700
                          ">
                            <div className="flex items-center gap-1">
                              <span>Confidence:</span>
                              <span className="font-semibold">
                                {(row[column.id] as any).confidence}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                  {/* Floating icons only in the first column */}
                  {colIndex === 0 && (
                    <div
                      className={`absolute left-2 ${
                        // On small screens, position icons at top inside; on larger screens, center vertically on hover.
                        'top-0 sm:top-1/2 sm:-translate-y-1/2'
                        } flex gap-1 transition-opacity duration-200 bg-blue-100 p-2 ${hoveredRow === rowIndex ? 'opacity-100' : 'opacity-100 sm:opacity-0'
                        }`}
                    >
                      {editingRow === rowIndex ? (
                        <>
                          <button
                            className="text-blue-500 hover:text-blue-700 text-sm"
                            title="Save row"
                            onClick={() => handleSaveRow(rowIndex)}
                          >
                            save
                          </button>
                          <button
                            className="ml-3 text-red-500 hover:text-red-700 text-sm"
                            title="Cancel editing"
                            onClick={() => handleCancelRow(rowIndex)}
                          >
                            <Trash size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="text-blue-500 hover:text-blue-700 text-sm"
                            title="Edit row"
                            onClick={() => handleEditRow(rowIndex)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="ml-3 text-blue-500 hover:text-blue-700 text-sm"
                            title="Chat about record"
                            onClick={() => handleOpenChat(row)}
                          >
                            <MessageCircle size={14} />
                          </button>
                          <button
                            className="ml-3 text-red-500 hover:text-red-700 text-sm"
                            title="Delete row"
                            onClick={() => handleShowDeleteRecordAlert(row)}
                          >
                            <Trash size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- Column Edit Popup --- */}
      {isPopupVisible && selectedColumnToUpdate && (
        <FormModal
          visible={isPopupVisible}
          title="Edit Column"
          onSubmit={handleUpdateColumnSubmit}
          onCancel={handleCloseColumnUpdatePopup}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Column Name
            </label>
            <input
              type="text"
              value={selectedColumnToUpdate.name}
              onChange={(e) =>
                setSelectedColumnToUpdate({
                  ...selectedColumnToUpdate,
                  name: e.target.value,
                })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <label className="block text-xs font-medium text-gray-700">
              (Tell the AI how you would discribe this sentiment for proper detection and accuracy)
            </label>
            <textarea
              value={selectedColumnToUpdate.description || ''}
              onChange={(e) =>
                setSelectedColumnToUpdate({
                  ...selectedColumnToUpdate,
                  description: e.target.value,
                })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseColumnUpdatePopup}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Save
            </button>
          </div>
        </FormModal>
      )}
      {/* --- Column Delete Alert --- */}
      {isAlertVisible && selectedColumnToDelte && (
        <AlertDialog
          visible={isAlertVisible}
          title="Delete Column"
          message="This column will be deleted permanently, and there is no going back."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => handleDeleteColumn(selectedColumnToDelte.hidden_id)}
          onCancel={handleCloseDeleteColumnAlert}
        />
      )}

      {/* --- Record Delete Alert --- */}
      {isAlertVisible && selectedRecordToDelete && (
        <AlertDialog
          visible={isAlertVisible}
          title="Delete Record"
          message="This record will be deleted permanently, and there is no going back."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => handleDeleteRecord(selectedRecordToDelete.hiddenId)}
          onCancel={handleCloseDeleteRecordAlert}
        />
      )}

      {/* --- Record Chat Modal --- */}
      {isChatVisible && selectedRecordForChat && (
        <FormModal
          visible={isChatVisible}
          title={`Chat about ${selectedRecordForChat.filename}`}
          onCancel={() => {
            setIsChatVisible(false);
            setSelectedRecordForChat(null);
          }}
          position="right"
        >
          <RecordChat
            projectId={projectId}
            filename={selectedRecordForChat.filename}
          />
        </FormModal>
      )}
    </div>
  );
}
