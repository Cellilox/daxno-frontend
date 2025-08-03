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

};

export default function FormModal({
  visible,
  title,
  isHeaderHidden,
  message,
  onCancel,
  children,
  position = 'right',
  size= 'small'
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
          relative bg-white w-[95%] lg:w-2/5 
          max-h-[90vh] rounded-lg shadow-xl 
          flex flex-col overflow-hidden
          ${position === 'center' ? 'm-4' : 'h-full right-0'}
          ${size === 'large' ? "lg:w-5/6" : "lg:w-2/5"}
        `}
      >
        <ModalHeader title={title} onClose={onCancel} message={message} isHeaderHidden={isHeaderHidden}/>
        <div className="p-6 flex-1">
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
        </div>
      </div>
    </div>
  );
}
