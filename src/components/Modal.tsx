"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { useModalContext } from "./context/modal";

type Props = {
  title: string;
  onClose: () => void;
  onOk: () => void;
  children: React.ReactNode;
};

export default function Modal({ title, children }: Props) {
  const { isVisible, openModal, closeModal } = useModalContext();
  const dialogRef = useRef<null | HTMLDialogElement>(null);

  useEffect(() => {
    if (isVisible) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isVisible]);

  const handleCloseDialog = () => {
    closeModal();
  };

  const handleOutsideClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (dialogRef.current && event.target === dialogRef.current) {
      handleCloseDialog();
    }
  };

  return (
    <>
      {/* Button to Open Modal */}
      <button
        onClick={openModal}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
      >
        {title}
      </button>

      {/* Modal Dialog */}
      {isVisible && (
        <dialog
          ref={dialogRef}
          onClick={handleOutsideClick}
          className="fixed inset-0 z-50 w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-3">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={handleCloseDialog}
                className="p-2 rounded hover:bg-blue-700 transition"
                aria-label="Close modal"
              >
                <Image src="/close.svg" alt="Close" width={24} height={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {children}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-4 p-4 border-t">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
