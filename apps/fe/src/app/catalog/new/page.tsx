"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken } from "@/lib/auth";
import { getAuthors } from "@/lib/api";
import { BookPlus, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { StrapiUser } from "@/types/strapi";

export default function NewCatalogPage() {
    const router = useRouter();
    const [user, setUser] = useState<StrapiUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    // Form
    const [title, setTitle] = useState("");
    const [subTitle, setSubTitle] = useState("");
    const [isbn, setIsbn] = useState("");

    // New Fields
    const [projectDescription, setProjectDescription] = useState("");
    const [editorialDeclaration, setEditorialDeclaration] = useState("");

    // Authors
    const [availableAuthors, setAvailableAuthors] = useState<any[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);

    useEffect(() => {
        const userData = getUser();
        if (!userData) {
            router.push("/login");
            return;
        }
        const isScholar = userData.role?.name === "Scholar" || userData.role?.type === "scholar";
        if (!isScholar) {
            router.push("/catalog");
            return;
        }
        setUser(userData);

        // Fetch authors
        getAuthors().then(authors => {
            setAvailableAuthors(authors);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to fetch authors", err);
            setLoading(false);
        });

    }, [router]);

    const handleAuthorToggle = (authorId: string) => {
        setSelectedAuthors(prev => {
            if (prev.includes(authorId)) {
                return prev.filter(id => id !== authorId);
            } else {
                return [...prev, authorId];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        try {
            const token = getToken();
            if (!token) throw new Error("Non autenticato");

            const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/catalogs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: {
                        title,
                        subTitle,
                        isbn,
                        projectDescription,
                        editorialDeclaration,
                        authors: selectedAuthors,
                        // Defaults
                        encodingMethod: "double-end-point"
                    }
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error?.message || "Errore creazione opera");
            }

            setMessage("Opera creata con successo!");
            setTimeout(() => router.push("/catalog"), 1500);

        } catch (err: any) {
            setMessage(`Errore: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center bg-euripides-bg min-h-screen">Caricamento...</div>;

    return (
        <div className="container mx-auto py-12 px-4 md:px-8 max-w-2xl">
            <Link href="/catalog" className="flex items-center gap-2 text-gray-500 hover:text-black mb-6">
                <ArrowLeft className="w-4 h-4" /> Torna al Catalogo
            </Link>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <h1 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                    <BookPlus className="w-6 h-6" /> Nuova Opera
                </h1>

                {message && (
                    <div className={`p-4 rounded mb-6 ${message.includes("Errore") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titolo Opera *</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            placeholder="Es. Tebaide, Achilleide..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sottotitolo</label>
                        <input
                            type="text"
                            value={subTitle}
                            onChange={(e) => setSubTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            placeholder="Es. Edizione Critica 2025"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ISBN / Identificativo</label>
                        <input
                            type="text"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Autori</label>
                        <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                            {availableAuthors.length === 0 ? (
                                <p className="text-sm text-gray-500">Nessun autore disponibile.</p>
                            ) : (
                                availableAuthors.map(author => (
                                    <label key={author.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedAuthors.includes(String(author.id)) || selectedAuthors.includes(author.id)}
                                            onChange={() => handleAuthorToggle(author.id)}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span>{author.lastName} {author.firstName}</span>
                                    </label>
                                ))
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Seleziona uno o più autori.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione del Progetto</label>
                        <textarea
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dichiarazione Editoriale</label>
                        <textarea
                            value={editorialDeclaration}
                            onChange={(e) => setEditorialDeclaration(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            rows={3}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-purple-600 text-white py-3 rounded-md font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? "Creazione..." : <><Save className="w-5 h-5" /> Crea Opera</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
