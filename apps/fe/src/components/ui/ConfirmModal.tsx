"use client";

import { Modal } from "@/components/ui/Modal";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Conferma",
    cancelText = "Annulla",
    isDestructive = false,
    isLoading = false
}: ConfirmModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <p className="text-gray-600">
                    {description}
                </p>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-2
                            ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'}
                        `}
                    >
                        {isLoading ? "Elaborazione..." : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
