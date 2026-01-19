export interface ParsedTEI {
    metadata: {
        title: string;
        author: string;
        editor: string;
        publicationDate: string;
    };
    sections: {
        id: string; // e.g. "la.5.335"
        label: string; // e.g. "335-360"
        verses: parsedVerse[]; // Verses belonging to this section
    }[];
    apparatus: Record<string, ApparatusEntry>;
    commentary: Record<string, CommentaryEntry>;
    fragments: Record<string, FragmentEntry>;
}

export interface parsedVerse {
    id: string; // xml:id e.g., "Theb.5.335"
    n: string; // verse number
    sourceContent: string; // HTML string for Latin
    translationContent: string; // HTML string for Italian
    segmentId: string; // Grouping ID (e.g., la.5.335)
    hasApparatus: boolean;
    hasCommentary: boolean;
    hasFragment: boolean;
}

export interface ApparatusEntry {
    variants: {
        lemma: string;
        readings: { text: string; witness: string }[];
        resp?: string;
    }[];
}

export interface CommentaryEntry {
    id: string; // xml:id of the note
    target: string; // target verse or segment
    title: string; // "335 Ecce autem"
    content: string; // HTML content
}

export interface FragmentEntry {
    id: string;
    ref: string;
}

export const parseTEI = (xmlString: string): ParsedTEI => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");

    // Helper to find elements by tag name (Namespace safe)
    const getTags = (parent: Element | Document, tagName: string) => Array.from(parent.getElementsByTagName(tagName));

    // Helper to find element by attribute (e.g. type, xml:id)
    const findByAttr = (elements: Element[], attr: string, value: string) => elements.find(el => el.getAttribute(attr) === value);

    // 1. Metadata
    let title = "Untitled";
    let author = "Unknown";
    let editor = "Unknown";
    let pubDate = "";

    const titleStmt = getTags(doc, "titleStmt")[0];
    if (titleStmt) {
        title = getTags(titleStmt, "title").find(t => t.getAttribute("type") === "main")?.textContent || "Untitled";
        author = getTags(titleStmt, "author")[0]?.textContent || "Unknown";
        editor = getTags(titleStmt, "editor")[0]?.textContent || "Unknown";
    }
    const pubStmt = getTags(doc, "publicationStmt")[0];
    if (pubStmt) {
        pubDate = getTags(pubStmt, "date")[0]?.textContent || "";
    }

    const sections: ParsedTEI['sections'] = [];
    const apparatus: Record<string, ApparatusEntry> = {};
    const commentary: Record<string, CommentaryEntry> = {};
    const fragments: Record<string, FragmentEntry> = {};

    // 2. Process Texts
    const texts = getTags(doc, "text");
    const sourceText = texts.find(t => t.getAttribute("type") === "source");
    const translationText = texts.find(t => t.getAttribute("type") === "translation");
    const commentaryText = texts.find(t => t.getAttribute("type") === "commentary");

    if (!sourceText) return { metadata: { title, author, editor, publicationDate: pubDate }, sections, apparatus, commentary, fragments };

    // Find Source Segments (those containing lines)
    const sourceSegs = getTags(sourceText, "seg").filter(seg => getTags(seg, "l").length > 0);

    sourceSegs.forEach(seg => {
        const segId = seg.getAttribute("xml:id") || "";

        // Find Section Label (vv. X-Y)
        let sectionLabel = segId;
        const lTags = getTags(seg, "l");

        if (lTags.length > 0) {
            const firstN = lTags[0].getAttribute("n") || lTags[0].getAttribute("xml:id")?.split(".").pop();
            const lastN = lTags[lTags.length - 1].getAttribute("n") || lTags[lTags.length - 1].getAttribute("xml:id")?.split(".").pop();
            if (firstN && lastN) {
                sectionLabel = `vv. ${firstN}-${lastN}`;
            }
        }

        // Find Translation Segment
        // Pattern: la.5.335 -> it.5.335
        const transSegId = segId.replace(/^la\./, "it.");
        let transLines: string[] = [];

        if (translationText) {
            const transSeg = getTags(translationText, "seg").find(s => s.getAttribute("xml:id") === transSegId);
            if (transSeg) {
                let rawHtml = transSeg.innerHTML;
                // Robust split
                rawHtml = rawHtml.replace(/<lb[^>]*>/gi, "###LB###");
                transLines = rawHtml
                    .split("###LB###")
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
            }
        }

        const sectionVerses: parsedVerse[] = [];

        lTags.forEach((l, index) => {
            const id = l.getAttribute("xml:id") || "";
            const n = l.getAttribute("n") || id.split(".").pop() || "";

            // Parse Source Content (preserve anchors/words)
            let sourceContent = "";
            l.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    sourceContent += node.textContent;
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const el = node as Element;
                    if (el.tagName === "anchor") {
                        const anchorId = el.getAttribute("xml:id");
                        sourceContent += `<span class="tei-anchor" data-id="${anchorId}"></span>`;
                    } else if (el.tagName === "w") {
                        sourceContent += `<span class="tei-w" data-id="${el.getAttribute('xml:id') || ''}">${el.textContent}</span>`;
                    } else if (el.tagName === "ref") {
                        // Keep text content of refs
                        sourceContent += el.textContent;
                    } else {
                        sourceContent += el.textContent;
                    }
                }
            });

            // Translation
            const translationContent = transLines[index] || "";

            sectionVerses.push({
                id,
                n,
                sourceContent,
                translationContent,
                segmentId: segId,
                hasApparatus: false,
                hasCommentary: false,
                hasFragment: false
            });
        });

        sections.push({
            id: segId,
            label: sectionLabel,
            verses: sectionVerses
        });
    });

    // 3. Process Apparatus
    // Find div type="apparatus" inside source text
    if (sourceText) {
        const divs = getTags(sourceText, "div");
        const appDiv = divs.find(d => d.getAttribute("type") === "apparatus");

        if (appDiv) {
            const apps = getTags(appDiv, "app");
            apps.forEach(app => {
                const from = app.getAttribute("from")?.replace("#", "");
                const lemma = getTags(app, "lem")[0]?.textContent?.trim() || "";

                const readings = getTags(app, "rdg").map(rdg => ({
                    text: rdg.textContent?.trim() || "",
                    witness: rdg.getAttribute("wit") || ""
                }));

                const entry: ApparatusEntry = {
                    variants: [{
                        lemma,
                        readings,
                        resp: getTags(app, "lem")[0]?.getAttribute("resp") || undefined
                    }]
                };

                if (from) {
                    apparatus[from] = entry;

                    // Link to verses
                    for (const section of sections) {
                        const verse = section.verses.find(v => v.sourceContent.includes(`data-id="${from}"`));
                        if (verse) {
                            verse.hasApparatus = true;
                            // Add extra marker to verse?
                            break;
                        }
                    }
                }
            });
        }
    }

    // 4. Process Commentary
    // We want to capture the whole commentary for the section.
    // The structure: <div xml:id="it.note.5.335"> contains <p> with <ref> and <seg> notes.
    if (commentaryText) {
        const commDivs = getTags(commentaryText, "div");

        // Strategy: Match commentary DIV to source SEG/DIV?
        // Source Seg ID: la.5.335
        // Commentary Div ID: it.note.5.335
        // It seems there is a correspondence `la.` -> `it.note.`

        sections.forEach(section => {
            const noteDivId = section.id.replace(/^la\./, "it.note.");
            const noteDiv = commDivs.find(d => d.getAttribute("xml:id") === noteDivId);

            if (noteDiv) {
                // Parse the notes inside this div
                // The structure inside is <seg xml:id="..."><title>...</title> content </seg>
                // We want to list them all for this section.
                const noteSegs = getTags(noteDiv, "seg").filter(s => s.getAttribute("xml:id"));

                noteSegs.forEach(seg => {
                    const titleEl = getTags(seg, "title").find(t => t.getAttribute("type") === "sub");
                    if (titleEl) {
                        const id = seg.getAttribute("xml:id") || "";
                        const title = titleEl.textContent?.trim() || "";
                        const content = seg.innerHTML;

                        // Try to link to specific verse number if present in title
                        const match = title.match(/^\s*(\d+)/);
                        const verseNum = match ? match[1] : null;

                        let targetVerseId = section.id; // Default to section
                        if (verseNum) {
                            const verse = section.verses.find(v => v.n === verseNum);
                            if (verse) {
                                targetVerseId = verse.id;
                                verse.hasCommentary = true;
                                // Add to global commentary
                                commentary[verse.id] = { id, target: verse.id, title, content };
                            }
                        }

                        // Also add to a "section level" list? 
                        // For now the UI iterates verses to find commentary.
                        // But if a note doesn't match a verse perfectly (e.g. range), we might miss it.
                        // Let's ensure we have a way to access it.
                        // Current UI: `sectionCommentaries = activeSection?.verses...map...`
                        // If we map to verse.id, it works.
                    }
                });
            }
        });
    }

    return {
        metadata: { title, author, editor, publicationDate: pubDate },
        sections,
        apparatus,
        commentary,
        fragments
    };
};
