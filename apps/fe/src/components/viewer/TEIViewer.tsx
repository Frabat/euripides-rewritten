"use client";

import { useEffect, useState } from "react";
import { parseTEI, ParsedTEI } from "@/lib/tei-parser";
import { ChevronRight, ChevronDown, ChevronUp, BookOpen, ChevronLeft, MessageSquare, ArrowUp, Globe, FileText } from "lucide-react";
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

type RightPanelMode = 'translation' | 'fragments';

export function TEIViewer({ xmlContent, bookStructure, workId, bookId, currentDocumentId }: TEIViewerProps) {
    const [data, setData] = useState<ParsedTEI | null>(null);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [commentaryOpen, setCommentaryOpen] = useState(true);
    const [selectedVerseId, setSelectedVerseId] = useState<string | null>(null);

    // Right Panel Mode
    const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('translation');

    // Tooltip State for Apparatus
    const [hoveredVariant, setHoveredVariant] = useState<any | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

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
                if (!expandedBlockId) setExpandedBlockId(currentDocumentId);
            }
            if (parsed.sections.length > 0) {
                setActiveSectionId(prev => prev || parsed.sections[0].id);
            }
        }
    }, [xmlContent, currentDocumentId]);

    const toggleBlock = async (block: any) => {
        if (expandedBlockId === block.documentId) {
            setExpandedBlockId(null);
            return;
        }

        setExpandedBlockId(block.documentId);

        if (parsedBlocks[block.documentId]) return;

        if (block.xmlFile?.url) {
            setLoadingBlocks(prev => ({ ...prev, [block.documentId]: true }));
            try {
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
        if (!data) return;
        // With granular commentary, there might be multiple comments for a verse (though parser keys by ID... wait).
        // Parser keys by ID. But granular comments have unique IDs. 
        // We indexed granular comments in `commentary` object.
        // BUT `data.commentary` is Record<string, Entry>.
        // In the new parser logic, I use Key = Entry ID.
        // How do we find comments for a Verse?
        // We need to filter values.

        // Let's defer scrolling logic slightly or just open the section.
        setCommentaryOpen(true);

        // If we want to scroll to the FIRST comment for this verse:
        // We'll trust the user to see the highlighted comments.
        const comments = Object.values(data.commentary).filter(c => c.target === verseId);
        if (comments.length > 0) {
            setTimeout(() => {
                const element = document.getElementById(`comment-${comments[0].id}`);
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

    const handleVerseHover = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const variantNode = target.closest(".has-variant");

        if (variantNode && data) {
            const anchor = variantNode.querySelector(".is-variant-anchor");
            const appId = anchor?.getAttribute("data-id");

            if (appId && data.apparatus[appId]) {
                setHoveredVariant(data.apparatus[appId]);
                let x = e.clientX + 15;
                let y = e.clientY + 15;
                if (x + 300 > window.innerWidth) x = e.clientX - 315;

                setTooltipPos({ x, y });
                return;
            }
        }
        setHoveredVariant(null);
    };

    if (!data) return <div className="p-8 text-center animate-pulse">Caricamento testo...</div>;

    const activeSection = data.sections.find(s => s.id === activeSectionId);
    if (!activeSection) return null;

    // Check if Fragments are available for this section (or any section? User likely wants the toggle visible globally if the Doc supports it)
    // Update: Check GLOBALLY if the document has fragments to avoid flickering toggle
    const hasFragments = data.sections.some(s => s.verses.some(v => v.sourceFragmentContent));

    // Filter commentaries for the ACTIVE SECTION
    const sectionCommentaries = Object.values(data.commentary).filter(c => {
        // Check if the target verse belongs to active section
        return activeSection.verses.some(v => v.id === c.target);
    });

    const currentSectionIndex = data.sections.findIndex(s => s.id === activeSectionId);
    const hasPrev = currentSectionIndex > 0;
    const hasNext = currentSectionIndex !== -1 && currentSectionIndex < data.sections.length - 1;

    const handlePrevSection = () => {
        if (hasPrev) setActiveSectionId(data.sections[currentSectionIndex - 1].id);
    };

    const handleNextSection = () => {
        if (hasNext) setActiveSectionId(data.sections[currentSectionIndex + 1].id);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 bg-[#f8f5f2] min-h-screen text-gray-900 font-serif p-4 md:p-8">

            {/* Sidebar */}
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

                {/* Metadata */}
                <div className="bg-transparent mb-2">
                    <h1 className="text-3xl font-bold mb-1">{data.metadata.title}</h1>
                    <div className="text-sm text-gray-600">
                        <span className="block">Autore: <span className="font-semibold text-gray-900">{data.metadata.author}</span></span>
                        <span className="block">Edizione Critica a cura di: <span className="font-semibold text-gray-900">{data.metadata.editor}</span></span>
                        <span className="block text-xs mt-1 text-gray-500">{data.metadata.publicationDate}</span>
                    </div>
                </div>

                {/* Section Nav */}
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

                {/* Parallel Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Source (Latin) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-stone-50">
                            <h3 className="font-bold text-lg">Originale</h3>
                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded border border-amber-200">Latino</span>
                        </div>
                        <div
                            className="p-6 space-y-2 leading-relaxed text-lg bg-white min-h-[300px]"
                            onMouseMove={handleVerseHover}
                            onMouseLeave={() => setHoveredVariant(null)}
                        >
                            {activeSection.verses.map((verse, index, array) => (
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
                                    <span className="font-bold text-sm text-gray-800 tabular-nums pt-1 select-none w-8 text-right pr-2 shrink-0">
                                        {(index === 0 || parseInt(verse.n) % 5 === 0) ? verse.n : ""}
                                    </span>
                                    <div>
                                        {verse.speaker && (
                                            <div className="font-bold text-sm text-euripides-accent mb-1 uppercase tracking-wider">{verse.speaker}</div>
                                        )}
                                        <div dangerouslySetInnerHTML={{ __html: verse.sourceContent }} />
                                    </div>
                                    {verse.hasCommentary && <MessageSquare className="absolute right-0 top-2 w-3 h-3 text-blue-400 fill-blue-50" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel (Translation OR Fragments) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-stone-50">
                            {/* Header / Tabs */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setRightPanelMode('translation')}
                                    className={cn(
                                        "px-3 py-1 rounded text-sm font-bold transition-colors flex items-center gap-1.5",
                                        rightPanelMode === 'translation'
                                            ? "bg-stone-800 text-white shadow-sm"
                                            : "text-gray-500 hover:bg-stone-200"
                                    )}
                                >
                                    <Globe className="w-3 h-3" />
                                    Traduzione
                                </button>
                                {hasFragments && (
                                    <button
                                        onClick={() => setRightPanelMode('fragments')}
                                        className={cn(
                                            "px-3 py-1 rounded text-sm font-bold transition-colors flex items-center gap-1.5",
                                            rightPanelMode === 'fragments'
                                                ? "bg-euripides-accent text-white shadow-sm"
                                                : "text-gray-500 hover:bg-stone-200"
                                        )}
                                    >
                                        <FileText className="w-3 h-3" />
                                        Frammenti Originali
                                    </button>
                                )}
                            </div>

                            <span className={cn(
                                "text-xs font-bold px-2 py-1 rounded border",
                                rightPanelMode === 'translation'
                                    ? "bg-amber-100 text-amber-800 border-amber-200"
                                    : "bg-blue-100 text-blue-800 border-blue-200"
                            )}>
                                {rightPanelMode === 'translation' ? 'Italiano' : 'Greco'}
                            </span>
                        </div>

                        <div className="p-6 space-y-2 leading-relaxed text-lg bg-white min-h-[300px]">
                            {rightPanelMode === 'fragments' && !activeSection.verses.some(v => v.sourceFragmentContent) ? (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-400 italic">
                                    <p>Nessun frammento disponibile per questa sezione.</p>
                                </div>
                            ) : (
                                activeSection.verses.map((verse, index, array) => {
                                    // Content Logic
                                    const content = rightPanelMode === 'translation'
                                        ? verse.translationContent
                                        : verse.sourceFragmentContent;

                                    // Show placeholder if empty in Fragment mode?
                                    if (!content && rightPanelMode === 'fragments') return (
                                        <div key={`fr-${verse.id}`} className="grid grid-cols-[30px_1fr] gap-2 py-1 min-h-[1.5em]">
                                            <span></span>
                                            <span className="text-gray-200 text-sm"> &mdash; </span>
                                        </div>
                                    );

                                    return (
                                        <div
                                            key={`rp-${verse.id}`}
                                            className={cn(
                                                "grid grid-cols-[30px_1fr] gap-2 rounded p-1 -ml-1 pl-1 transition-colors",
                                                selectedVerseId === verse.id ? "bg-amber-50" : ""
                                            )}
                                        >
                                            <span className="w-8 shrink-0"></span>
                                            <div dangerouslySetInnerHTML={{ __html: content || "<span class='text-gray-300 italic'>...</span>" }} />
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                </div>

                {/* Commentary */}
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
                            <div className="space-y-4">
                                {sectionCommentaries && sectionCommentaries.length > 0 ? (
                                    sectionCommentaries.map((comm) => (
                                        <div
                                            key={comm.id}
                                            className={cn(
                                                "animate-in fade-in p-4 rounded-lg bg-white border border-gray-100 shadow-sm transition-all",
                                                selectedVerseId === comm.target ? "ring-2 ring-euripides-accent border-transparent scroll-mt-24" : ""
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
                .tei-w.has-variant {
                    background-color: #fef08a; /* yellow-200 */
                    cursor: help;
                    text-decoration: underline;
                    text-decoration-style: dotted;
                    text-decoration-color: #ca8a04; /* yellow-600 */
                    border-radius: 2px;
                    padding: 0 2px;
                }
                .tei-w:hover {
                    color: inherit;
                }
                title[type="sub"] { display: none; }
                .tei-ref { color: #d97706; font-weight: 500; cursor: pointer; text-decoration: none; }
                .tei-ref:hover { text-decoration: underline; }
                hi[rend="bold"] { font-weight: bold; }
                hi[rend="italic"] { font-style: italic; }
                .tei-gap { color: #9ca3af; font-style: italic; }
                .tei-supplied { color: #6b7280; }
                .tei-name { color: #be185d; font-weight: 500; }
                .tei-anchor { display: none; } /* Hide anchors visually */
            `}</style>

            {/* Tooltip for Apparatus */}
            {hoveredVariant && (
                <div
                    className="fixed z-50 bg-white border border-stone-200 shadow-xl rounded-lg p-3 max-w-sm text-sm pointer-events-none"
                    style={{
                        top: tooltipPos.y,
                        left: tooltipPos.x,
                    }}
                >
                    <div className="font-bold border-b border-gray-100 pb-1 mb-1 text-gray-700">Apparato Critico</div>
                    {hoveredVariant.variants.map((v: any, i: number) => (
                        <div key={i} className="mb-2 last:mb-0">
                            <span className="font-bold text-stone-800" dangerouslySetInnerHTML={{ __html: v.lemma }} />
                            <span className="mx-2 text-gray-400">:</span>
                            {v.readings.map((r: any, j: number) => (
                                <span key={j} className="text-gray-600">
                                    <span dangerouslySetInnerHTML={{ __html: r.text }} />
                                    <span className="text-xs italic text-gray-400 ml-1">{r.witness}</span>
                                    {j < v.readings.length - 1 && ", "}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
