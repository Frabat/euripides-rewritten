import { getCatalogs } from "@/lib/api";
import { Catalog } from "@/types/strapi";
import { WorkCard } from "@/components/catalog/WorkCard";

interface CatalogGridProps {
    filters: {
        search?: string;
        authorId?: string;
        language?: string;
        sortBy?: string;
    };
}

export async function CatalogGrid({ filters }: CatalogGridProps) {
    // This is the "blocking" call, now isolated in a Suspense boundary
    const catalogs: Catalog[] = await getCatalogs(filters);

    if (catalogs.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-white/50 rounded-lg">
                Nessun risultato trovato. Prova a modificare i filtri.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {catalogs.map((work) => {
                const authors = work.authors?.map(a => a.name).join(", ") || "Autore Sconosciuto";
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
    );
}
