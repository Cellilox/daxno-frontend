"use client";

import { useState, useRef, useEffect } from "react";
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

    const closeDialog = () => {
        closeModal()
        closeModal()
    };

    const handleOutsideClick = (event: React.MouseEvent<HTMLDialogElement>) => {
        const dialog = dialogRef.current;
        if (dialog && event.target === dialog) {
            closeDialog();
        }
    };

    return (
        <>
            <div
                onClick={() => openModal()}
                className="p-3 mt-3 bg-blue-600 text-white rounded"
            >
                {title}
            </div>
            {isVisible && (
                <dialog
                    ref={dialogRef}
                    onClick={handleOutsideClick}
                    className="fixed top-50 left-50 -translate-x-50 -translate-y-50 z-10 rounded-xl backdrop:bg-stone-800/60 w-1/2 h-3/4"
                >
                    <div className="w-full max-w-full bg-gray-200 flex flex-col h-full">
                        <div className="flex flex-row justify-between mb-4 p-4 bg-customBlue">
                            <h1 className="text-2xl text-white">{title}</h1>
                            <div onClick={closeModal}>
                                <Image src="/close.svg" alt="My Icon" width={40} height={40} />
                            </div>
                        </div>
                        <div className="px-5 pb-6 h-5/6">
                            {children}
                        </div>
                    </div>
                </dialog>
            )}
        </>
    );
}