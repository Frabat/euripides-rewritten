"use client";

import { Edit, Trash2 } from "lucide-react";
import { ProtectScholar } from "@/components/auth/ProtectScholar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface CardActionsProps {
    onEdit?: () => void;
    onDelete?: () => Promise<void>;
    editUrl?: string;
    itemType: string; // e.g. "Opera", "Libro", "Volume"
}

export function CardActions({ onEdit, onDelete, editUrl, itemType }: CardActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const router = useRouter();

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onEdit) {
            onEdit();
        } else if (editUrl) {
            router.push(editUrl);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!onDelete) return;

        setIsDeleting(true);
        try {
            await onDelete();
            // Usually the parent refreshes or redirects, but we close modal anyway
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Delete failed", error);
            alert("Errore durante l'eliminazione.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <ProtectScholar>
            <div className="flex items-center gap-1 z-20">
                {(onEdit || editUrl) && (
                    <button
                        onClick={handleEdit}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title={`Modifica ${itemType}`}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={handleDeleteClick}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title={`Elimina ${itemType}`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}

                {/* Confirm Modal */}
                {showDeleteModal && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <ConfirmModal
                            isOpen={showDeleteModal}
                            onClose={() => setShowDeleteModal(false)}
                            onConfirm={confirmDelete}
                            title={`Elimina ${itemType}`}
                            description={`Sei sicuro di voler eliminare questo ${itemType}? Questa azione non può essere annullata.`}
                            confirmText="Elimina definitivamente"
                            isDestructive
                            isLoading={isDeleting}
                        />
                    </div>
                )}
            </div>
        </ProtectScholar>
    );
}
