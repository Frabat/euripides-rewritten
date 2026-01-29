"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getUser, getToken } from "@/lib/auth";
import { getAuthors, getCatalogById, getBookById, updateBook } from "@/lib/api";
import { ArrowLeft, Save, BookOpen } from "lucide-react";
import Link from "next/link";
import { StrapiUser } from "@/types/strapi";
import { ChipAutocomplete } from "@/components/ui/ChipAutocomplete";

export default function EditBookPage() {
    const router = useRouter();
    const params = useParams();
    const workId = params.workId as string;
    const bookId = params.bookId as string;

    const [user, setUser] = useState<StrapiUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [workTitle, setWorkTitle] = useState("");

    // Form
    const [title, setTitle] = useState("");
    const [type, setType] = useState("");
    const [period, setPeriod] = useState("");

    // Changing isSingleVolume after creation might be complex logic-wise (requires creating doc vs structure), 
    // so maybe we disable it or handle it carefully. For now, let's allow editing metadata only.
    // Ideally we should allow switching, but that implies deleting children or creating placeholder docs.
    // Let's stick to simple metadata for now.

    // Languages
    const [originalLanguage, setOriginalLanguage] = useState("");
    const [translationLanguage, setTranslationLanguage] = useState("");

    // Authors
    const [availableAuthors, setAvailableAuthors] = useState<any[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);


    useEffect(() => {
        const userData = getUser();
        if (!userData) {
            router.push("/login");
            return;
        }
        const isScholar = userData.isScholar === true || userData.role?.name === "Scholar" || userData.role?.type === "scholar";
        if (!isScholar) {
            router.push(`/catalog/${workId}`);
            return;
        }
        setUser(userData);

        Promise.all([
            getCatalogById(workId),
            getBookById(bookId),
            getAuthors()
        ]).then(([workData, bookData, authorsData]) => {
            if (workData) setWorkTitle(workData.title);

            // Populate Form
            if (bookData) {
                setTitle(bookData.title || "");
                setType(bookData.type || "");
                setPeriod(bookData.period || "");

                if (bookData.languages) {
                    setOriginalLanguage(bookData.languages.originalLanguage || "");
                    setTranslationLanguage(bookData.languages.translationLanguage || "");
                }

                if (bookData.authors) {
                    setSelectedAuthors(bookData.authors.map((a: any) => String(a.id)));
                }
            }

            setAvailableAuthors(authorsData);
            setLoading(false);
        }).catch(err => {
            console.error("Error loading data", err);
            setMessage("Errore nel caricamento dei dati.");
            setLoading(false);
        });

    }, [workId, bookId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        try {
            const token = getToken();
            if (!token) throw new Error("Non autenticato");

            const dataToUpdate = {
                title,
                type,
                period,
                authors: selectedAuthors,
                languages: {
                    originalLanguage,
                    translationLanguage
                }
            };

            await updateBook(bookId, dataToUpdate, token);

            setMessage("Libro aggiornato con successo!");
            setTimeout(() => router.push(`/catalog/${workId}`), 1500);

        } catch (err: any) {
            console.error(err);
            setMessage(`Errore: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center bg-euripides-bg min-h-screen">Caricamento...</div>;

    return (
        <div className="container mx-auto py-12 px-4 md:px-8 max-w-2xl">
            <Link href={`/catalog/${workId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-6">
                <ArrowLeft className="w-4 h-4" /> Torna alla Tragedia
            </Link>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="mb-6">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{workTitle}</span>
                    <h1 className="text-2xl font-serif font-bold flex items-center gap-2 mt-1">
                        <BookOpen className="w-6 h-6" /> Modifica Libro
                    </h1>
                </div>

                {message && (
                    <div className={`p-4 rounded mb-6 ${message.includes("Errore") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titolo Libro / Opera *</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipologia</label>
                            <input
                                type="text"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo Storico</label>
                            <input
                                type="text"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lingue</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="text"
                                    value={originalLanguage}
                                    onChange={(e) => setOriginalLanguage(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                                    placeholder="Lingua Originale"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    value={translationLanguage}
                                    onChange={(e) => setTranslationLanguage(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                                    placeholder="Lingua Traduzione"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Autore (Edizione/Derivato)</label>
                        <ChipAutocomplete
                            items={availableAuthors.map(a => ({
                                id: String(a.id),
                                label: a.name || "Senza Nome"
                            }))}
                            selectedIds={selectedAuthors}
                            onChange={setSelectedAuthors}
                            placeholder="Cerca autore..."
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-purple-600 text-white py-3 rounded-md font-bold hover:bg-purple-700 transition-colors"
                        >
                            {submitting ? "Salvataggio..." : <><Save className="w-5 h-5 inline mr-2" /> Salva Modifiche</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
