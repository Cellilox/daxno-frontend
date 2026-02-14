"use client"

import { useEffect, useState, useRef } from 'react';
import { deleteColumn, updateColumn, updateColumnWidth } from '@/actions/column-actions';
import { deleteRecord, updateRecord, deleteBatchRecords } from '@/actions/record-actions';
import { Trash, X } from 'lucide-react';
import { updateProjectSettings } from '@/actions/project-actions';
import { Field, DocumentRecord, SpreadSheetProps } from './types';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import SpreadsheetModals from './SpreadsheetModals';
import { deleteFileUrl } from '@/actions/aws-url-actions';
import BackfillModal from '../forms/BackfillModal';
import AlertDialog from '../ui/AlertDialog';

export default function SpreadSheet({
  columns,
  records,
  projectId,
  project,
  onDeleteRecord,
  onDeleteBatch,
  onUpdateRecord,
  onUpdateColumn,
  onDeleteColumn,
  backfillingFieldId,
  backfillingRecordId,
  onBackfillRecord,
  isOnline = true
}: SpreadSheetProps & {
  backfillingFieldId?: string | null,
  backfillingRecordId?: string | null,
  onBackfillRecord?: (id: string, filename: string) => void
}) {
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
  const [isBackfillModalOpen, setIsBackfillModalOpen] = useState(false);
  const [selectedFieldForBackfill, setSelectedFieldForBackfill] = useState<Field | null>(null);

  // Batch Selection State
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set());
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [showBatchDeleteAlert, setShowBatchDeleteAlert] = useState(false);


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
    const timerId = `resize - ${columnId} `;
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
    if (!hasInitialized.current && columns.length > 0) {
      hasInitialized.current = true;
      prevColumnsLength.current = columns.length;
      return;
    }

    if (columns.length > prevColumnsLength.current) {
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
    prevColumnsLength.current = columns.length;
  }, [columns.length]);

  const handleShowColumnUpdatePopup = (column: Field) => {
    setSelectedColumnToUpdate(column);
    setIsPopupVisible(true);
  };


  const handleCloseColumnUpdatePopup = () => {
    setIsPopupVisible(false);
    setSelectedColumnToUpdate(null);
  };

  const handleUpdateColumn = (column: Field, newName: string) => {
    if (!newName.trim() || newName === column.name) return;
    // Call parent handler with correct signature
    onUpdateColumn?.(column.hidden_id, newName);
  };

  const handleUpdateColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColumnToUpdate) return;
    onUpdateColumn?.(selectedColumnToUpdate.hidden_id, selectedColumnToUpdate.name || '');
    setIsPopupVisible(false);
  };

  const handleShowDeleteColumnAlert = (column: Field) => {
    setIsAlertVisible(true);
    setSelectedColumnToDelete(column);
  };

  const handleCloseDeleteColumnAlert = () => {
    setIsAlertVisible(false);
    setSelectedColumnToDelete(null);
  };

  const handleBackfillColumn = (column: Field) => {
    setSelectedFieldForBackfill(column);
    setIsBackfillModalOpen(true);
  };

  const handleDeleteColumn = (columnId: string) => {
    onDeleteColumn?.(columnId);
    setIsAlertVisible(false);
    setSelectedColumnToDelete(null);
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
      if (onDeleteRecord) {
        await onDeleteRecord(recordId);
      }
      if (file_key) {
        await handleDeleteFileUrl(file_key, projectId);
      }
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
      const currentRecord = prev[rowIndex] || records[rowIndex];
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

  const handleSaveRow = (rowIndex: number) => {
    const editedRecord = editedRecords[rowIndex];
    setEditingCell(null);
    if (!editedRecord) return;

    onUpdateRecord?.(editedRecord.id, editedRecord);

    setEditedRecords((prev) => {
      const newState = { ...prev };
      delete newState[rowIndex];
      return newState;
    });
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
      if (onDeleteRecord) {
        await onDeleteRecord(selectedRecordToDelete.id);
      }

      // Cleanup S3 file if it exists and we are online
      if (selectedRecordToDelete.file_key && navigator.onLine) {
        try {
          await handleDeleteFileUrl(selectedRecordToDelete.file_key, projectId);
        } catch (s3Err) {
          console.warn('[SpreadSheet] S3 cleanup failed (non-critical):', s3Err);
        }
      }

      // Also clear from selection if it was selected
      setSelectedRecordIds(prev => {
        const next = new Set(prev);
        next.delete(selectedRecordToDelete.id);
        return next;
      });

      setIsAlertVisible(false);
    } catch (error) {
      console.error('[SpreadSheet] Delete failed:', error);
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

  // Batch Selection Handlers
  const handleSelectRecord = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRecordIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRecordIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecordIds(new Set(records.map(r => r.id)));
    } else {
      setSelectedRecordIds(new Set());
    }
  };

  const handleBatchDelete = () => {
    setShowBatchDeleteAlert(true);
  };

  const performBatchDelete = async () => {
    setShowBatchDeleteAlert(false);
    setIsBatchDeleting(true);
    try {
      if (onDeleteBatch) {
        await onDeleteBatch(Array.from(selectedRecordIds));
      }
      // Explicitly clear selection AFTER successful parent update
      setSelectedRecordIds(new Set());
    } catch (err) {
      alert('Batch delete failed');
    } finally {
      setIsBatchDeleting(false);
    }
  };

  const hasRecords = records.length > 0;

  if (!records) {
    return <div data-testid="loading-records">Loading...</div>;
  }

  return (
    <div ref={scrollContainerRef} className="bg-white border border-gray-200 rounded-lg shadow-sm relative overflow-auto h-full">
      <table data-testid="records-table" className="w-full bg-white" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          {hasRecords && (
            <>
              {/* Checkbox Column */}
              <col style={{ width: '40px' }} />
              <col style={{ width: `${columnWidths['__actions__'] || 100}px` }} className="md:hidden" />
              <col style={{ width: `${columnWidths['__filename__'] || 200}px` }} />
            </>
          )}
          {columns.map(col => (
            <col key={`col-${col.hidden_id}`} style={{ width: `${columnWidths[col.hidden_id] || 200}px` }} />
          ))}
          <col className="w-[60px] md:w-[200px]" />
        </colgroup>
        <TableHeader
          columns={columns}
          records={records}
          hoveredColumn={hoveredColumn}
          setHoveredColumn={setHoveredColumn}
          onEditColumn={handleShowColumnUpdatePopup}
          onDeleteColumn={handleShowDeleteColumnAlert}
          projectId={projectId}
          columnWidths={columnWidths}
          onColumnResize={handleColumnResize}
          onUpdateColumn={handleUpdateColumn}
          onBackfillColumn={handleBackfillColumn}
          // Batch Selection Props
          selectedCount={selectedRecordIds.size}
          totalCount={records.length}
          onSelectAll={handleSelectAll}
          backfillingFieldId={backfillingFieldId}
          isOnline={isOnline}
        />
        <tbody>
          {records.map((row, rowIndex) => (
            <TableRow
              key={`${row.id}-${rowIndex}`}
              row={row}
              columns={columns}
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
              isSelected={selectedRecordIds.has(row.id)}
              onSelect={(checked) => handleSelectRecord(row.id, checked)}
              backfillingFieldId={backfillingFieldId}
              isRowBackfilling={backfillingRecordId === row.id || (row as any)._isRowBackfilling}
              onBackfillRecord={() => onBackfillRecord && onBackfillRecord(row.id, row.original_filename)}
              isOnline={isOnline}
            />
          ))}

          {/* Ghost Rows to fill screen */}
          {Array.from({ length: Math.max(0, 20 - records.length) }).map((_, i) => (
            <tr key={`ghost-${i}`} className="h-12 border-b border-gray-100/50">
              {hasRecords && (
                <>
                  {/* Checkbox Ghost */}
                  <td className="border-r border-gray-100 bg-gray-50/10 sticky left-0 z-20"></td>
                  {/* Actions Ghost */}
                  <td className="md:hidden sticky left-[40px]"></td>
                  {/* Filename Ghost */}
                  <td className="px-4 py-2 border-r border-gray-100 bg-gray-50/10"></td>
                </>
              )}
              {/* Columns Ghost */}
              {columns.map(col => (
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
        onDeleteColumn={(id) => handleDeleteColumn(id)}
        onCloseDeleteRecordAlert={handleCancelDelete}
        onDeleteRecord={(id, key) => handleConfirmDelete()}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
        setSelectedColumnToUpdate={setSelectedColumnToUpdate}
        selectedRecordForReview={selectedRecordForReview}
        handleCloseReviewRecordPopup={handleCloseReviewRecordPopup}
        columns={columns}
      />

      {/* Batch Delete Alert */}
      <AlertDialog
        visible={showBatchDeleteAlert}
        title={`Delete ${selectedRecordIds.size} Records`}
        message={`Are you sure you want to delete ${selectedRecordIds.size} records? This action cannot be undone.`}
        onConfirm={performBatchDelete}
        onCancel={() => setShowBatchDeleteAlert(false)}
        confirmText="Delete All"
        cancelText="Cancel"
      />

      {/* Floating Bulk Actions Bar */}
      {selectedRecordIds.size > 0 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4">
          <span className="text-sm font-medium text-gray-700">
            {selectedRecordIds.size} selected
          </span>
          <div className="h-4 w-px bg-gray-300"></div>
          <button
            onClick={handleBatchDelete}
            disabled={isBatchDeleting}
            className="flex items-center gap-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-full transition disabled:opacity-50"
          >
            {isBatchDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            onClick={() => setSelectedRecordIds(new Set())}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <BackfillModal
        isOpen={isBackfillModalOpen}
        onClose={() => setIsBackfillModalOpen(false)}
        projectId={projectId}
        field={selectedFieldForBackfill}
        recordCount={records.length}
      />
    </div>
  );
}