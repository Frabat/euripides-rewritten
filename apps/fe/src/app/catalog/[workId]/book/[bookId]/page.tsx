import { getBookById } from "@/lib/api";
import { Book } from "@/types/strapi";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Upload } from "lucide-react";
import { ProtectScholar } from "@/components/auth/ProtectScholar";
import { VolumeCard } from "@/components/catalog/VolumeCard";

interface BookDetailPageProps {
    params: Promise<{
        workId: string;
        bookId: string;
    }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
    const { workId, bookId } = await params;
    let book: Book | null = null;

    try {
        book = await getBookById(bookId);
    } catch (e) {
        console.error("Error fetching book", e);
    }

    if (!book) {
        notFound();
    }

    const verseBlocks = book.verseBlocks || [];

    return (
        <div className="container mx-auto py-12 px-4 md:px-8">
            <Link href={`/catalog/${workId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8">
                <ArrowLeft className="w-4 h-4" /> Torna all'Opera
            </Link>

            {/* Header */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm mb-12">
                <h1 className="text-4xl font-serif font-bold mb-2">{book.title}</h1>
                <h2 className="text-xl text-gray-500 mb-4">{book.period}</h2>
                <div className="text-gray-600">
                    {/* Add author info if available/populated */}
                    {book.authors && book.authors.length > 0 && (
                        <p>Autori: {book.authors.map(a => a.name).join(", ")}</p>
                    )}
                </div>
            </div>

            {/* Verse Blocks / Volumes List */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6" />
                        Volumi / Blocchi di Versi
                    </h3>

                    <ProtectScholar>
                        {/* Update upload link logic if needed, passing bookId */}
                        <Link
                            href={`/catalog/${workId}/book/${bookId}/new`}
                            className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Nuovo Volume
                        </Link>
                    </ProtectScholar>
                </div>

                {verseBlocks.length === 0 ? (
                    <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                        Nessun volume presente in questo libro.
                    </div>
                ) : (
                    <div className="space-y-12">
                        {(() => {
                            // Group blocks by bookNumber
                            const grouped = verseBlocks.reduce((acc: any, block: any) => {
                                const key = block.bookNumber ? `Volume ${block.bookNumber}` : "Altri Volumi";
                                if (!acc[key]) acc[key] = [];
                                acc[key].push(block);
                                return acc;
                            }, {});

                            // Sort keys (Volume 1, Volume 2...)
                            const sortedKeys = Object.keys(grouped).sort((a, b) => {
                                const numA = parseInt(a.replace(/\D/g, '')) || 999;
                                const numB = parseInt(b.replace(/\D/g, '')) || 999;
                                return numA - numB;
                            });

                            return sortedKeys.map(groupName => (
                                <div key={groupName}>
                                    <h4 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                                        {groupName}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {grouped[groupName].sort((a: any, b: any) => {
                                            // Sort by verse start
                                            const startA = parseInt(a.sectionRangeStart) || 0;
                                            const startB = parseInt(b.sectionRangeStart) || 0;
                                            return startA - startB;
                                        }).map((block: any) => (
                                            <VolumeCard
                                                key={block.documentId}
                                                workId={workId}
                                                bookId={bookId}
                                                block={block}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}
