"use client"

import { useEffect, useState } from 'react';
import { deleteColumn, updateColumn } from '@/actions/column-actions';
import { deleteRecord, updateRecord } from '@/actions/record-actions';
import { Field, Record,  SpreadSheetProps } from './types';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import SpreadsheetModals from './SpreadsheetModals';

export default function SpreadSheet({ columns, records, projectId }: SpreadSheetProps) {
  const [localColumns, setLocalColumns] = useState<Field[] | undefined>([]);
  const [localRows, setLocalRows] = useState<Record[] | undefined>([]);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedColumnToUpdate, setSelectedColumnToUpdate] = useState<Field | null>(null);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [selectedColumnToDelete, setSelectedColumnToDelete] = useState<Field | null>(null);
  const [selectedRecordToDelete, setSelectedRecordToDelete] = useState<Record | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedRecords, setEditedRecords] = useState<{ [rowIndex: number]: Record }>({});
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [selectedRecordForChat, setSelectedRecordForChat] = useState<Record | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      await updateColumn(selectedColumnToUpdate?.hidden_id, updateData);
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
      await deleteColumn(columnId);
      setIsLoading(false);
      setIsAlertVisible(false);
    } catch (error) {
      alert('Error deleting column');
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

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await deleteRecord(recordId);
      setIsAlertVisible(false);
      setLocalRows((prev) => prev?.filter(row => row.hiddenId !== recordId));
    } catch (error) {
      alert('Error deleting a record');
    }
  };

  const handleEditRow = (rowIndex: number) => {
    setEditingRow(rowIndex);
    setEditedRecords((prev) => ({
      ...prev,
      [rowIndex]: localRows?.[rowIndex] ? { ...localRows[rowIndex] } : {} as Record
    }));
  };

  const handleCellChange = (rowIndex: number, columnId: string, value: string) => {
    setEditedRecords((prev) => ({
      ...prev,
      [rowIndex]: { ...prev[rowIndex], [columnId]: value }
    }));
  };

  const handleSaveRow = async (rowIndex: number) => {
    try {
      const updatedRecord = editedRecords[rowIndex];
      await updateRecord(updatedRecord.hiddenId, updatedRecord);
      setEditingRow(null);
      setEditedRecords((prev) => {
        const newRecords = { ...prev };
        delete newRecords[rowIndex];
        return newRecords;
      });
    } catch (error) {
      console.error('Error saving row:', error);
    }
  };

  const handleCancelEdit = (rowIndex: number) => {
    setEditingRow(null);
    setEditedRecords((prev) => {
      const newRecords = { ...prev };
      delete newRecords[rowIndex];
      return newRecords;
    });
  };

  const handleChatRow = (record: Record) => {
    setSelectedRecordForChat(record);
    setIsChatVisible(true);
  };

  const handleCloseChat = () => {
    setIsChatVisible(false);
    setSelectedRecordForChat(null);
  };

  if (!localColumns || !localRows) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative overflow-x-auto min-h-[calc(100vh-20rem)]">
      <table className="min-w-full bg-white border border-gray-200">
        <TableHeader
          columns={localColumns}
          hoveredColumn={hoveredColumn}
          setHoveredColumn={setHoveredColumn}
          onEditColumn={handleShowColumnUpdatePopup}
          onDeleteColumn={handleShowDeleteColumnAlert}
        />
        <tbody>
          {localRows.map((row, rowIndex) => (
            <TableRow
              key={row.hiddenId}
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
              onChatRow={handleChatRow}
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
        isChatVisible={isChatVisible}
        selectedRecordForChat={selectedRecordForChat}
        projectId={projectId}
        onCloseColumnUpdatePopup={handleCloseColumnUpdatePopup}
        onUpdateColumnSubmit={handleUpdateColumnSubmit}
        onCloseDeleteColumnAlert={handleCloseDeleteColumnAlert}
        onDeleteColumn={handleDeleteColumn}
        onCloseDeleteRecordAlert={handleCloseDeleteRecordAlert}
        onDeleteRecord={handleDeleteRecord}
        onCloseChat={handleCloseChat}
        setSelectedColumnToUpdate={setSelectedColumnToUpdate}
      />
    </div>
  );
} 