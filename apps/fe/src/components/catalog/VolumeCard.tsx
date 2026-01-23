"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { ProtectScholar } from "@/components/auth/ProtectScholar";
import { useRouter } from "next/navigation";

interface VolumeCardProps {
    workId: string;
    bookId: string;
    block: {
        documentId: string;
        bookNumber?: number;
        verseBlockName?: string;
        title?: string;
        id: number;
        summary?: string;
        sectionRangeStart?: string;
        sectionRangeEnd?: string;
    };
}

export function VolumeCard({ workId, bookId, block }: VolumeCardProps) {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/catalog/${workId}/book/${bookId}/${block.documentId}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group bg-white p-6 rounded-lg border border-gray-200 hover:border-euripides-accent transition-colors hover:shadow-sm cursor-pointer relative"
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-8 h-8 text-gray-300 group-hover:text-euripides-accent transition-colors" />
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 group-hover:bg-euripides-accent/10 group-hover:text-euripides-accent transition-colors">Volume</span>
                </div>
                <ProtectScholar>
                    <Link
                        href={`/catalog/${workId}/book/${bookId}/${block.documentId}/edit`}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600 font-medium z-10"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        Modifica
                    </Link>
                </ProtectScholar>
            </div>
            <h4 className="font-bold text-lg mb-2 group-hover:text-euripides-accent transition-colors">
                {block.verseBlockName || block.title || `Volume ${block.bookNumber || block.id}`}
            </h4>
            <p className="text-sm text-gray-500 line-clamp-3">
                {block.summary || "Nessun sommario disponibile."}
            </p>
        </div>
    );
}
