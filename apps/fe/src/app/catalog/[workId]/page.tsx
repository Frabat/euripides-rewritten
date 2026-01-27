import { getCatalogById } from "@/lib/api";
import { Catalog } from "@/types/strapi";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileText, Upload } from "lucide-react";
import { ProtectScholar } from "@/components/auth/ProtectScholar";

interface CatalogDetailPageProps {
    params: Promise<{
        workId: string;
    }>;
}

export default async function CatalogDetailPage({ params }: CatalogDetailPageProps) {
    const { workId } = await params;
    let work: Catalog | null = null;

    try {
        work = await getCatalogById(workId);
    } catch (e) {
        console.error("Error fetching catalog", e);
    }

    if (!work) {
        notFound();
    }

    const authors = work.authors?.map(a => a.name).join(", ") || "Autore Sconosciuto";

    return (
        <div className="container mx-auto py-12 px-4 md:px-8">
            <Link href="/catalog" className="flex items-center gap-2 text-gray-500 hover:text-black mb-8">
                <ArrowLeft className="w-4 h-4" /> Torna al Catalogo
            </Link>

            {/* Header */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm mb-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-32 h-40 bg-gray-200 rounded-md shrink-0 flex items-center justify-center text-gray-400">
                        {/* Placeholder for Cover */}
                        <BookOpen className="w-12 h-12" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-serif font-bold mb-2">{work.title}</h1>
                        <h2 className="text-xl text-gray-500 mb-4">{work.subTitle}</h2>

                        <div className="space-y-1 text-gray-700">
                            <p><span className="font-bold">Autore:</span> {authors}</p>
                            <p><span className="font-bold">Lingua:</span> {work.languages?.originalLanguage || "Non specificata"}</p>
                        </div>

                        {/* Description */}
                        {/* We can render rich text here later if needed */}
                    </div>
                </div>

                {/* Reference Text Button */}
                <div className="mt-6 flex flex-wrap gap-4">
                    {work.reference_text && work.reference_text.url && (
                        <Link
                            href={`/catalog/${workId}/reference`}
                            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md font-medium text-sm border border-gray-300 hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            Leggi Testo di Riferimento (XML)
                        </Link>
                    )}
                </div>
            </div>

            {/* Fragments / Documents List */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold font-serif">Libri / Edizioni</h3>
                    <ProtectScholar>
                        <Link
                            href={`/catalog/${workId}/book/new`}
                            className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <BookOpen className="w-4 h-4" />
                            Nuovo Libro
                        </Link>
                    </ProtectScholar>
                </div>
            </div>

            {!work.books || work.books.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                    Nessun libro collegato a questa opera per il momento.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {work.books.map((book: any) => (
                        <Link
                            key={book.documentId}
                            href={`/catalog/${workId}/book/${book.documentId}`}
                            className="block group bg-white p-6 rounded-lg border border-gray-200 hover:border-euripides-accent transition-colors hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <BookOpen className="w-8 h-8 text-gray-300 group-hover:text-euripides-accent transition-colors" />
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 group-hover:bg-euripides-accent/10 group-hover:text-euripides-accent transition-colors">Libro</span>
                            </div>
                            <h4 className="font-bold text-lg mb-2 group-hover:text-euripides-accent transition-colors">
                                {book.title}
                            </h4>
                            <p className="text-sm text-gray-500 line-clamp-3">
                                {book.period || "Nessun periodo specificato"}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
