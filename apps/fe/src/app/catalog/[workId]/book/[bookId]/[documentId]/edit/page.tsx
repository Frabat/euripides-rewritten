"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getUser, getToken } from "@/lib/auth";
import { getCatalogById, getBookById, getDocumentById, updateDocument } from "@/lib/api";
import { ArrowLeft, Save, FileText } from "lucide-react";
import Link from "next/link";
import { StrapiUser } from "@/types/strapi";

export default function EditDocumentPage() {
    const router = useRouter();
    const params = useParams();
    const workId = params.workId as string;
    const bookId = params.bookId as string;
    const documentId = params.documentId as string;

    const [user, setUser] = useState<StrapiUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    // Header Info
    const [bookTitle, setBookTitle] = useState("");

    // Form
    const [bookNumber, setBookNumber] = useState("");
    const [verseBlockName, setVerseBlockName] = useState("");
    const [sectionRangeStart, setSectionRangeStart] = useState("");
    const [sectionRangeEnd, setSectionRangeEnd] = useState("");
    const [summary, setSummary] = useState("");

    // XML File
    const [xmlFile, setXmlFile] = useState<File | null>(null);

    // Metadata
    const [criticalEditionAuthor, setCriticalEditionAuthor] = useState("");
    const [publicationYear, setPublicationYear] = useState("");

    useEffect(() => {
        const userData = getUser();
        if (!userData) {
            router.push("/login");
            return;
        }
        const isScholar = userData.isScholar === true || userData.role?.name === "Scholar" || userData.role?.type === "scholar";
        if (!isScholar) {
            router.push(`/catalog/${workId}/book/${bookId}`);
            return;
        }
        setUser(userData);

        Promise.all([
            getBookById(bookId),
            getDocumentById(documentId)
        ]).then(([bookData, docData]) => {
            if (bookData) setBookTitle(bookData.title);

            if (docData) {
                setBookNumber(docData.bookNumber ? String(docData.bookNumber) : "");
                setVerseBlockName(docData.verseBlockName || "");
                setSectionRangeStart(docData.sectionRangeStart || "");
                setSectionRangeEnd(docData.sectionRangeEnd || "");
                setSummary(docData.summary || "");
                setCriticalEditionAuthor(docData.criticalEditionAuthor || "");
                setPublicationYear(docData.publicationYear ? String(docData.publicationYear) : "");
            }

            setLoading(false);
        }).catch(err => {
            console.error("Error loading data", err);
            setMessage("Errore nel caricamento dei dati.");
            setLoading(false);
        });

    }, [workId, bookId, documentId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        try {
            const token = getToken();
            if (!token) throw new Error("Non autenticato");

            let xmlFileId = null;
            if (xmlFile) {
                const formData = new FormData();
                formData.append("files", xmlFile);

                const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });

                if (!uploadRes.ok) throw new Error("Errore caricamento nuovo XML");
                const uploadData = await uploadRes.json();
                xmlFileId = uploadData[0].id;
            }

            const dataToUpdate: any = {
                bookNumber: parseInt(bookNumber) || 0,
                verseBlockName,
                sectionRangeStart,
                sectionRangeEnd,
                summary,
                criticalEditionAuthor,
                publicationYear: parseInt(publicationYear) || undefined
            };

            if (xmlFileId) {
                dataToUpdate.xmlFile = xmlFileId;
            }

            await updateDocument(documentId, dataToUpdate, token);

            setMessage("Volume / Documento aggiornato con successo!");
            setTimeout(() => router.push(`/catalog/${workId}/book/${bookId}`), 1500);

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
            <Link href={`/catalog/${workId}/book/${bookId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-6">
                <ArrowLeft className="w-4 h-4" /> Torna all'opera
            </Link>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="mb-6">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{bookTitle}</span>
                    <h1 className="text-2xl font-serif font-bold flex items-center gap-2 mt-1">
                        <FileText className="w-6 h-6" /> Modifica Blocco di Versi
                    </h1>
                </div>

                {message && (
                    <div className={`p-4 rounded mb-6 ${message.includes("Errore") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Numero Volume (Libro)</label>
                        <input
                            type="number"
                            required
                            value={bookNumber}
                            onChange={(e) => setBookNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            placeholder="Es. 1 per Libro I"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome identificativo Blocco</label>
                        <input
                            type="text"
                            required
                            value={verseBlockName}
                            onChange={(e) => setVerseBlockName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            placeholder="Es. Versi 1-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Riferimento Versi (Analisa)</label>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={sectionRangeStart}
                                    onChange={(e) => setSectionRangeStart(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Inizio (es. 1)"
                                />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={sectionRangeEnd}
                                    onChange={(e) => setSectionRangeEnd(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Fine (es. 50)"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Aggiorna File XML (Opzionale)</label>
                        <input
                            type="file"
                            accept=".xml"
                            onChange={(e) => setXmlFile(e.target.files ? e.target.files[0] : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-gray-500 mt-1">Carica un nuovo file XML solo se vuoi sostituire il contenuto.</p>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Metadati Edizione Critica</label>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Autore dell'Edizione Critica</label>
                                <input
                                    type="text"
                                    value={criticalEditionAuthor}
                                    onChange={(e) => setCriticalEditionAuthor(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Es. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Anno Pubblicazione</label>
                                <input
                                    type="number"
                                    value={publicationYear}
                                    onChange={(e) => setPublicationYear(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Es. 2024"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sommario / Contenuto</label>
                        <textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            rows={4}
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
