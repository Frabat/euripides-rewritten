"use client";

import { useEffect, useState } from "react";
import { parseTEI, ParsedTEI, parsedVerse } from "@/lib/tei-parser";
import { ChevronRight, ChevronDown, ChevronUp, BookOpen, FileText, ChevronLeft, MessageSquare, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TEIViewerProps {
    xmlContent: string;
    bookStructure?: {
        documentId: string;
        title?: string;
        verseBlockName?: string;
        sectionRangeStart?: string;
        xmlFile?: {
            url: string;
        };
    }[];
    workId?: string;
    bookId?: string;
    currentDocumentId?: string;
}

export function TEIViewer({ xmlContent, bookStructure, workId, bookId, currentDocumentId }: TEIViewerProps) {
    const [data, setData] = useState<ParsedTEI | null>(null);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [commentaryOpen, setCommentaryOpen] = useState(true);
    const [selectedVerseId, setSelectedVerseId] = useState<string | null>(null);

    // Sidebar Accordion State
    const [expandedBlockId, setExpandedBlockId] = useState<string | null>(currentDocumentId || null);
    const [parsedBlocks, setParsedBlocks] = useState<Record<string, ParsedTEI>>({});
    const [loadingBlocks, setLoadingBlocks] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (xmlContent) {
            const parsed = parseTEI(xmlContent);
            setData(parsed);
            if (currentDocumentId) {
                setParsedBlocks(prev => ({ ...prev, [currentDocumentId]: parsed }));
                // Ensure current block is expanded and data is set
                if (!expandedBlockId) setExpandedBlockId(currentDocumentId);
            }
            if (parsed.sections.length > 0) {
                // If we don't have an active section yet, set the first one
                setActiveSectionId(prev => prev || parsed.sections[0].id);
            }
        }
    }, [xmlContent, currentDocumentId]);

    const toggleBlock = async (block: any) => {
        if (expandedBlockId === block.documentId) {
            // Optional: Toggle collapse? User request implies staying on same page when opening accordion.
            // If we collapse, we set null.
            // But usually we want to keep one open. Let's allowing collapsing.
            setExpandedBlockId(null);
            return;
        }

        setExpandedBlockId(block.documentId);

        // If data is already cached (or is current document), no need to fetch
        if (parsedBlocks[block.documentId]) return;

        // Fetch and Parse
        if (block.xmlFile?.url) {
            setLoadingBlocks(prev => ({ ...prev, [block.documentId]: true }));
            try {
                // We need to fetch the XML. Since this is client side, we can use fetch directly.
                const url = block.xmlFile.url.startsWith("http")
                    ? block.xmlFile.url
                    : `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}${block.xmlFile.url}`;

                const res = await fetch(url);
                const text = await res.text();
                const parsed = parseTEI(text);
                setParsedBlocks(prev => ({ ...prev, [block.documentId]: parsed }));
            } catch (e) {
                console.error("Error fetching sibling XML", e);
            } finally {
                setLoadingBlocks(prev => ({ ...prev, [block.documentId]: false }));
            }
        }
    };

    const scrollToComment = (verseId: string) => {
        const comment = data?.commentary[verseId];
        if (comment) {
            // Open commentary if closed
            setCommentaryOpen(true);
            setTimeout(() => {
                const element = document.getElementById(`comment-${comment.id}`);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 100);
        }
    };

    const scrollToVerse = (verseId: string) => {
        const element = document.getElementById(verseId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    if (!data) return <div className="p-8 text-center animate-pulse">Caricamento testo...</div>;

    const activeSection = data.sections.find(s => s.id === activeSectionId);

    // Navigation Handlers
    const currentSectionIndex = data.sections.findIndex(s => s.id === activeSectionId);
    const hasPrev = currentSectionIndex > 0;
    const hasNext = currentSectionIndex !== -1 && currentSectionIndex < data.sections.length - 1;

    const handlePrevSection = () => {
        if (hasPrev) {
            setActiveSectionId(data.sections[currentSectionIndex - 1].id);
        }
    };

    const handleNextSection = () => {
        if (hasNext) {
            setActiveSectionId(data.sections[currentSectionIndex + 1].id);
        }
    };

    // Get ALL commentaries for this section, regardless of selection.
    const sectionCommentaries = activeSection?.verses
        .filter(v => v.hasCommentary)
        .map(v => data.commentary[v.id])
        .filter(Boolean);

    return (
        <div className="flex flex-col lg:flex-row gap-8 bg-[#f8f5f2] min-h-screen text-gray-900 font-serif p-4 md:p-8">

            {/* Sidebar: INDEX */}
            <aside className="w-full lg:w-72 shrink-0 h-fit bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-4">
                <div className="p-3 font-bold border-b border-gray-200 bg-gray-50 text-gray-700 uppercase tracking-tight text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Indice del Libro
                </div>
                <div className="flex flex-col max-h-[calc(100vh-100px)] overflow-y-auto">
                    {bookStructure && bookStructure.length > 0 ? (
                        bookStructure.map((block) => {
                            const isExpanded = block.documentId === expandedBlockId;
                            const isCurrentDoc = block.documentId === currentDocumentId;
                            const blockData = parsedBlocks[block.documentId];
                            const isLoading = loadingBlocks[block.documentId];

                            return (
                                <div key={block.documentId} className="border-b border-gray-100 last:border-0">
                                    {/* Block Header (Accordion Trigger) */}
                                    <button
                                        onClick={() => toggleBlock(block)}
                                        className={cn(
                                            "w-full px-4 py-3 text-sm font-bold flex items-center justify-between transition-colors",
                                            isCurrentDoc ? "text-stone-900 bg-stone-50" : "text-gray-600 hover:bg-stone-50 hover:text-stone-900"
                                        )}
                                    >
                                        <span>{block.verseBlockName || block.title || "Documento"}</span>
                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-stone-500" /> : <ChevronRight className="w-4 h-4 text-gray-300" />}
                                    </button>

                                    {/* Expanded Content (Sections List) */}
                                    {isExpanded && (
                                        <div className="pl-4 pb-2 bg-stone-50/50 border-t border-gray-100 inner-shadow-sm transition-all duration-300">
                                            {isLoading && <div className="p-2 text-xs text-gray-400 italic">Caricamento sezioni...</div>}

                                            {blockData && blockData.sections.map((section) => {
                                                const isActiveSection = isCurrentDoc && activeSectionId === section.id;

                                                return (
                                                    <Link
                                                        key={`${block.documentId}-${section.id}`}
                                                        href={isCurrentDoc ? "#" : `/catalog/${workId}/book/${bookId}/${block.documentId}`}
                                                        onClick={(e) => {
                                                            if (isCurrentDoc) {
                                                                e.preventDefault();
                                                                setActiveSectionId(section.id);
                                                            }
                                                            // If not current doc, standard Link navigation will occur.
                                                        }}
                                                        className={cn(
                                                            "block w-full text-left px-4 py-2 text-xs border-l-2 transition-colors flex justify-between items-center hover:bg-stone-100 rounded-r",
                                                            isActiveSection
                                                                ? "border-stone-800 text-stone-900 font-bold bg-stone-100"
                                                                : "border-gray-200 text-gray-500"
                                                        )}
                                                    >
                                                        {section.label}
                                                    </Link>
                                                );
                                            })}
                                            {!isLoading && !blockData && (
                                                <div className="p-2 text-xs text-red-400 italic">Errore nel caricamento</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        // Fallback for current file only (e.g. preview mode)
                        data.sections.map((section) => (
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
                        ))
                    )}
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
                    <div className="bg-white rounded-lg px-6 py-4 shadow-sm border border-gray-200 flex items-center justify-between relative">
                        <button
                            onClick={handlePrevSection}
                            disabled={!hasPrev}
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                hasPrev ? "hover:bg-gray-100 text-gray-700" : "text-gray-300 cursor-not-allowed"
                            )}
                            title="Precedente"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-center">
                            {activeSection.label.replace(/^vv\.\s*/, "")}
                        </h2>

                        <button
                            onClick={handleNextSection}
                            disabled={!hasNext}
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                hasNext ? "hover:bg-gray-100 text-gray-700" : "text-gray-300 cursor-not-allowed"
                            )}
                            title="Successivo"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
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
                            {activeSection?.verses.map((verse, index, array) => (
                                <div
                                    key={verse.id}
                                    id={verse.id}
                                    className={cn(
                                        "grid grid-cols-[30px_1fr] gap-2 hover:bg-amber-50 cursor-pointer rounded p-1 -ml-1 pl-1 transition-colors relative",
                                        selectedVerseId === verse.id ? "bg-amber-100" : ""
                                    )}
                                    onClick={() => {
                                        setSelectedVerseId(verse.id === selectedVerseId ? null : verse.id);
                                        if (!selectedVerseId || selectedVerseId !== verse.id) {
                                            scrollToComment(verse.id);
                                        }
                                    }}
                                >
                                    <span className="font-bold text-sm text-gray-800 tabular-nums pt-1 select-none">
                                        {(index === 0 || index === array.length - 1) ? verse.n : ""}
                                    </span>
                                    <div dangerouslySetInnerHTML={{ __html: verse.sourceContent }} />
                                    {verse.hasCommentary && <MessageSquare className="absolute right-0 top-2 w-3 h-3 text-blue-400 fill-blue-50" />}
                                    {verse.hasApparatus && <div className="absolute right-0 top-6 w-1.5 h-1.5 bg-red-400 rounded-full" title="Varianti nell'apparato" />}
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
                            {activeSection?.verses.map((verse, index, array) => (
                                <div
                                    key={`tr-${verse.id}`}
                                    className={cn(
                                        "grid grid-cols-[30px_1fr] gap-2 rounded p-1 -ml-1 pl-1 transition-colors",
                                        selectedVerseId === verse.id ? "bg-amber-100" : ""
                                    )}
                                >
                                    <span className="font-bold text-sm text-gray-800 tabular-nums pt-1 select-none">
                                        {(index === 0 || index === array.length - 1) ? verse.n : ""}
                                    </span>
                                    <div dangerouslySetInnerHTML={{ __html: verse.translationContent || "<span class='text-gray-300 italic'>...</span>" }} />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Commentary Section (Replaces Apparatus Accordion) */}
                <div id="commentary-section" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 mb-20 relative">
                    <button
                        onClick={() => setCommentaryOpen(!commentaryOpen)}
                        className="w-full p-4 flex justify-between items-center bg-white hover:bg-stone-50 border-b border-gray-100"
                    >
                        <h3 className="font-bold text-lg">Commento</h3>
                        {commentaryOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </button>

                    {commentaryOpen && (
                        <div className="p-6 bg-stone-50/50 min-h-[200px] relative">
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
                                            <div className="font-bold text-lg mb-2 text-stone-800 border-b border-gray-200 pb-1 flex justify-between items-center">
                                                <span>{comm.title}</span>
                                                <div className="flex items-center gap-2">
                                                    {selectedVerseId === comm.target && <span className="text-xs uppercase tracking-wider text-euripides-accent bg-euripides-accent/10 px-2 py-0.5 rounded">Selezionato</span>}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            scrollToVerse(comm.target);
                                                        }}
                                                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors"
                                                        title="Torna al testo"
                                                    >
                                                        <ArrowUp className="w-4 h-4" />
                                                    </button>
                                                </div>
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
