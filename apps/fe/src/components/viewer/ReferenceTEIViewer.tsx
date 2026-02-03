"use client";

import { useEffect, useState } from "react";
import { parseTEI, ParsedTEI } from "@/lib/tei-parser";
import { ChevronRight, ChevronDown, BookOpen, MessageSquare, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferenceTEIViewerProps {
    xmlContent: string;
}

export function ReferenceTEIViewer({ xmlContent }: ReferenceTEIViewerProps) {
    const [data, setData] = useState<ParsedTEI | null>(null);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [selectedVerseId, setSelectedVerseId] = useState<string | null>(null);

    useEffect(() => {
        if (xmlContent) {
            const parsed = parseTEI(xmlContent);
            setData(parsed);
            if (parsed.sections.length > 0) {
                setActiveSectionId(parsed.sections[0].id);
            }
        }
    }, [xmlContent]);

    if (!data) return <div className="p-8 text-center animate-pulse">Caricamento testo...</div>;

    const activeSection = data.sections.find(s => s.id === activeSectionId);

    return (
        <div className="flex flex-col lg:flex-row gap-8 bg-[#f8f5f2] min-h-screen text-gray-900 font-serif p-4 md:p-8">

            {/* Sidebar: FRAGMENTS Index */}
            <aside className="w-full lg:w-72 shrink-0 h-fit bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-4">
                <div className="p-3 font-bold border-b border-gray-200 bg-gray-50 text-gray-700 uppercase tracking-tight text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Frammenti
                </div>
                <div className="max-h-[calc(100vh-100px)] overflow-y-auto">
                    {data.sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSectionId(section.id)}
                            className={cn(
                                "w-full text-left px-4 py-3 text-sm font-semibold border-b border-gray-100 last:border-0 hover:bg-euripides-bg/20 transition-colors flex justify-between items-center",
                                activeSectionId === section.id
                                    ? "bg-stone-200 border-l-4 border-l-stone-600 pl-3"
                                    : "text-gray-600"
                            )}
                        >
                            {section.label}
                            {activeSectionId === section.id && <ChevronRight className="w-4 h-4 text-stone-600" />}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-6">

                {/* Metadata Header */}
                <div className="bg-transparent mb-2">
                    {data.metadata.title && data.metadata.title !== "Untitled" && (
                        <h1 className="text-3xl font-bold mb-1">{data.metadata.title}</h1>
                    )}
                    <div className="text-sm text-gray-600">
                        {data.metadata.author && data.metadata.author !== "Unknown" && (
                            <span className="block">Autore: <span className="font-semibold text-gray-900">{data.metadata.author}</span></span>
                        )}
                        {data.metadata.editor && data.metadata.editor !== "Unknown" && (
                            <span className="block">Edizione Critica a cura di: <span className="font-semibold text-gray-900">{data.metadata.editor}</span></span>
                        )}
                    </div>
                </div>

                {/* Active Fragment Display */}
                {activeSection && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Source Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-stone-50">
                                <h3 className="font-bold text-lg">{activeSection.label}</h3>
                                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded border border-amber-200">Greco</span>
                            </div>
                            <div className="p-6 space-y-2 leading-relaxed text-lg bg-white min-h-[300px]">
                                {activeSection.verses.map((verse, index, array) => {
                                    const showSpeaker = verse.speaker && (index === 0 || array[index - 1].speaker !== verse.speaker);
                                    return (
                                        <div
                                            key={verse.id}
                                            id={verse.id}
                                            className={cn(
                                                "grid grid-cols-[30px_1fr] gap-2 rounded p-1 -ml-1 pl-1 transition-colors relative",
                                                selectedVerseId === verse.id ? "bg-amber-100" : "hover:bg-amber-50"
                                            )}
                                            onClick={() => setSelectedVerseId(verse.id === selectedVerseId ? null : verse.id)}
                                        >
                                            <span className="font-bold text-sm text-gray-800 tabular-nums pt-1 select-none text-right pr-2">
                                                {verse.n}
                                            </span>
                                            <div>
                                                {showSpeaker && (
                                                    <div className="font-bold text-sm text-euripides-accent mb-1 uppercase tracking-wider">{verse.speaker}</div>
                                                )}
                                                <div dangerouslySetInnerHTML={{ __html: verse.sourceContent }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Translation Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-stone-50">
                                <h3 className="font-bold text-lg">Traduzione</h3>
                                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded border border-amber-200">Italiano</span>
                            </div>
                            <div className="p-6 space-y-2 leading-relaxed text-lg bg-white min-h-[300px]">
                                {activeSection.verses.map((verse, index, array) => {
                                    const showSpeaker = verse.speaker && (index === 0 || array[index - 1].speaker !== verse.speaker);
                                    return (
                                        <div
                                            key={`tr-${verse.id}`}
                                            className={cn(
                                                "grid grid-cols-[30px_1fr] gap-2 rounded p-1 -ml-1 pl-1 transition-colors",
                                                selectedVerseId === verse.id ? "bg-amber-100" : ""
                                            )}
                                        >
                                            <span className="font-bold text-sm text-gray-400 tabular-nums pt-1 select-none text-right pr-2">
                                                {verse.n}
                                            </span>
                                            <div>
                                                {showSpeaker && (
                                                    <div className="font-bold text-sm text-euripides-accent mb-1 uppercase tracking-wider">{verse.speaker}</div>
                                                )}
                                                <div dangerouslySetInnerHTML={{ __html: verse.translationContent || "<span class='text-gray-300 italic'>...</span>" }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                )}
            </div>

            <style jsx global>{`
                .tei-gap { color: #9ca3af; font-style: italic; }
                .tei-supplied { color: #6b7280; }
                .tei-name { color: #be185d; font-weight: 500; }
                .tei-anchor { border-bottom: 2px dotted #ef4444; cursor: help; }
                .tei-w:hover { color: #d97706; }
                hi[rend="italic"] { font-style: italic; }
                hi[rend="bold"] { font-weight: bold; }
            `}</style>
        </div>
    );
}
