import { useEffect, useRef } from 'react';
import { CopyIcon } from 'lucide-react';

type AlertDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  showCopyIcon?: boolean;
  copiedMessage?: string;
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
}: AlertDialogProps) {
  const alertRef = useRef<HTMLDivElement>(null);

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
    <div className="z-50 fixed inset-0 top-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        ref={alertRef}
        className="bg-white w-full lg:w-2/5 p-6 flex flex-col justify-center items-center rounded-lg shadow-lg"
      >
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p>{message}</p>
        {copiedMessage !="" && (
          <div className="flex items-center mt-2">
            {copiedMessage && <span className="text-green-500">{copiedMessage}</span>}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
