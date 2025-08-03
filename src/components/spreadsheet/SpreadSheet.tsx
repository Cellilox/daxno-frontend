"use client"

import { useEffect, useState } from 'react';
import { deleteColumn, updateColumn } from '@/actions/column-actions';
import { deleteRecord, updateRecord } from '@/actions/record-actions';
import { Field, Record, ApiRecord } from './types';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import SpreadsheetModals from './SpreadsheetModals';
import { deleteFileUrl } from '@/actions/aws-url-actions';

type SpreadSheetProps = {
  columns: Field[];
  records: ApiRecord[];
  projectId: string;
};

export default function SpreadSheet({ columns, records, projectId }: SpreadSheetProps) {
  const [localColumns, setLocalColumns] = useState<Field[]>([]);
  const [localRecords, setLocalRecords] = useState<Record[]>([]);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedColumnToUpdate, setSelectedColumnToUpdate] = useState<Field | null>(null);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [selectedColumnToDelete, setSelectedColumnToDelete] = useState<Field | null>(null);
  const [selectedRecordToDelete, setSelectedRecordToDelete] = useState<Record | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedRecords, setEditedRecords] = useState<{ [rowIndex: number]: Record }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRecordForReview, setSelectedRecordForReview] = useState<Record | null>(null);


  useEffect(() => {
    setLocalColumns(columns || []);
    if (records) {
      // Convert ApiRecord to Record (they now have matching answer structures)
      const convertedRecords = records.map(apiRecord => ({
        ...apiRecord,
        answers: { ...apiRecord.answers }
      }));
      setLocalRecords(convertedRecords);
    }
  }, [records, columns]);

  // Column handlers
  const handleShowColumnUpdatePopup = (column: Field) => {
    setSelectedColumnToUpdate(column);
    setIsPopupVisible(true);
  };

  
  const handleCloseColumnUpdatePopup = () => {
    setIsPopupVisible(false);
    setSelectedColumnToUpdate(null);
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
  const handleShowDeleteRecordAlert = (record: Record) => {
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

  const handleDeleteFileUrl = async(file_key: string, proj_id: string) => {
    await deleteFileUrl(file_key, proj_id);
  };

  const handleEditRow = (rowIndex: number) => {
    setEditingRow(rowIndex);
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
            },
          },
        },
      };
    });
  };

  const handleSaveRow = async (rowIndex: number) => {
    const editedRecord = editedRecords[rowIndex];
    console.log('EditedRec', editedRecord)
    if (!editedRecord) return;

    try {
      const result = await updateRecord(editedRecord.id, editedRecord);
      console.log('TLEWKQE', result)
      setEditingRow(null);
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
    setEditingRow(null);
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

  const handleReviewRecord = (record: Record) => {
    setIsPopupVisible(true)
    setSelectedRecordForReview(record);
  }

  const handleCloseReviewRecordPopup = () => {
    setIsPopupVisible(false);
    setSelectedRecordForReview(null);
  }

  if (!localColumns || !localRecords) {
    return <div>Loading...</div>;
  }

  return (
    <div className="z-[-1] bg-gray-50 border border-1 border-gray relative overflow-x-auto min-h-[calc(100vh-30rem)]">
      <table className="min-w-full bg-white border border-gray-200">
        <TableHeader
          columns={localColumns}
          records={records}
          hoveredColumn={hoveredColumn}
          setHoveredColumn={setHoveredColumn}
          onEditColumn={handleShowColumnUpdatePopup}
          onDeleteColumn={handleShowDeleteColumnAlert}
          projectId={projectId}
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
              editingRow={editingRow}
              editedRecords={editedRecords}
              onCellChange={handleCellChange}
              onSaveRow={handleSaveRow}
              onCancelEdit={handleCancelEdit}
              onEditRow={handleEditRow}
              onDeleteRow={handleShowDeleteRecordAlert}
              handleReviewRecord={handleReviewRecord}
            />
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