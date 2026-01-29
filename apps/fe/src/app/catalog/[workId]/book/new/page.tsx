"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getUser, getToken } from "@/lib/auth";
import { getAuthors, getCatalogById } from "@/lib/api";
import { ArrowLeft, Save, BookOpen } from "lucide-react";
import Link from "next/link";
import { StrapiUser } from "@/types/strapi";
import { ChipAutocomplete } from "@/components/ui/ChipAutocomplete";

export default function NewBookPage() {
    const router = useRouter();
    const params = useParams();
    const workId = params.workId as string;

    const [user, setUser] = useState<StrapiUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [workTitle, setWorkTitle] = useState("");

    // Form
    const [title, setTitle] = useState("");
    const [type, setType] = useState("");

    const [period, setPeriod] = useState("");
    const [isSingleVolume, setIsSingleVolume] = useState(false); // Toggle Metadata

    // Languages
    const [originalLanguage, setOriginalLanguage] = useState("");
    const [translationLanguage, setTranslationLanguage] = useState("");

    // Authors
    const [availableAuthors, setAvailableAuthors] = useState<any[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);

    // New Author State
    const [showNewAuthorForm, setShowNewAuthorForm] = useState(false);
    const [newAuthorData, setNewAuthorData] = useState({
        name: "",
        isOriginal: true,
        bio: ""
    });

    const [creatingAuthor, setCreatingAuthor] = useState(false);

    // Single Volume XML State
    const [xmlFile, setXmlFile] = useState<File | null>(null);
    const [parsedAuthor, setParsedAuthor] = useState("");
    const [manualAuthor, setManualAuthor] = useState("");

    useEffect(() => {
        const userData = getUser();
        if (!userData) {
            router.push("/login");
            return;
        }
        // Check permissions (Scholars only)
        const isScholar = userData.isScholar === true || userData.role?.name === "Scholar" || userData.role?.type === "scholar";
        if (!isScholar) {
            router.push(`/catalog/${workId}`);
            return;
        }
        setUser(userData);

        // Load Work Info & Authors
        Promise.all([
            getCatalogById(workId),
            getAuthors()
        ]).then(([workData, authorsData]) => {
            if (workData) setWorkTitle(workData.title);
            setAvailableAuthors(authorsData);
            setLoading(false);
        }).catch(err => {
            console.error("Error loading data", err);
            setMessage("Errore nel caricamento dei dati.");
            setLoading(false);
        });

    }, [workId, router]);

    const handleCreateAuthor = async () => {
        if (!newAuthorData.name) {
            setMessage("Errore: Nome autore è obbligatorio.");
            return;
        }
        setCreatingAuthor(true);
        setMessage("");

        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/authors`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ data: { ...newAuthorData } })
            });

            if (!res.ok) throw new Error("Errore creazione autore");
            const { data } = await res.json();

            setAvailableAuthors(prev => [...prev, data]);
            setSelectedAuthors(prev => [...prev, String(data.id)]); // Auto select

            setNewAuthorData({ name: "", isOriginal: true, bio: "" });
            setShowNewAuthorForm(false);
            setMessage("Autore aggiunto!");
        } catch (err) {
            console.error(err);
            setMessage("Errore creazione autore.");
        } finally {
            setCreatingAuthor(false);
        }
    };

    // Copied from NewVerseBlockPage: XML Parsing for Single Volume
    const parseXmlForAuthor = async (file: File) => {
        try {
            const text = await file.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");

            let author = "";
            const editors = xmlDoc.getElementsByTagName("editor");
            if (editors.length > 0) {
                author = editors[0].textContent || "";
            } else {
                const respStmts = xmlDoc.getElementsByTagName("respStmt");
                if (respStmts.length > 0) {
                    const names = respStmts[0].getElementsByTagName("name");
                    if (names.length > 0) author = names[0].textContent || "";
                }
            }

            if (author) {
                setParsedAuthor(author.trim());
                setMessage(`Autore critico rilevato: ${author.trim()}`);
            }
        } catch (e) {
            console.error("XML Parsing Error", e);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setXmlFile(file);
            parseXmlForAuthor(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        try {
            const token = getToken();
            if (!token) throw new Error("Non autenticato");

            // 1. Create Book
            const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/books`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: {
                        title,
                        type,
                        period,
                        work: workId,
                        authors: selectedAuthors,
                        isSingleVolume, // New field
                        languages: {
                            originalLanguage,
                            translationLanguage
                        }
                    }
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error?.message || "Errore creazione libro");
            }

            const bookData = await res.json();
            const createdBookId = bookData.data.id;

            // 2. If Single Volume, Upload XML and Create Document AUTOMATICALLY
            if (isSingleVolume && xmlFile) {
                // Upload File
                const formData = new FormData();
                formData.append("files", xmlFile);

                const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });

                if (!uploadRes.ok) throw new Error("Libro creato, ma errore caricamento XML");
                const uploadData = await uploadRes.json();
                const fileId = uploadData[0].id;

                // Create Document
                const finalAuthor = parsedAuthor || manualAuthor;
                await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/documents`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        data: {
                            book: createdBookId,
                            // Use defaults for single volume
                            sectionRangeStart: "1",
                            sectionRangeEnd: "End",
                            xmlFile: fileId,
                            criticalEditionAuthor: finalAuthor,
                            verseBlockName: "Testo Completo",
                        }
                    })
                });
            }

            setMessage("Libro creato con successo!");
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
                <ArrowLeft className="w-4 h-4" /> Torna all'Opera
            </Link>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="mb-6">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{workTitle}</span>
                    <h1 className="text-2xl font-serif font-bold flex items-center gap-2 mt-1">
                        <BookOpen className="w-6 h-6" /> Nuova Opera
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
                            placeholder="Es. Libro I, Tebaide di Stazio, Medea..."
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
                                placeholder="Es. Poema Epico, Tragedia..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo Storico</label>
                            <input
                                type="text"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                                placeholder="Es. I secolo d.C."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipologia Volume</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setIsSingleVolume(false)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${!isSingleVolume
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                            >
                                Multi-Volume (Raccolta)
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsSingleVolume(true)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${isSingleVolume
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                            >
                                Volume Singolo (Testo Diretto)
                            </button>
                        </div>
                        {isSingleVolume && (
                            <p className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                                In modalità Volume Singolo, caricherai direttamente il file XML e il libro sarà leggibile immediatamente.
                            </p>
                        )}
                    </div>

                    {isSingleVolume && (
                        <div className="space-y-4 border-l-4 border-black pl-4 py-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">File XML (TEI) *</label>
                                <input
                                    type="file"
                                    accept=".xml"
                                    required={isSingleVolume}
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 border border-blue-200 bg-blue-50 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Autore Edizione Critica</label>
                                <input
                                    type="text"
                                    value={manualAuthor || parsedAuthor}
                                    onChange={(e) => setManualAuthor(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder={parsedAuthor ? "Rilevato automaticamente" : "Inserisci manualmente"}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lingue</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="text"
                                    value={originalLanguage}
                                    onChange={(e) => setOriginalLanguage(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                                    placeholder="Lingua Originale *"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    value={translationLanguage}
                                    onChange={(e) => setTranslationLanguage(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                                    placeholder="Lingua Traduzione (facoltativo)"
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
                        <div className="mt-2 text-right">
                            <button
                                type="button"
                                onClick={() => setShowNewAuthorForm(!showNewAuthorForm)}
                                className="text-xs font-bold text-purple-600 hover:text-purple-800"
                            >
                                {showNewAuthorForm ? "Annulla" : "+ Nuovo Autore"}
                            </button>
                        </div>

                        {showNewAuthorForm && (
                            <div className="border p-4 rounded bg-gray-50 mt-2 space-y-3">
                                <input
                                    type="text"
                                    placeholder="Nome Completo *"
                                    className="border p-2 rounded text-sm w-full"
                                    value={newAuthorData.name}
                                    onChange={e => setNewAuthorData({ ...newAuthorData, name: e.target.value })}
                                />
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="bookIsOriginal"
                                        checked={newAuthorData.isOriginal}
                                        onChange={e => setNewAuthorData({ ...newAuthorData, isOriginal: e.target.checked })}
                                    />
                                    <label htmlFor="bookIsOriginal" className="text-sm">Autore Originale</label>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCreateAuthor}
                                    disabled={creatingAuthor}
                                    className="bg-black text-white px-3 py-1 rounded text-sm w-full"
                                >
                                    {creatingAuthor ? "..." : "Salva Autore"}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-purple-600 text-white py-3 rounded-md font-bold hover:bg-purple-700 transition-colors"
                        >
                            {submitting ? "Creazione..." : <><Save className="w-5 h-5 inline mr-2" /> Crea Opera</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
