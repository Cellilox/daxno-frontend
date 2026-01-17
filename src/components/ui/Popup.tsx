import { useEffect, useRef } from 'react';
import ModalHeader from './ModalHeader';
import { messageType } from '@/types';

type FormModalProps = {
  visible: boolean;
  title?: string;
  isHeaderHidden?: boolean;
  message?: messageType;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel: () => void;
  children: React.ReactNode;
  position?: 'center' | 'right';
  size?: 'small' | 'large';

  fullScreen?: boolean;
};

export default function FormModal({
  visible,
  title,
  isHeaderHidden,
  message,
  onCancel,
  children,
  position = 'right',
  size = 'small',
  fullScreen = false
}: FormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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
    <div
      className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto z-[100]"
      style={{ minHeight: '100vh' }}
    >
      <div
        ref={modalRef}
        className={`
          relative bg-white 
          shadow-xl flex flex-col overflow-hidden
          ${fullScreen
            ? 'w-full h-full m-0 rounded-none md:w-[95%] md:h-[90vh] md:m-4 md:rounded-lg'
            : `w-[95%] max-h-[90vh] rounded-lg ${position === 'center' ? 'm-4' : 'h-full right-0'}`
          }
          ${!fullScreen && size === 'large' ? "lg:w-5/6" : ""}
          ${!fullScreen && size === 'small' ? "lg:w-2/5" : ""}
          ${fullScreen && size === 'large' ? "lg:w-5/6" : ""} 
        `}
      >
        <ModalHeader title={title} onClose={onCancel} message={message} isHeaderHidden={isHeaderHidden} />

        {/* Content Wrapper */}
        <div className={`flex-1 flex flex-col ${fullScreen ? 'p-0 overflow-hidden' : 'p-6'}`}>
          {fullScreen ? (
            /* FullScreen Mode: Children take full height, manage their own scroll */
            <div className="flex-1 h-full w-full overflow-hidden">
              {children}
            </div>
          ) : (
            /* Default Mode: Legacy wrappers with padding and max-height */
            <div className="flex flex-col h-full">
              <div
                className="overflow-y-auto scrollbar-hide"
                style={{
                  maxHeight: 'calc(90vh - 150px)',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {children}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
