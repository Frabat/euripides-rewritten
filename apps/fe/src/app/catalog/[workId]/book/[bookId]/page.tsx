import { getBookById } from "@/lib/api";
import { toRoman } from "@/lib/utils";
import { Book } from "@/types/strapi";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, BookOpen } from "lucide-react";
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

    // Group blocks by bookNumber for Multi-Volume logic
    const groupedVolumes = verseBlocks.reduce((acc: any, block: any) => {
        const volumeNum = block.bookNumber || 0;
        if (!acc[volumeNum]) acc[volumeNum] = [];
        acc[volumeNum].push(block);
        return acc;
    }, {});

    const sortedVolumeNumbers = Object.keys(groupedVolumes)
        .map(Number)
        .sort((a, b) => a - b);

    return (
        <div className="container mx-auto py-12 px-4 md:px-8">
            <Link href={`/catalog/${workId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8">
                <ArrowLeft className="w-4 h-4" /> Torna alla Tragedia
            </Link>

            {/* Header */}
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm mb-12">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-serif font-bold mb-2">{book.title}</h1>
                        <h2 className="text-xl text-gray-500 mb-4">{book.period}</h2>
                        <div className="text-gray-600">
                            {book.authors && book.authors.length > 0 && (
                                <p>Autori: {book.authors.map(a => a.name).join(", ")}</p>
                            )}
                        </div>
                    </div>
                    <ProtectScholar>
                        <Link
                            href={`/catalog/${workId}/book/${bookId}/new`}
                            className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            {book.isSingleVolume ? "Nuovo Blocco" : "Nuovo Volume"}
                        </Link>
                    </ProtectScholar>
                </div>
            </div>

            {/* Content Area */}
            <div>
                {verseBlocks.length === 0 ? (
                    <div className="bg-gray-50 p-12 rounded-lg text-center text-gray-500">
                        <p className="text-lg mb-4">Nessun contenuto disponibile.</p>
                        <ProtectScholar>
                            <Link
                                href={`/catalog/${workId}/book/${bookId}/new`}
                                className="text-blue-600 hover:underline"
                            >
                                Inizia caricando un nuovo testo
                            </Link>
                        </ProtectScholar>
                    </div>
                ) : (
                    <>
                        {book.isSingleVolume ? (
                            // SINGLE VOLUME VIEW: Show List of Verse Blocks immediately
                            <div>
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <BookOpen className="w-6 h-6" />
                                    Blocchi di Versi
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {verseBlocks.sort((a: any, b: any) => {
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
                        ) : (
                            // MULTI VOLUME VIEW: Show List of Volumes (Links)
                            <div>
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <BookOpen className="w-6 h-6" />
                                    Volumi
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {sortedVolumeNumbers.map((volNum) => (
                                        <Link
                                            key={volNum}
                                            href={`/catalog/${workId}/book/${bookId}/volumes/${volNum}`}
                                            className="group bg-white p-8 rounded-lg border border-gray-200 hover:border-black transition-all hover:shadow-md block text-center"
                                        >
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-black group-hover:text-white transition-colors">
                                                <BookOpen className="w-8 h-8" />
                                            </div>
                                            <h4 className="text-xl font-bold mb-2">Libro {volNum === 0 ? "Extra" : toRoman(volNum)}</h4>
                                            <p className="text-gray-500 text-sm">
                                                {groupedVolumes[volNum]?.length || 0} Blocchi di versi
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
