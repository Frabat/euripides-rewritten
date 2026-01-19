"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce"; // We might need to create this hook if it doesn't exist
import { getAuthors } from "@/lib/api";

export function CatalogSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial State from URL
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "date_desc");
    const [authorId, setAuthorId] = useState(searchParams.get("authorId") || "all");
    const [language, setLanguage] = useState(searchParams.get("language") || "all");

    // Data State
    const [authors, setAuthors] = useState<any[]>([]);

    const debouncedSearch = useDebounce(search, 500);

    // Fetch Authors on Mount
    useEffect(() => {
        getAuthors().then(setAuthors).catch(console.error);
    }, []);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (debouncedSearch) params.set("search", debouncedSearch);
        else params.delete("search");

        if (sortBy && sortBy !== "date_desc") params.set("sortBy", sortBy);
        else params.delete("sortBy");

        if (authorId && authorId !== "all") params.set("authorId", authorId);
        else params.delete("authorId");

        if (language && language !== "all") params.set("language", language);
        else params.delete("language");

        router.push(`/catalog?${params.toString()}`);
    }, [debouncedSearch, sortBy, authorId, language, router]); // Remove searchParams from dep array to avoid loops if needed, but router.push should be fine.

    return (
        <aside className="w-full md:w-64 shrink-0 space-y-8">
            {/* Search */}
            <div className="bg-white/50 p-4 rounded-lg border border-black/5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Ricerca per titolo o frammento..."
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-euripides-accent"
                    />
                </div>
            </div>

            {/* Order By */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Ordina Per</label>
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full appearance-none bg-white/50 border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-euripides-accent"
                    >
                        <option value="date_desc">Ultima Modifica</option>
                        <option value="title_asc">Titolo (A-Z)</option>
                        <option value="title_desc">Titolo (Z-A)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Authors */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Autori</label>
                <div className="relative">
                    <select
                        value={authorId}
                        onChange={(e) => setAuthorId(e.target.value)}
                        className="w-full appearance-none bg-white/50 border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-euripides-accent"
                    >
                        <option value="all">Tutti gli Autori</option>
                        {authors.map(author => (
                            <option key={author.id} value={author.id}>
                                {author.lastName} {author.firstName}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Languages */}
            <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Lingua Originale</label>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-euripides-accent transition-colors">
                        <input
                            type="radio"
                            name="language"
                            checked={language === "all"}
                            onChange={() => setLanguage("all")}
                            className="text-euripides-accent focus:ring-euripides-accent"
                        />
                        Tutte
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-euripides-accent transition-colors">
                        <input
                            type="radio"
                            name="language"
                            checked={language === "Latino"}
                            onChange={() => setLanguage("Latino")}
                            className="text-euripides-accent focus:ring-euripides-accent"
                        />
                        Latino
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-euripides-accent transition-colors">
                        <input
                            type="radio"
                            name="language"
                            checked={language === "Greco"}
                            onChange={() => setLanguage("Greco")}
                            className="text-euripides-accent focus:ring-euripides-accent"
                        />
                        Greco
                    </label>
                </div>
            </div>
        </aside>
    );
}
