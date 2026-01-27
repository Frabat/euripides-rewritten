"use client";

import { useState } from "react";
import { VolumeCard } from "@/components/catalog/VolumeCard";
import { ArrowLeft, Book as BookIcon } from "lucide-react";
import { Document } from "@/types/strapi";

interface BookStructureViewerProps {
    workId: string;
    bookId: string;
    verseBlocks: Document[];
}

export function BookStructureViewer({ workId, bookId, verseBlocks }: BookStructureViewerProps) {
    const [selectedVolume, setSelectedVolume] = useState<number | null>(null);

    // Group blocks by bookNumber
    const grouped = verseBlocks.reduce((acc: any, block: any) => {
        const volNum = block.bookNumber || 1; // Default to 1 implies "Volume 1" if undefined? Or handle "Unassigned"?
        // Let's treat undefined as a special "Miscellanea" group with ID -1
        const key = block.bookNumber !== undefined && block.bookNumber !== null ? block.bookNumber : -1;

        if (!acc[key]) acc[key] = [];
        acc[key].push(block);
        return acc;
    }, {});

    const volumeKeys = Object.keys(grouped).map(Number).sort((a, b) => {
        if (a === -1) return 1; // Put miscellanea at end
        if (b === -1) return -1;
        return a - b;
    });

    if (selectedVolume !== null) {
        // VIEW: Single Volume Detail (List of Verse Blocks)
        const activeBlocks = grouped[selectedVolume] || [];
        const volumeLabel = selectedVolume === -1 ? "Altri Testi" : `Libro ${toRoman(selectedVolume)}`;

        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <button
                    onClick={() => setSelectedVolume(null)}
                    className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Torna alla lista dei volumi
                </button>

                <div className="mb-8">
                    <h3 className="text-2xl font-serif font-bold">{volumeLabel}</h3>
                    <p className="text-gray-500 text-sm mt-1">{activeBlocks.length} sezioni disponibili</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeBlocks.sort((a: Document, b: Document) => {
                        const startA = parseInt(a.sectionRangeStart || "0");
                        const startB = parseInt(b.sectionRangeStart || "0");
                        return startA - startB;
                    }).map((block: Document) => (
                        <VolumeCard
                            key={block.documentId}
                            workId={workId}
                            bookId={bookId}
                            block={block as any}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // VIEW: Volume Selection Grid
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {volumeKeys.map((volNum) => {
                const blocks = grouped[volNum];
                const label = volNum === -1 ? "Altri Testi" : `Libro ${toRoman(volNum)}`;

                return (
                    <button
                        key={volNum}
                        onClick={() => setSelectedVolume(volNum)}
                        className="bg-white p-8 rounded-lg border border-gray-200 hover:border-euripides-accent hover:shadow-md transition-all text-left group flex flex-col justify-between h-40"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <BookIcon className="w-8 h-8 text-gray-300 group-hover:text-euripides-accent transition-colors" />
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-euripides-accent transition-colors">
                                    Volume
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-euripides-accent transition-colors">
                                {label}
                            </h3>
                        </div>
                        <div className="text-sm text-gray-500">
                            {blocks.length} {blocks.length === 1 ? 'sezione' : 'sezioni'}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

// Helper for Roman Numerals
function toRoman(num: number): string {
    if (num < 1) return "";
    const roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let str = '';
    for (let i of Object.keys(roman) as (keyof typeof roman)[]) {
        const q = Math.floor(num / roman[i]);
        num -= q * roman[i];
        str += i.repeat(q);
    }
    return str;
}
