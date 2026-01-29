import { getBookById } from "@/lib/api";
import { Book } from "@/types/strapi";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { VolumeCard } from "@/components/catalog/VolumeCard";
import { ProtectScholar } from "@/components/auth/ProtectScholar";

interface VolumePageProps {
    params: Promise<{
        workId: string;
        bookId: string;
        volumeId: string;
    }>;
}

export default async function VolumePage({ params }: VolumePageProps) {
    const { workId, bookId, volumeId } = await params;
    let book: Book | null = null;

    try {
        book = await getBookById(bookId);
    } catch (e) {
        console.error("Error fetching book", e);
    }

    if (!book) {
        notFound();
    }

    const targetVolumeNumber = parseInt(volumeId);
    if (isNaN(targetVolumeNumber)) {
        notFound();
    }

    const verseBlocks = book.verseBlocks || [];

    // Filter blocks for this volume
    const volumeBlocks = verseBlocks.filter(block => block.bookNumber === targetVolumeNumber);

    // Sort blocks by start range
    const sortedBlocks = volumeBlocks.sort((a: any, b: any) => {
        const startA = parseInt(a.sectionRangeStart) || 0;
        const startB = parseInt(b.sectionRangeStart) || 0;
        return startA - startB;
    });

    return (
        <div className="container mx-auto py-12 px-4 md:px-8">
            <Link href={`/catalog/${workId}/book/${bookId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8">
                <ArrowLeft className="w-4 h-4" /> Torna all'opera
            </Link>

            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm mb-12 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold mb-2">{book.title}</h1>
                    <h2 className="text-xl text-gray-500">Volume {targetVolumeNumber === 0 ? "Extra" : targetVolumeNumber}</h2>
                </div>
                <ProtectScholar>
                    <Link
                        href={`/catalog/${workId}/book/${bookId}/new?volume=${targetVolumeNumber}`}
                        className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Nuovo blocco di versi
                    </Link>
                </ProtectScholar>
            </div>

            {sortedBlocks.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                    Nessun blocco di versi trovato per questo volume.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedBlocks.map((block: any) => (
                        <VolumeCard
                            key={block.documentId}
                            workId={workId}
                            bookId={bookId}
                            block={block}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
