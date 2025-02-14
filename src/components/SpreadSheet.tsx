"use client"

import { useEffect, useRef, useState } from 'react';
import { Eye, Pencil, Trash } from 'lucide-react';
import AlertDialog from './ui/AlertDialog';
import FormModal from './ui/UpdatePopup';

type Field = {
  id: string;
  name: string;
  description: string | null;
  hidden_id: string;
};

type Record = {
  [key: string]: any;
};

type SpreadSheetProps = {
  columns: Field[] | undefined;
  records: Record[] | undefined;
  refresh: () => void
  token: string | null
  sessionId: string | undefined
  projectId: string
};

export default function SpreadSheet({ columns, records, token, sessionId, projectId, refresh }: SpreadSheetProps) {
  console.log('COOOO', columns);
  console.log('ROOO', records);
  const [localColumns, setLocalColumns] = useState<Field[] | undefined>([]);
  const [localRows, setLocalRows] = useState<Record[] | undefined>([]);
  console.log('LOC_ROOO', localRows);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedColumnToUpdate, setSelectedColumnToUpdate] = useState<Field | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [selectedColumnToDelte, setSelectedColumnTolete] = useState<Field | null>(null);
  const [selectedRecordToDelete, setSelectedRecordToDelete] = useState<Record | null>(null);

  // For row editing
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedRecords, setEditedRecords] = useState<{ [rowIndex: number]: Record }>({});

  useEffect(() => {
    setLocalColumns(columns);
    let fieldsData: any = []
    records?.forEach(rec => {
      fieldsData.push({ hiddenId: rec.id, ...rec.fields_data })
    })
    setLocalRows(fieldsData);

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
    console.log('FieldToUPdate', selectedColumnToUpdate)
    const url = `${process.env.NEXT_PUBLIC_API_URL}/fields/${selectedColumnToUpdate?.hidden_id}`
    console.log('URL', url)
    const requestHeaders = new Headers();
    requestHeaders.append('Authorization', `Bearer ${token}`);
    requestHeaders.append('Content-Type', 'application/json')
    if (sessionId) {
      requestHeaders.append('sessionId', sessionId);
    }

    const updateData = {
      id: selectedColumnToUpdate?.id,
      name: selectedColumnToUpdate?.name,
      description: selectedColumnToUpdate?.description,
      related_project: projectId
    }

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: requestHeaders,
        body: JSON.stringify(updateData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Update failed:', errorData);
        throw new Error(`Update failed: ${JSON.stringify(errorData)}`);
      }

      const result = await res.json();
      console.log('Update successful:', result);
      setIsPopupVisible(false);
      refresh();
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
    const requestHeaders = new Headers();
    requestHeaders.append('Authorization', `Bearer ${token}`);
    if (sessionId) {
      requestHeaders.append('sessionId', sessionId);
    }
    const url = `${process.env.NEXT_PUBLIC_API_URL}/fields/${columnId}`
    const res = await fetch(url, {
      method: 'DELETE',
      headers: requestHeaders
    })

    const result = await res.json()
    setIsAlertVisible(false)
    refresh()
  }

  const handleShowDeleteRecordAlert = (record: Record) => {
    setIsAlertVisible(true);
    setSelectedRecordToDelete(record)
  };

  const handleCloseDeleteRecordAlert = () => {
    setIsAlertVisible(false);
    setSelectedRecordToDelete(null)

  };

  // const handleDeleteRecord = (recordId: string) => {
  //   alert('Deleted the record of this ' + recordId);
  // };

  const handleDeleteRecord = async (recordId: string) => {
    const requestHeaders = new Headers();
    requestHeaders.append('Authorization', `Bearer ${token}`);
    if (sessionId) {
      requestHeaders.append('sessionId', sessionId);
    }
    const url = `${process.env.NEXT_PUBLIC_API_URL}/records/${recordId}`
    const res = await fetch(url, {
      method: 'DELETE',
      headers: requestHeaders
    })

    const result = await res.json()
    console.log("@#L$$#RESULLT",result)
    setIsAlertVisible(false)
    refresh()
  }


  // --- Row Editing Functions ---
  // Trigger edit mode for a row by clicking the pencil icon
  const handleEditRow = (rowIndex: number) => {
    setEditingRow(rowIndex);
    setEditedRecords((prev) => ({
      ...prev,
      [rowIndex]: { ...localRows?.[rowIndex] }
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
    console.log('REEEC to be UPDATED', localRows?.[rowIndex].hiddenId)
    // Create a complete record with every key from localColumns. If no value, use empty string.
    const completeRecord: Record = {};
    localColumns?.forEach((column) => {
      completeRecord[column.id] =
        updatedRow[column.id] !== undefined && updatedRow[column.id] !== null
          ? updatedRow[column.id]
          : '';
    });

    // Update localRows state
    setLocalRows((prev) => {
      if (!prev) return prev;
      const newRows = [...prev];
      newRows[rowIndex] = updatedRow;
      return newRows;
    });
   
    const url = `${process.env.NEXT_PUBLIC_API_URL}/records/${localRows?.[rowIndex].hiddenId}`
    console.log('URL', url)
    const requestHeaders = new Headers();
    requestHeaders.append('Authorization', `Bearer ${token}`);
    requestHeaders.append('Content-Type', 'application/json')
    if (sessionId) {
      requestHeaders.append('sessionId', sessionId);
    }

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: requestHeaders,
        body: JSON.stringify(completeRecord)
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Update failed:', errorData);
        throw new Error(`Update failed: ${JSON.stringify(errorData)}`);
      }

      const result = await res.json();
      console.log('Update successful:', result);
      setEditingRow(null);
      setEditedRecords((prev) => {
        const newEdited = { ...prev };
        delete newEdited[rowIndex];
        return newEdited;
      });
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  // Cancel editing the row (triggered by the floating trash icon in edit mode)
  const handleCancelRow = (rowIndex: number) => {
    setEditingRow(null);
    setEditedRecords((prev) => {
      const newEdited = { ...prev };
      delete newEdited[rowIndex];
      return newEdited;
    });
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
                            editedRecords[rowIndex]?.[column.id] ??
                            row[column.id] ??
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
                        <span className="flex-1">
                          {/* {row[column.id] !== undefined ? row[column.id] : 'N/A'} */}
                          {row[column.id]}
                        </span>
                      )}
                    </div>
                  ) : (
                    editingRow === rowIndex ? (
                      <input
                        type="text"
                        className="w-full outline-none"
                        value={
                          editedRecords[rowIndex]?.[column.id] ??
                          row[column.id] ??
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
                      <span className="flex-1">
                        {/* {row[column.id] !== undefined ? row[column.id] : 'N/A'} */}
                        {row[column.id]}
                      </span>
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
      )
}
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
    </div>
  );
}
