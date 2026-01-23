"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getUser, getToken } from "@/lib/auth";
import { getDocumentById, updateDocument, deleteDocument } from "@/lib/api";
import { ArrowLeft, Save, Trash2, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { StrapiUser } from "@/types/strapi";

export default function EditVerseBlockPage() {
    const router = useRouter();
    const params = useParams();
    const workId = params.workId as string;
    const bookId = params.bookId as string;
    const documentId = params.documentId as string;

    const [user, setUser] = useState<StrapiUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState("");

    // Form Data
    const [volumeNumber, setVolumeNumber] = useState("");
    const [startVerse, setStartVerse] = useState("");
    const [endVerse, setEndVerse] = useState("");
    const [criticalEditionAuthor, setCriticalEditionAuthor] = useState("");
    const [xmlFile, setXmlFile] = useState<File | null>(null);
    const [currentFileName, setCurrentFileName] = useState("");

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

        // Fetch Document
        getDocumentById(documentId).then(doc => {
            if (!doc) {
                setMessage("Documento non trovato.");
                return;
            }
            setVolumeNumber(doc.bookNumber ? String(doc.bookNumber) : "");
            setStartVerse(doc.sectionRangeStart || "");
            setEndVerse(doc.sectionRangeEnd || "");
            setCriticalEditionAuthor(doc.criticalEditionAuthor || "");
            if (doc.xmlFile?.name) setCurrentFileName(doc.xmlFile.name);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setMessage("Errore nel caricamento del documento.");
            setLoading(false);
        });

    }, [workId, bookId, documentId, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setXmlFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        try {
            const token = getToken();
            if (!token) throw new Error("Non autenticato");

            let fileId = undefined;

            // 1. Upload New File if selected
            if (xmlFile) {
                const formData = new FormData();
                formData.append("files", xmlFile);

                const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });

                if (!uploadRes.ok) throw new Error("Errore caricamento nuovo file");
                const uploadData = await uploadRes.json();
                fileId = uploadData[0].id;
            }

            // 2. Update Document
            const updateData: any = {
                bookNumber: volumeNumber ? parseInt(volumeNumber) : null,
                sectionRangeStart: startVerse,
                sectionRangeEnd: endVerse,
                criticalEditionAuthor: criticalEditionAuthor,
                verseBlockName: `Versi ${startVerse}-${endVerse}`,
            };

            if (fileId) {
                updateData.xmlFile = fileId;
            }

            await updateDocument(documentId, updateData, token);

            setMessage("Modifiche salvate con successo!");
            setTimeout(() => router.push(`/catalog/${workId}/book/${bookId}`), 1000);

        } catch (err: any) {
            console.error(err);
            setMessage(`Errore: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Sei sicuro di voler eliminare questo volume? L'operazione è irreversibile.")) return;
        setDeleting(true);
        try {
            const token = getToken();
            if (!token) throw new Error("Non autenticato");
            await deleteDocument(documentId, token);
            router.push(`/catalog/${workId}/book/${bookId}`);
        } catch (err: any) {
            console.error(err);
            alert(`Errore eliminazione: ${err.message}`);
            setDeleting(false);
        }
    };

    if (loading) return <div className="p-8 text-center bg-euripides-bg min-h-screen">Caricamento...</div>;

    return (
        <div className="container mx-auto py-12 px-4 md:px-8 max-w-2xl">
            <Link href={`/catalog/${workId}/book/${bookId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-6">
                <ArrowLeft className="w-4 h-4" /> Torna al Libro
            </Link>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Modifica Volume</span>
                        <h1 className="text-2xl font-serif font-bold flex items-center gap-2 mt-1">
                            <FileText className="w-6 h-6" /> Gestisci Versi
                        </h1>
                    </div>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                        title="Elimina Volume"
                    >
                        {deleting ? "..." : <Trash2 className="w-5 h-5" />}
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded mb-6 ${message.includes("Errore") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Verso Inizio *</label>
                            <input
                                type="text"
                                required
                                value={startVerse}
                                onChange={(e) => setStartVerse(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Verso Fine *</label>
                            <input
                                type="text"
                                required
                                value={endVerse}
                                onChange={(e) => setEndVerse(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Numero Volume (Opzionale)</label>
                        <input
                            type="number"
                            value={volumeNumber}
                            onChange={(e) => setVolumeNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            placeholder="Es. 1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File XML (TEI)</label>
                        <div className="border border-gray-300 rounded-md p-4">
                            {currentFileName && (
                                <p className="text-sm text-gray-600 mb-2">File attuale: <strong>{currentFileName}</strong></p>
                            )}
                            <input
                                type="file"
                                accept=".xml"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                            <p className="text-xs text-gray-400 mt-1">Carica un nuovo file per sostituire quello esistente.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Autore Edizione Critica</label>
                        <input
                            type="text"
                            value={criticalEditionAuthor}
                            onChange={(e) => setCriticalEditionAuthor(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-black text-white py-3 rounded-md font-bold hover:bg-gray-800 transition-colors"
                        >
                            {submitting ? "Salvataggio..." : <><Save className="w-5 h-5 inline mr-2" /> Salva Modifiche</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
