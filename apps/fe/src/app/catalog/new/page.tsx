"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken } from "@/lib/auth";
import { getAuthors } from "@/lib/api";
import { BookPlus, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { StrapiUser } from "@/types/strapi";
import { ChipAutocomplete, AutocompleteItem } from "@/components/ui/ChipAutocomplete";

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

    // New Author Form State
    const [showNewAuthorForm, setShowNewAuthorForm] = useState(false);
    const [newAuthorData, setNewAuthorData] = useState({
        firstName: "",
        lastName: "",
        type: "original",
        bio: "",
        dateOfBirth: "",
        placeOfBirth: ""
    });
    const [creatingAuthor, setCreatingAuthor] = useState(false);

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

    const handleCreateAuthor = async () => {
        if (!newAuthorData.firstName || !newAuthorData.lastName) {
            setMessage("Errore: Nome e Cognome autore sono obbligatori.");
            return;
        }

        setCreatingAuthor(true);
        setMessage("");

        try {
            const token = getToken();
            // Convert DD/MM/YYYY to YYYY-MM-DD for Strapi
            const formatDateForApi = (dateStr: string) => {
                if (!dateStr) return null;
                // Simple check for DD/MM/YYYY
                const parts = dateStr.split("/");
                if (parts.length === 3) {
                    const [day, month, year] = parts;
                    return `${year}-${month}-${day}`;
                }
                return null; // or throw error if strictly parsing
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/authors`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: {
                        ...newAuthorData,
                        dateOfBirth: formatDateForApi(newAuthorData.dateOfBirth)
                    }
                })
            });

            if (!res.ok) throw new Error("Errore creazione autore");

            const { data } = await res.json();

            // Add to list and select
            setAvailableAuthors(prev => [...prev, data]);
            setSelectedAuthors(prev => [...prev, String(data.id)]); // Auto select

            // Reset form
            setNewAuthorData({
                firstName: "",
                lastName: "",
                type: "original",
                bio: "",
                dateOfBirth: "",
                placeOfBirth: ""
            });
            setShowNewAuthorForm(false);
            setMessage("Autore aggiunto con successo!");

        } catch (err) {
            console.error(err);
            setMessage("Impossibile creare l'autore. Controlla i permessi.");
        } finally {
            setCreatingAuthor(false);
        }
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

                        <div className="mb-4">
                            <ChipAutocomplete
                                items={availableAuthors.map(a => ({
                                    id: String(a.id),
                                    label: `${a.lastName} ${a.firstName}`
                                }))}
                                selectedIds={selectedAuthors}
                                onChange={setSelectedAuthors}
                                placeholder="Cerca autore per nome..."
                            />
                        </div>

                        {/* Create Author Toggle */}
                        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                            <button
                                type="button"
                                onClick={() => setShowNewAuthorForm(!showNewAuthorForm)}
                                className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 mb-2"
                            >
                                {showNewAuthorForm ? "- Annulla Creazione Autore" : "+ Crea Nuovo Autore"}
                            </button>

                            {showNewAuthorForm && (
                                <div className="space-y-3 mt-2 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Nome *"
                                            className="border p-2 rounded text-sm"
                                            value={newAuthorData.firstName}
                                            onChange={e => setNewAuthorData({ ...newAuthorData, firstName: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Cognome *"
                                            className="border p-2 rounded text-sm"
                                            value={newAuthorData.lastName}
                                            onChange={e => setNewAuthorData({ ...newAuthorData, lastName: e.target.value })}
                                        />
                                    </div>
                                    <select
                                        className="border p-2 rounded text-sm w-full"
                                        value={newAuthorData.type}
                                        onChange={e => setNewAuthorData({ ...newAuthorData, type: e.target.value })}
                                    >
                                        <option value="original">Originale (Antico)</option>
                                        <option value="scholar">Studioso (Moderno)</option>
                                    </select>
                                    <textarea
                                        placeholder="Breve Biografia (opzionale)"
                                        className="border p-2 rounded text-sm w-full"
                                        rows={2}
                                        value={newAuthorData.bio}
                                        onChange={e => setNewAuthorData({ ...newAuthorData, bio: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Data di Nascita (GG/MM/AAAA)"
                                            className="border p-2 rounded text-sm"
                                            value={newAuthorData.dateOfBirth}
                                            onChange={e => setNewAuthorData({ ...newAuthorData, dateOfBirth: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Luogo di Nascita"
                                            className="border p-2 rounded text-sm"
                                            value={newAuthorData.placeOfBirth}
                                            onChange={e => setNewAuthorData({ ...newAuthorData, placeOfBirth: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCreateAuthor}
                                        disabled={creatingAuthor}
                                        className="bg-gray-900 text-white text-sm px-3 py-2 rounded hover:bg-black w-full"
                                    >
                                        {creatingAuthor ? "Salvataggio..." : "Salva Autore e Seleziona"}
                                    </button>
                                </div>
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
