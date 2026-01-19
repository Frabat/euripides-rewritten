import { WorkCard, WorkCardProps } from "@/components/catalog/WorkCard";
import { PlusCircle } from "lucide-react";
import { getCatalogs } from "@/lib/api";
import { Catalog } from "@/types/strapi";
import { ProtectScholar } from "@/components/auth/ProtectScholar";
import Link from "next/link";
import { CatalogSidebar } from "@/components/catalog/CatalogSidebar";

interface CatalogPageProps {
    searchParams: Promise<{
        search?: string;
        authorId?: string;
        language?: string;
        sortBy?: string;
    }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
    const params = await searchParams;
    const filters = {
        search: params.search,
        authorId: params.authorId,
        language: params.language,
        sortBy: params.sortBy || "date_desc"
    };

    const catalogs: Catalog[] = await getCatalogs(filters);

    return (
        <div className="container mx-auto py-12 px-4 md:px-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <CatalogSidebar />

                {/* Main Grid */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-serif font-bold">Catalogo</h1>
                            <p className="text-gray-500 mt-1">Risultati: {catalogs.length}</p>
                        </div>

                        <ProtectScholar>
                            <Link
                                href="/catalog/new"
                                className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center gap-2"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Nuova Opera
                            </Link>
                        </ProtectScholar>
                    </div>

                    {catalogs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 bg-white/50 rounded-lg">
                            Nessun risultato trovato. Prova a modificare i filtri.
                        </div>
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
                </div>
            </div>
        </div>
    );
}
