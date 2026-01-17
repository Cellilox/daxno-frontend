"use client"

import { useEffect, useState, useRef } from 'react';
import { deleteColumn, updateColumn, updateColumnWidth } from '@/actions/column-actions';
import { deleteRecord, updateRecord } from '@/actions/record-actions';
import { updateProjectSettings } from '@/actions/project-actions';
import { Field, DocumentRecord, SpreadSheetProps } from './types';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import SpreadsheetModals from './SpreadsheetModals';
import { deleteFileUrl } from '@/actions/aws-url-actions';

export default function SpreadSheet({ columns, records, projectId, project }: SpreadSheetProps) {
  const [localColumns, setLocalColumns] = useState<Field[]>([]);
  const [localRecords, setLocalRecords] = useState<DocumentRecord[]>([]);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedColumnToUpdate, setSelectedColumnToUpdate] = useState<Field | null>(null);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [selectedColumnToDelete, setSelectedColumnToDelete] = useState<Field | null>(null);
  const [selectedRecordToDelete, setSelectedRecordToDelete] = useState<DocumentRecord | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number, columnId: string } | null>(null);
  const [editedRecords, setEditedRecords] = useState<{ [rowIndex: number]: DocumentRecord }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRecordForReview, setSelectedRecordForReview] = useState<DocumentRecord | null>(null);


  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (columns) setLocalColumns(columns);
    if (records) setLocalRecords(records);
  }, [records, columns]);

  useEffect(() => {
    setColumnWidths(prev => {
      const newWidths: { [key: string]: number } = {
        '__actions__': 100,
        '__filename__': 200,
        ...prev
      };

      if (project?.ui_settings?.column_widths) {
        Object.assign(newWidths, project.ui_settings.column_widths);
      }

      columns?.forEach(col => {
        if (!newWidths[col.hidden_id]) {
          newWidths[col.hidden_id] = col.width || 200;
        }
      });
      return newWidths;
    });
  }, [columns, project]);

  // Column handlers
  const handleColumnResize = (columnId: string, newWidth: number) => {
    const clampedWidth = Math.max(50, newWidth);
    setColumnWidths(prev => ({
      ...prev,
      [columnId]: clampedWidth
    }));

    // Debounced Persistence
    const timerId = `resize-${columnId}`;
    if ((window as any)[timerId]) clearTimeout((window as any)[timerId]);
    (window as any)[timerId] = setTimeout(async () => {
      try {
        if (columnId === '__filename__' || columnId === '__actions__') {
          // Standard columns: Update project settings
          const currentWidths = { ...columnWidths, [columnId]: clampedWidth }; // Use local latest
          const standardWidths = {
            '__filename__': currentWidths['__filename__'],
            '__actions__': currentWidths['__actions__']
          };
          await updateProjectSettings(projectId, {
            ...project.ui_settings,
            column_widths: standardWidths
          });
        } else {
          // Custom columns: Update field specific width
          await updateColumnWidth(columnId, projectId, clampedWidth);
        }
      } catch (err) {
        console.error('Failed to persist column width:', err);
      } finally {
        delete (window as any)[timerId];
      }
    }, 1000);
  };

  // Auto-scroll when new columns are added
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevColumnsLength = useRef(columns?.length || 0);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent scroll on initial load
    if (!hasInitialized.current && localColumns.length > 0) {
      hasInitialized.current = true;
      prevColumnsLength.current = localColumns.length;
      return;
    }

    if (localColumns.length > prevColumnsLength.current) {
      // Column added
      if (scrollContainerRef.current) {
        // Scroll to the end (right)
        // Use setTimeout to allow DOM to update with new column
        setTimeout(() => {
          const container = scrollContainerRef.current;
          if (container) {
            container.scrollTo({
              left: container.scrollWidth,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
    prevColumnsLength.current = localColumns.length;
  }, [localColumns.length]);

  const handleShowColumnUpdatePopup = (column: Field) => {
    setSelectedColumnToUpdate(column);
    setIsPopupVisible(true);
  };


  const handleCloseColumnUpdatePopup = () => {
    setIsPopupVisible(false);
    setSelectedColumnToUpdate(null);
  };

  const handleUpdateColumn = async (column: Field, newName: string) => {
    if (!newName.trim() || newName === column.name) return;

    setIsLoading(true);
    const updateData = {
      id: column.id,
      name: newName,
      description: column.description,
      related_project: projectId
    };

    try {
      await updateColumn(column.hidden_id, projectId, updateData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating column:', error);
      setIsLoading(false);
    }
  };

  const handleUpdateColumnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const updateData = {
      id: selectedColumnToUpdate?.id,
      name: selectedColumnToUpdate?.name,
      description: selectedColumnToUpdate?.description,
      related_project: projectId
    };

    try {
      await updateColumn(selectedColumnToUpdate?.hidden_id, projectId, updateData);
      setIsLoading(false);
      setIsPopupVisible(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleShowDeleteColumnAlert = (column: Field) => {
    setIsAlertVisible(true);
    setSelectedColumnToDelete(column);
  };

  const handleCloseDeleteColumnAlert = () => {
    setIsAlertVisible(false);
    setSelectedColumnToDelete(null);
  };

  const handleDeleteColumn = async (columnId: string) => {
    setIsLoading(true);
    try {
      await deleteColumn(columnId, projectId);
      setIsLoading(false);
      setIsAlertVisible(false);
      setSelectedColumnToDelete(null);
    } catch (error) {
      alert('Error deleting column');
      setIsLoading(false);
    }
  };

  // Record handlers
  const handleShowDeleteRecordAlert = (record: DocumentRecord) => {
    setIsAlertVisible(true);
    setSelectedRecordToDelete(record);
  };

  const handleCloseDeleteRecordAlert = () => {
    setIsAlertVisible(false);
    setSelectedRecordToDelete(null);
  };

  const handleDeleteRecord = async (recordId: string, file_key: string) => {
    setIsLoading(true);
    try {
      await deleteRecord(recordId);
      await handleDeleteFileUrl(file_key, projectId);
    } catch (error) {
      alert('Error deleting a record');
    } finally {
      setIsLoading(false);
      setIsAlertVisible(false);
      setSelectedRecordToDelete(null);
    }
  };

  const handleDeleteFileUrl = async (file_key: string, proj_id: string) => {
    await deleteFileUrl(file_key, proj_id);
  };

  const handleEditCell = (rowIndex: number, columnId: string) => {
    setEditingCell({ rowIndex, columnId });
  };

  const handleCellChange = (rowIndex: number, columnId: string, value: string) => {
    setEditedRecords((prev) => {
      const currentRecord = prev[rowIndex] || localRecords[rowIndex];
      const currentAnswer = currentRecord.answers[columnId] || {
        text: '',
        geometry: { left: 0, top: 0, width: 0, height: 0 }
      };

      return {
        ...prev,
        [rowIndex]: {
          ...currentRecord,
          answers: {
            ...currentRecord.answers,
            [columnId]: {
              ...currentAnswer,
              text: value,
              geometry: { ...currentAnswer.geometry }
            },
          },
        },
      };
    });
  };

  const handleSaveRow = async (rowIndex: number) => {
    const editedRecord = editedRecords[rowIndex];

    // Always clear the editing state to exit edit mode
    setEditingCell(null);

    if (!editedRecord) return;

    try {
      await updateRecord(editedRecord.id, editedRecord);
      setEditedRecords((prev) => {
        const newState = { ...prev };
        delete newState[rowIndex];
        return newState;
      });
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleCancelEdit = (rowIndex: number) => {
    setEditedRecords((prev) => {
      const newState = { ...prev };
      delete newState[rowIndex];
      return newState;
    });
    setEditingCell(null);
  };


  const handleConfirmDelete = async () => {
    if (!selectedRecordToDelete) return;

    try {
      setIsLoading(true);
      await deleteRecord(selectedRecordToDelete.id);
      setIsAlertVisible(false);
    } catch (error) {
      alert('Error deleting a record');
    } finally {
      setIsLoading(false);
      setSelectedRecordToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsAlertVisible(false);
    setSelectedRecordToDelete(null);
  };

  const handleReviewRecord = (record: DocumentRecord) => {
    setIsPopupVisible(true)
    setSelectedRecordForReview(record);
  }

  const handleCloseReviewRecordPopup = () => {
    setIsPopupVisible(false);
    setSelectedRecordForReview(null);
  }

  const hasRecords = localRecords.length > 0;

  if (!localRecords) {
    return <div>Loading...</div>;
  }

  return (
    <div ref={scrollContainerRef} className="bg-white border border-gray-200 rounded-lg shadow-sm relative overflow-auto h-full">
      <table className="w-full bg-white" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          {hasRecords && (
            <>
              <col style={{ width: `${columnWidths['__actions__'] || 100}px` }} className="md:hidden" />
              <col style={{ width: `${columnWidths['__filename__'] || 200}px` }} />
            </>
          )}
          {localColumns.map(col => (
            <col key={`col-${col.hidden_id}`} style={{ width: `${columnWidths[col.hidden_id] || 200}px` }} />
          ))}
          <col style={{ width: '200px' }} />
        </colgroup>
        <TableHeader
          columns={localColumns}
          records={localRecords}
          hoveredColumn={hoveredColumn}
          setHoveredColumn={setHoveredColumn}
          onEditColumn={handleShowColumnUpdatePopup}
          onDeleteColumn={handleShowDeleteColumnAlert}
          projectId={projectId}
          columnWidths={columnWidths}
          onColumnResize={handleColumnResize}
          onUpdateColumn={handleUpdateColumn}
        />
        <tbody>
          {localRecords.map((row, rowIndex) => (
            <TableRow
              key={`${row.id}-${rowIndex}`}
              row={row}
              columns={localColumns}
              rowIndex={rowIndex}
              hoveredRow={hoveredRow}
              setHoveredRow={setHoveredRow}
              editingCell={editingCell}
              editedRecords={editedRecords}
              onCellChange={handleCellChange}
              onSaveRow={handleSaveRow}
              onCancelEdit={handleCancelEdit}
              onEditCell={handleEditCell}
              onDeleteRow={handleShowDeleteRecordAlert}
              handleReviewRecord={handleReviewRecord}
              columnWidths={columnWidths}
            />
          ))}

          {/* Ghost Rows to fill screen */}
          {Array.from({ length: Math.max(0, 20 - localRecords.length) }).map((_, i) => (
            <tr key={`ghost-${i}`} className="h-12 border-b border-gray-100/50">
              {hasRecords && (
                <>
                  {/* Actions Ghost */}
                  <td className="md:hidden"></td>
                  {/* Filename Ghost */}
                  <td className="px-4 py-2 border-r border-gray-100 bg-gray-50/10"></td>
                </>
              )}
              {/* Columns Ghost */}
              {localColumns.map(col => (
                <td key={`ghost-${i}-${col.hidden_id}`} className="border-r border-gray-100"></td>
              ))}
              {/* Spacer Ghost - Removed */}
            </tr>
          ))}
        </tbody>
      </table>

      <SpreadsheetModals
        isPopupVisible={isPopupVisible}
        selectedColumnToUpdate={selectedColumnToUpdate}
        isLoading={isLoading}
        isAlertVisible={isAlertVisible}
        selectedColumnToDelete={selectedColumnToDelete}
        selectedRecordToDelete={selectedRecordToDelete}
        projectId={projectId}
        onCloseColumnUpdatePopup={handleCloseColumnUpdatePopup}
        onUpdateColumnSubmit={handleUpdateColumnSubmit}
        onCloseDeleteColumnAlert={handleCloseDeleteColumnAlert}
        onDeleteColumn={handleDeleteColumn}
        onCloseDeleteRecordAlert={handleCloseDeleteRecordAlert}
        onDeleteRecord={handleDeleteRecord}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
        setSelectedColumnToUpdate={setSelectedColumnToUpdate}
        selectedRecordForReview={selectedRecordForReview}
        handleCloseReviewRecordPopup={handleCloseReviewRecordPopup}
        columns={columns}
      />
    </div>
  );
}