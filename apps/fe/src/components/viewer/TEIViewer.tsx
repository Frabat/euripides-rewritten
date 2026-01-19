"use client";

import { useEffect, useState } from "react";
import { parseTEI, ParsedTEI, parsedVerse } from "@/lib/tei-parser";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TEIViewerProps {
    xmlContent: string;
}

export function TEIViewer({ xmlContent }: TEIViewerProps) {
    const [data, setData] = useState<ParsedTEI | null>(null);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [commentaryOpen, setCommentaryOpen] = useState(true);
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

    // Get ALL commentaries for this section, regardless of selection.
    // If a verse is selected, highlight its commentary but show all?
    // Or just show section commentaries in order.
    const sectionCommentaries = activeSection?.verses
        .filter(v => v.hasCommentary)
        .map(v => data.commentary[v.id])
        .filter(Boolean);

    const activeCommentary = selectedVerseId && data.commentary[selectedVerseId];

    return (
        <div className="flex flex-col lg:flex-row gap-8 bg-[#f8f5f2] min-h-screen text-gray-900 font-serif p-4 md:p-8">

            {/* Sidebar: INDEX */}
            <aside className="w-full lg:w-64 shrink-0 h-fit bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-4">
                <div className="p-3 font-bold border-b border-gray-200 bg-gray-50 text-gray-700 uppercase tracking-tight text-sm">Indice</div>
                <div className="flex flex-col max-h-[calc(100vh-100px)] overflow-y-auto">
                    {data.sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSectionId(section.id)}
                            className={cn(
                                "text-left px-4 py-3 text-sm font-semibold border-b border-gray-100 last:border-0 hover:bg-euripides-bg/20 transition-colors flex justify-between items-center",
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
                    <h1 className="text-3xl font-bold mb-1">{data.metadata.title}</h1>
                    <div className="text-sm text-gray-600">
                        <span className="block">Autore: <span className="font-semibold text-gray-900">{data.metadata.author}</span></span>
                        <span className="block">Edizione Critica a cura di: <span className="font-semibold text-gray-900">{data.metadata.editor}</span></span>
                        <span className="block text-xs mt-1 text-gray-500">{data.metadata.publicationDate}</span>
                    </div>
                </div>

                {/* Section Header */}
                {activeSection && (
                    <div className="bg-white rounded-lg px-6 py-4 shadow-sm border border-gray-200 flex items-center justify-center relative">
                        <h2 className="text-xl font-bold text-center w-full">
                            {activeSection.label.replace(/^vv\.\s*/, "")}
                        </h2>
                    </div>
                )}

                {/* Parallel View Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Source Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-stone-50">
                            <h3 className="font-bold text-lg">Originale</h3>
                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded border border-amber-200">Latino</span>
                        </div>
                        <div className="p-6 space-y-2 leading-relaxed text-lg bg-white min-h-[300px]">
                            {activeSection?.verses.map(verse => (
                                <div
                                    key={verse.id}
                                    className={cn(
                                        "grid grid-cols-[30px_1fr] gap-2 hover:bg-amber-50 cursor-pointer rounded p-1 -ml-1 pl-1 transition-colors relative",
                                        selectedVerseId === verse.id ? "bg-amber-100" : ""
                                    )}
                                    onClick={() => {
                                        setSelectedVerseId(verse.id === selectedVerseId ? null : verse.id);
                                        setCommentaryOpen(true);
                                    }}
                                >
                                    <span className="font-bold text-sm text-gray-800 tabular-nums pt-1 select-none">{verse.n}</span>
                                    <div dangerouslySetInnerHTML={{ __html: verse.sourceContent }} />
                                    {verse.hasCommentary && <div className="absolute right-0 top-2 w-1.5 h-1.5 bg-blue-400 rounded-full" title="Commento disponibile" />}
                                    {verse.hasApparatus && <div className="absolute right-0 top-4 w-1.5 h-1.5 bg-red-400 rounded-full" title="Varianti nell'apparato" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Translation Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-stone-50">
                            <h3 className="font-bold text-lg">Traduzione</h3>
                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded border border-amber-200">Italiano</span>
                        </div>
                        <div className="p-6 space-y-2 leading-relaxed text-lg bg-white min-h-[300px]">
                            {activeSection?.verses.map(verse => (
                                <div
                                    key={`tr-${verse.id}`}
                                    className={cn(
                                        "grid grid-cols-[30px_1fr] gap-2 rounded p-1 -ml-1 pl-1 transition-colors",
                                        selectedVerseId === verse.id ? "bg-amber-100" : ""
                                    )}
                                >
                                    <span className="font-bold text-sm text-gray-800 tabular-nums pt-1 select-none">{verse.n}</span>
                                    <div dangerouslySetInnerHTML={{ __html: verse.translationContent || "<span class='text-gray-300 italic'>...</span>" }} />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Commentary Section (Replaces Apparatus Accordion) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 mb-20">
                    <button
                        onClick={() => setCommentaryOpen(!commentaryOpen)}
                        className="w-full p-4 flex justify-between items-center bg-white hover:bg-stone-50 border-b border-gray-100"
                    >
                        <h3 className="font-bold text-lg">Commento</h3>
                        {commentaryOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </button>

                    {commentaryOpen && (
                        <div className="p-6 bg-stone-50/50 min-h-[200px]">
                            <div className="space-y-8">
                                {sectionCommentaries && sectionCommentaries.length > 0 ? (
                                    sectionCommentaries.map((comm) => (
                                        <div
                                            key={comm.id}
                                            className={cn(
                                                "animate-in fade-in p-4 rounded-lg bg-white border border-gray-100 shadow-sm transition-all",
                                                selectedVerseId === comm.target ? "ring-2 ring-euripides-accent border-transparent" : ""
                                            )}
                                            id={`comment-${comm.id}`}
                                        >
                                            <div className="font-bold text-lg mb-2 text-stone-800 border-b border-gray-200 pb-1 flex justify-between">
                                                <span>{comm.title}</span>
                                                {selectedVerseId === comm.target && <span className="text-xs uppercase tracking-wider text-euripides-accent bg-euripides-accent/10 px-2 py-0.5 rounded">Selezionato</span>}
                                            </div>
                                            <div
                                                className="prose prose-stone max-w-none text-gray-700 text-sm leading-6"
                                                dangerouslySetInnerHTML={{ __html: comm.content }}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-400 text-center italic py-4">
                                        Nessun commento disponibile per questa sezione.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            <style jsx global>{`
                .tei-anchor {
                    border-bottom: 2px dotted #ef4444; 
                    cursor: help;
                }
                .tei-w:hover {
                    color: #d97706;
                }
                title[type="sub"] { display: none; }
                ref { color: #d97706; font-weight: 500; cursor: pointer; }
                /* Fix for formatting inside comments */
                hi[rend="bold"] { font-weight: bold; }
                hi[rend="italic"] { font-style: italic; }
            `}</style>
        </div>
    );
}
