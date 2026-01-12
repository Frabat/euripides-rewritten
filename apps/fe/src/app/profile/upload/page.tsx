"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken } from "@/lib/auth";
import { Upload, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StrapiUser } from "@/types/strapi";

export default function ScholarUploadPage() {
    const router = useRouter();
    const [user, setUser] = useState<StrapiUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const userData = getUser();
        if (!userData) {
            router.push("/login");
            return;
        }
        // Strict Role Check - Client Side (Backend should also enforce)
        const isScholar = userData.role?.name === "Scholar" || userData.role?.type === "scholar";
        if (!isScholar) {
            router.push("/profile"); // Redirect unauthorized
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
            // Note: This assumes we are creating a 'Document'. Adjust endpoint if 'Catalog' needed.
            // For simplicity, we are creating a draft Document.
            const docRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/documents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: {
                        summary: summary,
                        // We might need to associate it with a Catalog/Work, but let's keep it simple
                        xmlFile: fileId,
                        // Add other required fields if any (e.g. bookNumber defaults?)
                    }
                })
            });

            if (!docRes.ok) throw new Error("Errore durante la creazione del documento");

            setMessage("Caricamento completato con successo!");
            // Reset form
            setTitle("");
            setSummary("");
            setFile(null);

        } catch (err: any) {
            console.error(err);
            setMessage(`Errore: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Verifica permessi...</div>;

    return (
        <div className="container mx-auto py-12 px-4 md:px-8 max-w-2xl">
            <Link href="/profile" className="flex items-center gap-2 text-gray-500 hover:text-black mb-6">
                <ArrowLeft className="w-4 h-4" /> Torna al Profilo
            </Link>

            <h1 className="text-3xl font-serif font-bold mb-2">Carica Contributo</h1>
            <p className="text-gray-600 mb-8">Area riservata agli studiosi per il caricamento di nuove edizioni XML o revisioni.</p>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                {message && (
                    <div className={`p-4 rounded mb-6 ${message.includes("Errore") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* We might want a Catalog selection here later */}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titolo / Descrizione (Opzionale)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-euripides-accent focus:border-transparent"
                            placeholder="Es. Nuova revisione Libro V"
                        />
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
