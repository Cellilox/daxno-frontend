import FormModal from '../ui/Popup';
import AlertDialog from '../ui/AlertDialog';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Field, DocumentRecord } from './types';
import DocumentReview from './DocumentReview';

type SpreadsheetModalsProps = {
  isPopupVisible: boolean;
  selectedColumnToUpdate: Field | null;
  isLoading: boolean;
  isAlertVisible: boolean;
  selectedColumnToDelete: Field | null;
  selectedRecordToDelete: DocumentRecord | null;
  projectId: string;
  onCloseColumnUpdatePopup: () => void;
  onUpdateColumnSubmit: (e: React.FormEvent) => void;
  onCloseDeleteColumnAlert: () => void;
  onDeleteColumn: (columnId: string) => void;
  onCloseDeleteRecordAlert: () => void;
  onDeleteRecord: (recordId: string, file_key: string) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  setSelectedColumnToUpdate: (column: Field | null) => void;
  selectedRecordForReview: DocumentRecord | null;
  handleCloseReviewRecordPopup: () => void;
  columns: Field[]
};

export default function SpreadsheetModals({
  isPopupVisible,
  selectedColumnToUpdate,
  isLoading,
  isAlertVisible,
  selectedColumnToDelete,
  selectedRecordToDelete,
  onCloseColumnUpdatePopup,
  onUpdateColumnSubmit,
  onCloseDeleteColumnAlert,
  onDeleteColumn,
  onCloseDeleteRecordAlert,
  onDeleteRecord,
  setSelectedColumnToUpdate,
  selectedRecordForReview,
  handleCloseReviewRecordPopup,
  columns
}: SpreadsheetModalsProps) {
  const handleDeleteRecord = () => {
    if (selectedRecordToDelete) {
      onDeleteRecord(selectedRecordToDelete.id, selectedRecordToDelete.file_key);
    }
  };

  return (
    <>
      {/* Column Update Modal */}
      {isPopupVisible && selectedColumnToUpdate && (
        <FormModal
          visible={isPopupVisible}
          title="Update Column"
          onCancel={onCloseColumnUpdatePopup}
          position='center'
          size='small'
        >
          <form onSubmit={onUpdateColumnSubmit}>
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
                    id: e.target.value,
                    name: e.target.value
                  })
                }
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCloseColumnUpdatePopup}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={onUpdateColumnSubmit}
                disabled={isLoading}
                type="submit"
                className={`min-w-[80px] px-4 py-2 rounded-md text-white ${isLoading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
                  }`}
              >
                {!isLoading && 'Save'}
                {isLoading && <LoadingSpinner />}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* Column Delete Alert */}
      {isAlertVisible && selectedColumnToDelete && (
        <AlertDialog
          visible={isAlertVisible}
          title="Delete Column"
          message="This column will be deleted permanently, and there is no going back."
          confirmText="Delete"
          cancelText="Cancel"
          disabled={isLoading}
          isLoading={isLoading}
          onConfirm={() => onDeleteColumn(selectedColumnToDelete.hidden_id)}
          onCancel={onCloseDeleteColumnAlert}
        />
      )}

      {/* Record Delete Alert */}
      {isAlertVisible && selectedRecordToDelete && (
        <AlertDialog
          visible={isAlertVisible}
          title="Delete Record"
          message="This record will be deleted permanently, and there is no going back."
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={isLoading}
          disabled={isLoading}
          onConfirm={handleDeleteRecord}
          onCancel={onCloseDeleteRecordAlert}
        />
      )}

      {isPopupVisible && selectedRecordForReview && (
        <FormModal
          visible={isPopupVisible}
          title={`Review ${selectedRecordForReview.original_filename}`}
          onCancel={handleCloseReviewRecordPopup}
          size='large'
        >
          <div>
            <DocumentReview selectedRecordForReview={selectedRecordForReview} columns={columns} />
          </div>
        </FormModal>
      )}
    </>
  );
} 