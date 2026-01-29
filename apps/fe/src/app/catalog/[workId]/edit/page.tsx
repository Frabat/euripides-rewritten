"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getUser, getToken } from "@/lib/auth";
import { getAuthors, getCatalogById, updateCatalog } from "@/lib/api";
import { ArrowLeft, Save, Loader } from "lucide-react";
import Link from "next/link";
import { StrapiUser } from "@/types/strapi";
import { ChipAutocomplete } from "@/components/ui/ChipAutocomplete";

export default function EditCatalogPage() {
    const router = useRouter();
    const params = useParams();
    const workId = params.workId as string;

    const [user, setUser] = useState<StrapiUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    // Form
    const [title, setTitle] = useState("");
    const [subTitle, setSubTitle] = useState("");

    // Languages
    const [originalLanguage, setOriginalLanguage] = useState("");
    const [translationLanguage, setTranslationLanguage] = useState("");

    // Metadata
    const [period, setPeriod] = useState("");
    const [isFragmented, setIsFragmented] = useState(false);

    // Reference Text (XML)
    // For edit, we toggle upload new reference if desired?
    const [referenceText, setReferenceText] = useState<File | null>(null);

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
        const isScholar = userData.isScholar === true || userData.role?.name === "Scholar" || userData.role?.type === "scholar";
        if (!isScholar) {
            router.push("/catalog");
            return;
        }
        setUser(userData);

        // Fetch Work Data and Authors
        const fetchData = async () => {
            try {
                const [workData, authorsData] = await Promise.all([
                    getCatalogById(workId),
                    getAuthors()
                ]);

                // Populate Form
                setTitle(workData.title || "");
                setSubTitle(workData.subTitle || "");
                setProjectDescription(workData.projectDescription || "");
                setEditorialDeclaration(workData.editorialDeclaration || "");
                setPeriod(workData.period || "");
                setIsFragmented(workData.isFragmented || false);

                if (workData.languages) {
                    setOriginalLanguage(workData.languages.originalLanguage || "");
                    setTranslationLanguage(workData.languages.translationLanguage || "");
                }

                if (workData.authors) {
                    setSelectedAuthors(workData.authors.map(a => String(a.id)));
                }

                setAvailableAuthors(authorsData);
                setLoading(false);

            } catch (error) {
                console.error("Failed to fetch data", error);
                setMessage("Errore nel caricamento dei dati.");
                setLoading(false);
            }
        };

        fetchData();
    }, [router, workId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        try {
            const token = getToken();
            if (!token) throw new Error("Non autenticato");

            let referenceTextId = null;
            if (referenceText) {
                const formData = new FormData();
                formData.append("files", referenceText);

                const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });

                if (!uploadRes.ok) throw new Error("Errore caricamento nuovo file di riferimento");
                const uploadData = await uploadRes.json();
                referenceTextId = uploadData[0].id; // Keep logic to update ID if new file uploaded
            }

            const dataToUpdate: any = {
                title,
                subTitle,
                projectDescription,
                editorialDeclaration,
                authors: selectedAuthors,
                languages: {
                    originalLanguage,
                    translationLanguage
                },
                period,
                isFragmented,
            };

            if (referenceTextId) {
                dataToUpdate.reference_file = referenceTextId;
            }

            // Using PATCH logic (via updateCatalog which calls PUT/PATCH)
            await updateCatalog(workId, dataToUpdate, token);

            setMessage("Opera aggiornata con successo!");
            setTimeout(() => router.push("/catalog"), 1500); // Redirect to catalog or detail?

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
                    Modifica Progetto
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
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sottotitolo</label>
                        <input
                            type="text"
                            value={subTitle}
                            onChange={(e) => setSubTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                        />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo Storico</label>
                            <input
                                type="text"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipologia Opera</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFragmented(false)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${!isFragmented
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                                >
                                    Opera Completa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsFragmented(true)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${isFragmented
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                                >
                                    Testo Frammentato
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Aggiorna File di Riferimento (TEI XML)</label>
                        <input
                            type="file"
                            accept=".xml"
                            onChange={(e) => setReferenceText(e.target.files ? e.target.files[0] : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Carica un nuovo file solo se desideri sostituire quello attuale.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Autori</label>
                        <ChipAutocomplete
                            items={availableAuthors.map(a => ({
                                id: String(a.id),
                                label: a.name || "Senza Nome"
                            }))}
                            selectedIds={selectedAuthors}
                            onChange={setSelectedAuthors}
                            placeholder="Cerca autore per nome..."
                        />
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
                            {submitting ? "Salvataggio..." : <><Save className="w-5 h-5" /> Salva Modifiche</>}
                        </button>
                    </div>
                </form >
            </div >
        </div >
    );
}
