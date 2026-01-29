import { useEffect, useRef } from 'react';
import { CopyIcon, Link } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import MessageAlert from './messageAlert';
import { messageTypeEnum, messageType } from '@/types';

type AlertDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  showCopyIcon?: boolean;
  showLinkIcon?: boolean;
  copiedMessage?: string;
  disabled?: boolean;
  isLoading?: boolean;
  centerContent?: boolean;
  notification?: messageType;
};

export default function AlertDialog({
  visible,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  copiedMessage,
  disabled,
  isLoading,
  showLinkIcon,
  centerContent,
  notification
}: AlertDialogProps) {
  const alertRef = useRef<HTMLDivElement>(null);
  const isCopyAction = confirmText === 'Copy';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (alertRef.current && !alertRef.current.contains(event.target as Node)) {
        onCancel();
      }
    }
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onCancel]);

  if (!visible) return null;

  return (
    <div data-testid="alert-dialog-backdrop" className="z-50 fixed inset-0 top-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        ref={alertRef}
        data-testid="alert-dialog-content"
        className="bg-white w-full max-w-2xl p-6 flex flex-col justify-center items-center rounded-lg shadow-lg"
      >
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {notification &&
          <MessageAlert message={notification} />
        }
        <div className={`w-full max-w-full break-all ${centerContent ? 'flex justify-center' : ''}`}>
          {showLinkIcon ? (
            <div className={`flex items-start gap-2 bg-gray-50 p-3 rounded-md ${centerContent ? 'max-w-[90%]' : 'w-full'}`}>
              <Link className="w-4 h-4 mt-1 flex-shrink-0 text-blue-600" />
              {notification ? <p>not-shown</p> : (
                <p className="text-center">
                  {message}
                </p>
              )}
            </div>
          ) : (
            <p className="text-center">
              {message}
            </p>
          )}
        </div>
        {copiedMessage && (
          <div className="flex items-center mt-2">
            <span className="text-green-500 text-sm">{copiedMessage}</span>
          </div>
        )}

        {!notification &&
          <div className="flex justify-end gap-2 mt-6 w-full">
            <button
              type="button"
              onClick={onCancel}
              data-testid="alert-dialog-cancel"
              className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600"
            >
              {cancelText}
            </button>
            <button
              disabled={disabled || isLoading}
              type="button"
              onClick={onConfirm}
              data-testid="alert-dialog-confirm"
              className={`min-w-[80px] px-4 py-2 rounded-md text-white text-sm flex items-center justify-center ${isCopyAction
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-red-500 hover:bg-red-600'
                } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  {confirmText}
                  {isCopyAction && <CopyIcon className="w-4 h-4 ml-2" />}
                </>
              )}
            </button>
          </div>
        }
      </div>
    </div>
  );
}
