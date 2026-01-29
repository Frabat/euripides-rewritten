"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getUser, getToken } from "@/lib/auth";
import { getBookById } from "@/lib/api";
import { ArrowLeft, Save, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { StrapiUser } from "@/types/strapi";

export default function NewVerseBlockPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const workId = params.workId as string;
    const bookId = params.bookId as string;
    const initialVolume = searchParams.get("volume") || "";

    const [user, setUser] = useState<StrapiUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [title, setTitle] = useState(""); // Book Title

    // Form
    const [volumeNumber, setVolumeNumber] = useState(initialVolume);
    const [startVerse, setStartVerse] = useState("");
    const [endVerse, setEndVerse] = useState("");
    const [xmlFile, setXmlFile] = useState<File | null>(null);
    const [parsedAuthor, setParsedAuthor] = useState("");
    const [manualAuthor, setManualAuthor] = useState(""); // Fallback

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

        getBookById(bookId).then(book => {
            if (book) setTitle(book.title);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });

    }, [workId, bookId, router]);

    // Simple XML Parsing Logic
    const parseXmlForAuthor = async (file: File) => {
        try {
            const text = await file.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");

            // Try to find editor in teiHeader
            // Common paths: teiHeader -> fileDesc -> titleStmt -> editor
            // or: teiHeader -> fileDesc -> titleStmt -> respStmt -> name

            let author = "";

            const editors = xmlDoc.getElementsByTagName("editor");
            if (editors.length > 0) {
                author = editors[0].textContent || "";
            } else {
                // Try respStmt
                const respStmts = xmlDoc.getElementsByTagName("respStmt");
                if (respStmts.length > 0) {
                    const names = respStmts[0].getElementsByTagName("name");
                    if (names.length > 0) {
                        author = names[0].textContent || "";
                    }
                }
            }

            if (author) {
                setParsedAuthor(author.trim());
                setMessage(`Autore rilevato dall'XML: ${author.trim()}`);
            } else {
                setMessage("Impossibile rilevare l'autore automaticamente. Inseriscilo manualmente.");
            }

        } catch (e) {
            console.error("XML Parsing Error", e);
            setMessage("Errore durante la lettura del file XML.");
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
        if (!xmlFile) {
            setMessage("Seleziona un file XML.");
            return;
        }

        setSubmitting(true);
        setMessage("");

        try {
            const token = getToken();
            if (!token) throw new Error("Non autenticato");

            // 1. Upload File
            const formData = new FormData();
            formData.append("files", xmlFile);

            const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!uploadRes.ok) throw new Error("Errore caricamento file");
            const uploadData = await uploadRes.json();
            const fileId = uploadData[0].id;

            // 2. Create Document
            const finalAuthor = parsedAuthor || manualAuthor;

            const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/documents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: {
                        book: bookId,
                        bookNumber: volumeNumber ? parseInt(volumeNumber) : undefined,
                        sectionRangeStart: startVerse,
                        sectionRangeEnd: endVerse,
                        xmlFile: fileId,
                        criticalEditionAuthor: finalAuthor,
                        verseBlockName: `Versi ${startVerse}-${endVerse}`,
                        // Optional: Parse summary from XML?
                    }
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error?.message || "Errore creazione volume");
            }

            setMessage("Volume creato con successo!");
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
                <ArrowLeft className="w-4 h-4" /> Torna al Libro
            </Link>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="mb-6">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{title}</span>
                    <h1 className="text-2xl font-serif font-bold flex items-center gap-2 mt-1">
                        <FileText className="w-6 h-6" /> Nuovo Volume
                    </h1>
                </div>

                {message && (
                    <div className={`p-4 rounded mb-6 ${message.includes("Errore") || message.includes("Impossibile") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
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
                                placeholder="Es. 1"
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
                                placeholder="Es. 50"
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
                            placeholder="Es. 1 per Volume I"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File XML (TEI) *</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-euripides-accent transition-colors">
                            <input
                                type="file"
                                accept=".xml"
                                required
                                onChange={handleFileChange}
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Il file verrà analizzato per estrarre l'autore dell'edizione critica.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Autore Edizione Critica</label>
                        <input
                            type="text"
                            value={manualAuthor || parsedAuthor}
                            onChange={(e) => setManualAuthor(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent ${parsedAuthor ? 'bg-green-50 border-green-200 text-green-800' : 'border-gray-300'}`}
                            placeholder={parsedAuthor ? "Rilevato automaticamente" : "Inserisci manualmente se non rilevato"}
                        />
                        {parsedAuthor && <p className="text-xs text-green-600 mt-1">Rilevato automaticamente dal file XML.</p>}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-purple-600 text-white py-3 rounded-md font-bold hover:bg-purple-700 transition-colors"
                        >
                            {submitting ? "Caricamento..." : <><Save className="w-5 h-5 inline mr-2" /> Salva Volume</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
