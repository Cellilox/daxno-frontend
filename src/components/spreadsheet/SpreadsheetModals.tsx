import FormModal from '../ui/Popup';
import AlertDialog from '../ui/AlertDialog';
import LoadingSpinner from '../ui/LoadingSpinner';
import RecordChat from '../RecordChat';
import { Field, Record } from './types';

type SpreadsheetModalsProps = {
  isPopupVisible: boolean;
  selectedColumnToUpdate: Field | null;
  isLoading: boolean;
  isAlertVisible: boolean;
  selectedColumnToDelete: Field | null;
  selectedRecordToDelete: Record | null;
  isChatVisible: boolean;
  selectedRecordForChat: Record | null;
  projectId: string;
  onCloseColumnUpdatePopup: () => void;
  onUpdateColumnSubmit: (e: React.FormEvent) => void;
  onCloseDeleteColumnAlert: () => void;
  onDeleteColumn: (columnId: string) => void;
  onCloseDeleteRecordAlert: () => void;
  onDeleteRecord: (recordId: string) => void;
  onCloseChat: () => void;
  setSelectedColumnToUpdate: (column: Field) => void;
};

export default function SpreadsheetModals({
  isPopupVisible,
  selectedColumnToUpdate,
  isLoading,
  isAlertVisible,
  selectedColumnToDelete,
  selectedRecordToDelete,
  isChatVisible,
  selectedRecordForChat,
  projectId,
  onCloseColumnUpdatePopup,
  onUpdateColumnSubmit,
  onCloseDeleteColumnAlert,
  onDeleteColumn,
  onCloseDeleteRecordAlert,
  onDeleteRecord,
  onCloseChat,
  setSelectedColumnToUpdate,
}: SpreadsheetModalsProps) {
  return (
    <>
      {/* Column Update Modal */}
      {isPopupVisible && selectedColumnToUpdate && (
        <FormModal
          visible={isPopupVisible}
          title="Update Column"
          onCancel={onCloseColumnUpdatePopup}
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
                    name: e.target.value,
                  })
                }
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Description (optional)
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
                onClick={onCloseColumnUpdatePopup}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={onUpdateColumnSubmit}
                disabled={isLoading}
                type="submit"
                className={`min-w-[80px] px-4 py-2 rounded-md text-white ${
                  isLoading 
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
          onConfirm={() => onDeleteRecord(selectedRecordToDelete.hiddenId)}
          onCancel={onCloseDeleteRecordAlert}
        />
      )}

      {/* Record Chat Modal */}
      {isChatVisible && selectedRecordForChat && (
        <FormModal
          visible={isChatVisible}
          title={`Chat about ${selectedRecordForChat.filename}`}
          onCancel={onCloseChat}
          position="right"
        >
          <RecordChat
            projectId={projectId}
            filename={selectedRecordForChat.filename}
          />
        </FormModal>
      )}
    </>
  );
} 