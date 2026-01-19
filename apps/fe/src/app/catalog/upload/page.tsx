"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUser, getToken } from "@/lib/auth";
import { Upload, FileText, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { StrapiUser } from "@/types/strapi";

function UploadForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const workId = searchParams.get("workId");

    const [user, setUser] = useState<StrapiUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [summary, setSummary] = useState("");
    const [bookNumber, setBookNumber] = useState<string>("");
    const [sectionRangeStart, setSectionRangeStart] = useState("");
    const [sectionRangeEnd, setSectionRangeEnd] = useState("");

    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const userData = getUser();
        if (!userData) {
            router.push("/login");
            return;
        }
        // Strict Role Check - Client Side
        const isScholar = userData.role?.name === "Scholar" || userData.role?.type === "scholar";
        if (!isScholar) {
            router.push("/profile");
            return;
        }
        setUser(userData);
        setLoading(false);
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setMessage("Seleziona un file XML.");
            return;
        }

        setUploading(true);
        setMessage("");

        try {
            const token = getToken();
            if (!token) throw new Error("Non autenticato");

            // 1. Upload File to Media Library
            const formData = new FormData();
            formData.append("files", file);

            const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!uploadRes.ok) throw new Error("Errore durante il caricamento del file");
            const uploadData = await uploadRes.json();
            const fileId = uploadData[0].id;

            // 2. Create Document Entry
            const payload: any = {
                data: {
                    summary: summary,
                    xmlFile: fileId,
                    bookNumber: bookNumber ? parseInt(bookNumber) : null,
                    sectionRangeStart,
                    sectionRangeEnd,
                }
            };

            // Link to Catalog if workId is present
            if (workId) {
                payload.data.catalog = workId;
            }

            const docRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/documents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!docRes.ok) throw new Error("Errore durante la creazione del documento");

            setMessage("Caricamento completato con successo!");

            // Redirect back to work if possible
            if (workId) {
                setTimeout(() => router.push(`/catalog/${workId}`), 1500);
            } else {
                // Determine where to go if no workId, maybe profile?
                setTimeout(() => router.push("/profile"), 1500);
            }

        } catch (err: any) {
            console.error(err);
            setMessage(`Errore: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center bg-euripides-bg min-h-screen">Verifica permessi...</div>;

    return (
        <div className="container mx-auto py-12 px-4 md:px-8 max-w-2xl">
            <Link href={workId ? `/catalog/${workId}` : "/profile"} className="flex items-center gap-2 text-gray-500 hover:text-black mb-6">
                <ArrowLeft className="w-4 h-4" /> Torna {workId ? "all'Opera" : "al Profilo"}
            </Link>

            <h1 className="text-3xl font-serif font-bold mb-2">Carica Contributo</h1>
            <p className="text-gray-600 mb-8">
                Area riservata agli studiosi per il caricamento di frammenti XML.
                {workId && <span className="block font-medium text-purple-700 mt-1">Stai caricando per l'opera ID: {workId}</span>}
            </p>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                {message && (
                    <div className={`p-4 rounded mb-6 ${message.includes("Errore") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Libro (Numero)</label>
                            <input
                                type="number"
                                value={bookNumber}
                                onChange={(e) => setBookNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                                placeholder="Es. 1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Range Inizio</label>
                            <input
                                type="text"
                                value={sectionRangeStart}
                                onChange={(e) => setSectionRangeStart(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                                placeholder="Es. 100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Range Fine</label>
                            <input
                                type="text"
                                value={sectionRangeEnd}
                                onChange={(e) => setSectionRangeEnd(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                                placeholder="Es. 150"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sommario / Note</label>
                        <textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            rows={4}
                            placeholder="Descrivi brevemente il contenuto..."
                        />
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".xml"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                            <FileText className="w-8 h-8 text-gray-400" />
                            <span className="font-medium text-gray-700">{file ? file.name : "Trascina il file XML qui o clicca per caricare"}</span>
                            <span className="text-xs text-gray-500">Solo formato .xml supportato</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-purple-600 text-white py-3 rounded-md font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {uploading ? "Caricamento in corso..." : (
                            <>
                                <Upload className="w-5 h-5" /> Invia Contributo
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ScholarUploadPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Caricamento...</div>}>
            <UploadForm />
        </Suspense>
    );
}
