import { PlusCircle } from "lucide-react";
import { ProtectScholar } from "@/components/auth/ProtectScholar";
import Link from "next/link";
import { CatalogSidebar } from "@/components/catalog/CatalogSidebar";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CatalogGrid } from "./CatalogGrid";

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
                            {/* We cannot show exact count instantly if loading, or we need to fetch count separately. Removing static count for now or showing generic msg */}
                            <p className="text-gray-500 mt-1">Esplora le opere disponibili</p>
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

                    <Suspense
                        fallback={
                            <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-gray-50 rounded-lg">
                                <LoadingSpinner className="w-10 h-10 text-euripides-accent" />
                                <p className="text-gray-500 animate-pulse">Caricamento catalogo in corso...</p>
                            </div>
                        }
                    >
                        <CatalogGrid filters={filters} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
