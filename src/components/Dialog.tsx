"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useRef, useEffect } from 'react';

type Props = {
    title: string;
    onClose: () => void;
    onOk: () => void;
    children: React.ReactNode;
};

export default function Dialog({ title, onClose, onOk, children }: Props) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dialogRef = useRef<null | HTMLDialogElement>(null);
    const modal = searchParams.get('modal');

    useEffect(() => {
        if (modal === 'visible') {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [modal]);

    const closeDialog = () => {
        dialogRef.current?.close();
        onClose();
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.delete('modal');
        const newSearch = currentParams.toString();
        router.replace(`${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`);
    };

    const clickOk = () => {
        onOk();
        closeDialog();
    };

    const handleOutsideClick = (event: React.MouseEvent<HTMLDialogElement>) => {
        const dialog = dialogRef.current;
        if (dialog && event.target === dialog) {
            closeDialog();
        }
    };

    const dialog: JSX.Element | null = modal === 'visible' ? (
        <dialog
            ref={dialogRef}
            onClick={handleOutsideClick}
            className="fixed top-50 left-50 -translate-x-50 -translate-y-50 z-10 rounded-xl backdrop:bg-gray-800/50 w-1/2 h-3/4"
        >
            <div className="w-full max-w-full bg-gray-200 flex flex-col h-full">
                <div className="flex flex-row justify-between mb-4 pt-2 px-5 bg-blue-600">
                    <h1 className="text-2xl">{title}</h1>
                    <button
                        onClick={closeDialog}
                        className="mb-2 py-1 px-2 cursor-pointer rounded border-none w-8 h-8 font-bold bg-red-600 text-white"
                    >
                        x
                    </button>
                </div>
                <div className="px-5 pb-6 h-5/6">
                    {children}
                    {/* <div className="flex flex-row justify-end mt-2">
                        <button
                            onClick={clickOk}
                            className="bg-green-500 py-1 px-2 rounded border-none"
                        >
                            OK
                        </button>
                    </div> */}
                </div>
            </div>
        </dialog>
    ) : null;

    return dialog;
}