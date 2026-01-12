import { WorkCard, WorkCardProps } from "@/components/catalog/WorkCard";
import { Search, ChevronDown } from "lucide-react";
import { getCatalogs } from "@/lib/api";
import { Catalog } from "@/types/strapi";

export default async function CatalogPage() {
    const catalogs: Catalog[] = await getCatalogs();

    return (
        <div className="container mx-auto py-12 px-4 md:px-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 shrink-0 space-y-8">
                    {/* Search */}
                    <div className="bg-white/50 p-4 rounded-lg border border-black/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Ricerca per titolo..."
                                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-euripides-accent"
                            />
                        </div>
                    </div>

                    {/* Order By */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Ordina Per</label>
                        <div className="relative">
                            <select className="w-full appearance-none bg-white/50 border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-euripides-accent">
                                <option>Data Ultima Modifica</option>
                                <option>Titolo (A-Z)</option>
                                <option>Titolo (Z-A)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Authors */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Autori</label>
                        <div className="relative">
                            <select className="w-full appearance-none bg-white/50 border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-euripides-accent">
                                <option>Seleziona</option>
                                <option>Publio Papinio Stazio</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Genres */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Genere</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-euripides-accent transition-colors">
                                <input type="checkbox" className="rounded border-gray-300 text-euripides-accent focus:ring-euripides-accent" />
                                Prosa
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-euripides-accent transition-colors">
                                <input type="checkbox" className="rounded border-gray-300 text-euripides-accent focus:ring-euripides-accent" />
                                Poesia
                            </label>
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Lingua Originale</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-euripides-accent transition-colors">
                                <input type="checkbox" className="rounded border-gray-300 text-euripides-accent focus:ring-euripides-accent" />
                                Latino
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-euripides-accent transition-colors">
                                <input type="checkbox" className="rounded border-gray-300 text-euripides-accent focus:ring-euripides-accent" />
                                Greco
                            </label>
                        </div>
                    </div>

                </aside>

                {/* Main Grid */}
                <div className="flex-1">
                    <h1 className="text-3xl font-serif font-bold mb-8">Risultati: {catalogs.length}</h1>

                    {catalogs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 bg-white/50 rounded-lg">Coming soon... (o controlla che Strapi sia attivo)</div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {catalogs.map((work) => {
                                // Formatting data
                                const authors = work.authors?.map(a => `${a.firstName} ${a.lastName}`).join(", ") || "Autore Sconosciuto";
                                const createdDate = new Date(work.createdAt).toLocaleDateString('it-IT');
                                const updatedDate = new Date(work.updatedAt).toLocaleDateString('it-IT');

                                return (
                                    <WorkCard
                                        key={work.documentId}
                                        id={work.documentId}
                                        title={work.title}
                                        author={authors}
                                        editor=""
                                        createdDate={createdDate}
                                        updatedDate={updatedDate}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination Mock - Keep visual for now */}
                    {catalogs.length > 0 && (
                        <div className="flex items-center justify-center gap-2 mt-12">
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-white hover:bg-euripides-accent/20 transition-colors">&lt;</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-euripides-accent text-white font-bold">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-white hover:bg-euripides-accent/20 transition-colors">&gt;</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
