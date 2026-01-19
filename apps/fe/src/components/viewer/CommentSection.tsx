"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { CommentBox } from "./CommentBox";
import { getComments, deleteComment } from "@/lib/api";
import { getUser, getToken } from "@/lib/auth";
import { StrapiUser } from "@/types/strapi";

interface CommentSectionProps {
    documentId: string;
}

export function CommentSection({ documentId }: CommentSectionProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [comments, setComments] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<StrapiUser | null>(null);

    const fetchComments = useCallback(async () => {
        try {
            const token = getToken();
            const data = await getComments(documentId, token || undefined);
            setComments(data);
        } catch (e: any) {
            if (e.message && e.message.includes("Forbidden")) {
                console.warn("Comments are hidden (403). Ensure 'find' permission is enabled for Comment in Strapi.");
                // Optionally set a UI state here to show "Comments disabled"
            } else {
                console.error("Failed to load comments", e);
            }
        }
    }, [documentId]);

    useEffect(() => {
        setCurrentUser(getUser());
        if (isOpen) {
            fetchComments();
        }
    }, [isOpen, fetchComments]);

    const handleDelete = async (commentId: string) => {
        if (!confirm("Sei sicuro di voler eliminare questo commento?")) return;
        try {
            const token = getToken();
            if (token) {
                await deleteComment(commentId, token);
                fetchComments();
            }
        } catch (e) {
            alert("Errore durante l'eliminazione");
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm mt-8 overflow-hidden border border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">Discussione della Community</h3>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{comments.length}</span>
                </div>
                {isOpen ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
            </button>

            {isOpen && (
                <div className="p-6 border-t border-gray-100">
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-sm">{comment.author?.username || "Utente"}</div>
                                        <div className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</div>

                                        {comment.startLine && (
                                            <span className="ml-2 text-xs bg-euripides-bg text-euripides-fg px-2 py-0.5 rounded font-bold border border-euripides-fg/20">
                                                Rif: vv. {comment.startLine}{comment.endLine ? ` - ${comment.endLine}` : ''}
                                            </span>
                                        )}
                                    </div>
                                    {/* Delete Button (Owner check) */}
                                    {currentUser && currentUser.id === comment.author?.id && (
                                        <button
                                            onClick={() => handleDelete(comment.documentId)}
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                            title="Elimina"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-700">{comment.content}</p>
                            </div>
                        ))}

                        {comments.length === 0 && (
                            <div className="text-center text-gray-400 italic py-4">
                                Non ci sono ancora commenti. Sii il primo a contribuire!
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <CommentBox documentId={documentId} onCommentPosted={fetchComments} />
                    </div>
                </div>
            )}
        </div>
    );
}
