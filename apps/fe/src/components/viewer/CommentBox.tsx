"use client";

import { useState, useEffect } from "react";
import { getUser, getToken } from "@/lib/auth";
import { Send, MessageSquare } from "lucide-react";
import Link from "next/link";
import { StrapiUser } from "@/types/strapi";

interface CommentBoxProps {
    documentId: number;
}

export function CommentBox({ documentId }: CommentBoxProps) {
    const [user, setUser] = useState<StrapiUser | null>(null);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        setUser(getUser());
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setLoading(true);
        setMessage("");

        try {
            const token = getToken();
            if (!token) throw new Error("Devi effettuare il login per commentare.");

            // Mock submission - or replace with actual endpoint
            // const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/comments`, { ... });

            // Simulating API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage("Commento inviato con successo (Simulazione).");
            setComment("");
        } catch (err: any) {
            setMessage(`Errore: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-4">Accedi per partecipare alla discussione.</p>
                <Link href="/login" className="inline-block bg-black text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors">
                    Accedi
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Lascia un commento
            </h3>

            {message && (
                <div className={`p-3 rounded mb-4 text-sm ${message.includes("Errore") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 font-bold uppercase tracking-wider">
                        <span>{user.username}</span>
                        {user.role?.name === "Scholar" && (
                            <span className="bg-purple-100 text-purple-700 px-1 rounded">Scholar</span>
                        )}
                    </div>
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent resize-y min-h-[100px]"
                        placeholder="Scrivi le tue osservazioni..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !comment.trim()}
                        className="bg-euripides-accent text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? "Invio..." : <><Send className="w-4 h-4" /> Pubblica</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
