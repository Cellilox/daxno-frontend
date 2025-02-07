import { useEffect, useRef } from 'react';

type FormModalProps = {
  visible: boolean;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  children: React.ReactNode;
};

export default function FormModal({
  visible,
  title,
  onSubmit,
  onCancel,
  children,
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
    <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end p-4">
      <div ref={modalRef} className="bg-white w-full lg:w-2/5 h-full p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <form onSubmit={onSubmit}>
          {children}
        </form>
      </div>
    </div>
  );
}
