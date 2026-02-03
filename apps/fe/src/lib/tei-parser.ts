export interface ParsedTEI {
    metadata: {
        title: string;
        author: string;
        editor: string;
        publicationDate: string;
    };
    sections: {
        id: string; // e.g. "la.5.335"
        label: string; // e.g. "vv. 335-360"
        verses: parsedVerse[];
    }[];
    apparatus: Record<string, ApparatusEntry>;
    commentary: Record<string, CommentaryEntry>;
    fragments: Record<string, FragmentEntry>;
    sourceDescHtml: string;
}

export interface parsedVerse {
    id: string; // xml:id e.g., "Theb.5.335"
    n: string; // verse number
    sourceContent: string; // HTML string for Latin/Greek Source
    translationContent: string; // HTML string for Italian Translation
    sourceFragmentContent?: string; // HTML string for Parallel Source Fragment (Greek)
    segmentId: string;
    hasApparatus: boolean;
    hasCommentary: boolean;
    hasFragment: boolean;
    speaker?: string;
}

export interface ApparatusEntry {
    variants: {
        lemma: string;
        readings: { text: string; witness: string }[];
        resp?: string;
    }[];
}

export interface CommentaryEntry {
    id: string;
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

    // Helper to find elements by tag name
    const getTags = (parent: Element | Document, tagName: string) => Array.from(parent.getElementsByTagName(tagName));

    // --- Metadata ---
    let title = "Untitled";
    let author = "Unknown";
    let editor = "Unknown";
    let pubDate = "";

    const titleStmt = getTags(doc, "titleStmt")[0];
    if (titleStmt) {
        title = getTags(titleStmt, "title").find(t => t.getAttribute("type") === "main")?.textContent ||
            getTags(titleStmt, "title")[0]?.textContent || "Untitled";
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

    // --- Pre-Scan Apparatus ---
    const apparatusTargetIds = new Set<string>();
    const texts = getTags(doc, "text");
    const sourceText = texts.find(t => t.getAttribute("type") === "source");

    if (sourceText) {
        const divs = getTags(sourceText, "div");
        const appDiv = divs.find(d => d.getAttribute("type") === "apparatus");
        if (appDiv) {
            const apps = getTags(appDiv, "app");
            apps.forEach(app => {
                const from = app.getAttribute("from")?.replace("#", "");
                if (from) apparatusTargetIds.add(from);
            });
        }
    }

    // --- Content Processor ---
    const processContent = (el: Element): string => {
        let content = "";
        el.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                content += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const e = node as Element;
                if (e.tagName === "gap") {
                    content += "";
                } else if (e.tagName === "supplied") {
                    content += "";
                } else if (e.tagName === "placeName" || e.tagName === "persName" || e.tagName === "name") {
                    content += `<span class="tei-name ${e.getAttribute("type") || ''}">${processContent(e)}</span>`;
                } else if (e.tagName === "anchor") {
                    const id = e.getAttribute("xml:id");
                    const isAppTarget = id && apparatusTargetIds.has(id);
                    content += `<span class="tei-anchor ${isAppTarget ? 'is-variant-anchor' : ''}" data-id="${id || ''}"></span>`;
                } else if (e.tagName === "w") {
                    const childContent = processContent(e);
                    const hasVariant = childContent.includes("is-variant-anchor");
                    content += `<span class="tei-w ${hasVariant ? 'has-variant' : ''}" data-id="${e.getAttribute('xml:id') || ''}">${childContent}</span>`;
                } else if (e.tagName === "hi") {
                    const rend = e.getAttribute("rend");
                    if (rend === "bold") content += `<b>${processContent(e)}</b>`;
                    else if (rend === "italic") content += `<i>${processContent(e)}</i>`;
                    else content += `<span>${processContent(e)}</span>`;
                } else if (e.tagName === "foreign") {
                    content += `<i lang="${e.getAttribute("xml:lang") || ''}">${processContent(e)}</i>`;
                } else if (e.tagName === "ref") {
                    const target = e.getAttribute("target");
                    if (target) {
                        const isInternal = target.startsWith("#");
                        const targetAttr = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';
                        content += `<a href="${target}" class="tei-ref"${targetAttr}>${processContent(e)}</a>`;
                    } else {
                        content += `<span class="tei-ref">${processContent(e)}</span>`;
                    }
                } else if (e.tagName === "bibl") {
                    content += `<span class="tei-bibl">${processContent(e)}</span>`;
                } else if (e.tagName === "quote") {
                    content += `"${processContent(e)}"`;
                } else {
                    content += processContent(e);
                }
            }
        });
        return content;
    };

    // --- Section Parsing ---
    interface ExtractedLine { l: Element, speaker?: string }
    const extractVerses = (container: Element): ExtractedLine[] => {
        const results: ExtractedLine[] = [];
        const sps = getTags(container, "sp");
        if (sps.length > 0) {
            sps.forEach(sp => {
                const speaker = getTags(sp, "speaker")[0]?.textContent?.trim();
                const lTags = getTags(sp, "l");
                lTags.forEach(l => results.push({ l, speaker }));
            });
        }
        const allLTags = getTags(container, "l");
        if (sps.length === 0) {
            allLTags.forEach(l => results.push({ l }));
        }
        return results;
    };

    const fragmentDivs = getTags(doc, "div").filter(d => d.getAttribute("type") === "fragment");
    const isFragmentMode = fragmentDivs.length > 0;

    if (isFragmentMode) {
        // --- Ipsipile Mode ---
        fragmentDivs.forEach(div => {
            const divId = div.getAttribute("xml:id") || `fr-${Math.random().toString(36).substr(2, 9)}`;
            let label = divId;
            const head = getTags(div, "head")[0];
            if (head) {
                const ref = getTags(head, "ref").find(r => r.getAttribute("type") === "fragment");
                label = ref ? ref.textContent?.trim() || label : head.textContent?.trim() || label;
            }

            const citFragment = getTags(div, "cit").find(c => c.getAttribute("type") === "fragment");
            if (!citFragment) return;

            const originalQuote = getTags(citFragment, "quote").find(q => q.getAttribute("xml:lang") === "grc" || q.getAttribute("xml:lang") === "la" || !q.getAttribute("xml:lang"));
            const citTranslation = getTags(citFragment, "cit").find(c => c.getAttribute("type") === "translation");
            const translationQuote = citTranslation ? getTags(citTranslation, "quote").find(q => q.getAttribute("xml:lang") === "it") : null;

            const originalLines = originalQuote ? extractVerses(originalQuote) : [];
            const translationLines = translationQuote ? extractVerses(translationQuote) : [];
            const sectionVerses: parsedVerse[] = [];

            originalLines.forEach((item, index) => {
                const l = item.l;
                const n = l.getAttribute("n") || String(index + 1);
                const transItem = translationLines.find(t => t.l.getAttribute("n") === n) || translationLines[index];

                const sourceContent = processContent(l);
                const translationContent = transItem ? processContent(transItem.l) : "";
                const id = l.getAttribute("xml:id") || `${divId}.l.${n}`;

                sectionVerses.push({
                    id, n, sourceContent, translationContent,
                    segmentId: divId, hasApparatus: false, hasCommentary: false, hasFragment: false,
                    speaker: item.speaker
                });
            });
            sections.push({ id: divId, label, verses: sectionVerses });
        });

    } else {
        // --- Tebaide Mode ---
        const translationText = texts.find(t => t.getAttribute("type") === "translation");

        // 1. Get Source Text
        if (sourceText) {
            const segsWithLines = getTags(sourceText, "seg").filter(seg => getTags(seg, "l").length > 0);

            // 2. Prep Source Fragments (Parallel Greek) if available
            // Tebaide XML: <text type="sourcefragments" ...><div...><p><seg...><lg><l>...</l>
            // We need to match these to the main lines? 
            // In the example XML: <linkGrp type="parallel" xml:id="links1" target="#la.5.340 #Eur.752g">
            // The segment #Eur.752g contains lines. 
            // BUT for viewing purposes, we might just want to attach the WHOLE greek block to the corresponding Latin section?
            // The user requested: "The user clicks on the fragments language... title changes... and language selected changes".
            // So for section "335-357", if there is a matching fragment block, we show it.

            const sourceFragmentsText = texts.find(t => t.getAttribute("type") === "sourcefragments");
            let fragmentMap: Record<string, string[]> = {}; // sectionId -> array of rendered lines or one block

            if (sourceFragmentsText) {
                // Find 'seg's in fragments
                const fragSegs = getTags(sourceFragmentsText, "seg").filter(seg => seg.getAttribute("type") === "fragment");

                // How do we link fragSeg to sourceSeg?
                // The XML has <linkGrp ... target="#la.5.340 #Eur.752g"> inside the fragment seg!
                // We'll scan for linkGrp
                fragSegs.forEach(seg => {
                    const links = getTags(seg, "linkGrp");
                    links.forEach(link => {
                        const target = link.getAttribute("target"); // "#la.5.340 #Eur.752g"
                        if (target) {
                            const targets = target.split(" ").map(t => t.replace("#", ""));
                            // Find the Latin section ID in targets
                            // In our case sections have IDs like "la.5.335" or "la.5.340".
                            // Let's store the fragment content for this Link.

                            // Extract visual content of the fragment
                            // It has <title> then <lg><l>...
                            const lines = extractVerses(seg);
                            const renderedLines = lines.map(line => processContent(line.l));

                            // Find which of the targets is the Source Section ID we parsed earlier?
                            // We don't know the exact IDs yet, but we will traverse sections.
                            // Better: Store in map matching that target ID.
                            targets.forEach(t => {
                                fragmentMap[t] = renderedLines;
                            });
                        }
                    });
                });
            }


            segsWithLines.forEach(seg => {
                const segId = seg.getAttribute("xml:id") || "";
                let sectionLabel = segId;
                const lTags = getTags(seg, "l");

                if (lTags.length > 0) {
                    const firstN = lTags[0].getAttribute("n") || lTags[0].getAttribute("xml:id")?.split(".").pop();
                    const lastN = lTags[lTags.length - 1].getAttribute("n") || lTags[lTags.length - 1].getAttribute("xml:id")?.split(".").pop();
                    if (firstN && lastN) sectionLabel = `vv. ${firstN}-${lastN}`;
                }

                // Translation
                const transSegId = segId.replace(/^la\./, "it.");
                let transLines: string[] = [];
                if (translationText) {
                    const transSeg = getTags(translationText, "seg").find(s => s.getAttribute("xml:id") === transSegId);
                    if (transSeg) {
                        transLines = [processContent(transSeg)]; // Prose block
                    }
                }

                // Check for Source Fragment linked to this Seg ID
                const frags = fragmentMap[segId]; // e.g. "la.5.340"

                // We also might have fragments linked to the *parent* div or other IDs.
                // But looking at XML: <text type="source"> ... <seg xml:id="la.5.340">
                // <linkGrp target="#la.5.340 #Eur.752g">
                // So the match on segId should work.

                const sectionVerses: parsedVerse[] = [];
                lTags.forEach((l, index) => {
                    const id = l.getAttribute("xml:id") || "";
                    const n = l.getAttribute("n") || id.split(".").pop() || "";
                    const sourceContent = processContent(l);
                    const translationContent = index === 0 && transLines.length > 0 ? transLines[0] : "";

                    // Attach fragment lines to the verses?
                    // If we have 10 latin lines and 15 greek lines, how do we align?
                    // We probably just start at index 0 and fill down?
                    // Or, since it's a parallel text, maybe we should just put the whole block in verse[0] like translation?
                    // The user asked for a parallel view. "Title changes to Frammenti Originali".
                    // If it's poetry, line-by-line is nice. 
                    // The fragment XML has <l> tags.
                    // We'll map 1-to-1 as far as possible?
                    const sourceFragmentContent = (frags && frags[index]) ? frags[index] : "";

                    sectionVerses.push({
                        id, n, sourceContent, translationContent,
                        sourceFragmentContent,
                        segmentId: segId, hasApparatus: false, hasCommentary: false, hasFragment: false
                    });
                });

                // If there are MORE fragment lines than source lines, we lose them if we stop at lTags.length.
                // We should append extra verses if fragment is longer?
                // But the Source (Latin) is the driver.
                // For now, let's assume loose alignment or attach remainder to last verse.

                sections.push({ id: segId, label: sectionLabel, verses: sectionVerses });

                // If there are MORE fragment lines than source lines, append them
                // so they are not lost. We create "ghost" source lines for them.
                if (frags && frags.length > lTags.length) {
                    const extraFrags = frags.slice(lTags.length);
                    extraFrags.forEach((fragContent, idx) => {
                        // Generate an ID for these overflow lines
                        const n = String(lTags.length + idx + 1) + "b"; // suffix b to indicate extension? Or just continue numbering?
                        // Ideally we'd want real line numbers, but source doesn't have them.
                        // Let's us blank N or "+"

                        sectionVerses.push({
                            id: `${segId}.f.${idx}`,
                            n: "", // No verse number for source
                            sourceContent: "", // No Latin source
                            translationContent: "",
                            sourceFragmentContent: fragContent,
                            segmentId: segId, hasApparatus: false, hasCommentary: false, hasFragment: true
                        });
                    });
                }
            });
        }
    }

    // --- Apparatus ---
    if (sourceText) {
        const divs = getTags(sourceText, "div");
        const appDiv = divs.find(d => d.getAttribute("type") === "apparatus");
        if (appDiv) {
            const apps = getTags(appDiv, "app");
            apps.forEach(app => {
                const from = app.getAttribute("from")?.replace("#", "");
                const lemmaEl = getTags(app, "lem")[0];
                const lemma = lemmaEl ? processContent(lemmaEl) : "";
                const readings = getTags(app, "rdg").map(rdg => ({
                    text: processContent(rdg),
                    witness: rdg.getAttribute("wit") || rdg.getAttribute("resp") || ""
                }));
                const entry: ApparatusEntry = { variants: [{ lemma, readings, resp: lemmaEl?.getAttribute("resp") || undefined }] };

                if (from) {
                    apparatus[from] = entry;
                    sections.forEach(sec => {
                        sec.verses.forEach(v => {
                            if (v.sourceContent.includes(`data-id="${from}"`)) {
                                v.hasApparatus = true;
                            }
                        });
                    });
                }
            });
        }
    }

    // --- Granular Commentary (Updated) ---
    const commentaryText = texts.find(t => t.getAttribute("type") === "commentary");
    if (commentaryText) {
        const commDivs = getTags(commentaryText, "div");

        sections.forEach(section => {
            const noteDivId = section.id.replace(/^la\./, "it.note.");
            // Also try replacing "la.versi."?

            const noteDiv = commDivs.find(d => d.getAttribute("xml:id") === noteDivId);

            if (noteDiv) {
                // Determine structure: Is it <p><seg>...</seg></p> or just <p>...
                // XML provided: <div xml:id="it.note.5.335"> <p> <seg xml:id="w1.335"> ... </seg> <seg> ... </seg> </p>

                let paragraphs = getTags(noteDiv, "p");
                let segments: Element[] = [];

                paragraphs.forEach(p => {
                    const pSegs = getTags(p, "seg");
                    // Filter leaf segments (those that do not contain other segs)
                    const leafSegs = pSegs.filter(s => s.getElementsByTagName("seg").length === 0);
                    segments.push(...leafSegs);
                });

                // Fallback for non-nested structure if needed (e.g. just Ps)
                if (segments.length === 0 && paragraphs.length > 0) {
                    // If no segs found, maybe the P itself is the comment?
                    // Verify if paragraphs contain text but no segs
                    // For now, if no segs, empty.
                }

                segments.forEach((seg, idx) => {
                    // We need a title for the card. 
                    // Tebaide XML: <title type="sub">335 Ecce autem </title> inside <hi rend="bold">
                    // Or <hi rend="bold">336 Pelias</hi>

                    const rawContent = processContent(seg);
                    const titleMatch = rawContent.match(/<b>(.*?)<\/b>/) || rawContent.match(/<title type="sub">(.*?)<\/title>/);
                    let title = "Commento";
                    if (titleMatch) {
                        title = titleMatch[1].replace(/<\/?.*?>/g, "").trim();
                    }

                    // Attempt to find Target Verse from the title number (e.g. "335" -> verse 335)
                    const nMatch = title.match(/^(\d+)/);
                    let targetVerseId = section.verses[0]?.id;
                    if (nMatch) {
                        const verse = section.verses.find(v => v.n === nMatch[1]);
                        if (verse) targetVerseId = verse.id;
                    }

                    const commId = seg.getAttribute("xml:id") || `${noteDivId}-s${idx}`;

                    commentary[commId] = {
                        id: commId,
                        target: targetVerseId,
                        title,
                        content: rawContent
                    };

                    // Mark verse
                    const verse = section.verses.find(v => v.id === targetVerseId);
                    if (verse) verse.hasCommentary = true;
                });
            }
        });
    }

    // --- Source Desc Processing ---
    let sourceDescHtml = "";
    const fileDesc = getTags(doc, "fileDesc")[0];
    if (fileDesc) {
        const sourceDesc = getTags(fileDesc, "sourceDesc")[0];
        if (sourceDesc) {
            // We need a specific processor that handles structural elements for sourceDesc
            const processSourceDesc = (el: Element): string => {
                const processNodes = (nodes: NodeListOf<ChildNode>): string => {
                    let content = "";
                    nodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            content += node.textContent;
                        } else if (node.nodeType === Node.ELEMENT_NODE) {
                            content += processElement(node as Element);
                        }
                    });
                    return content;
                };

                const processElement = (e: Element): string => {
                    if (e.tagName === "listBibl" || e.tagName === "listWit") {
                        const headChild = Array.from(e.children).find(c => c.tagName === "head");
                        let summaryHtml = "Dettagli";
                        if (headChild) {
                            summaryHtml = processNodes(headChild.childNodes);
                        }

                        const bodyNodes = Array.from(e.childNodes).filter(n => n !== headChild);
                        let bodyHtml = "";
                        bodyNodes.forEach(n => {
                            if (n.nodeType === Node.TEXT_NODE) bodyHtml += n.textContent;
                            else if (n.nodeType === Node.ELEMENT_NODE) bodyHtml += processElement(n as Element);
                        });

                        return `<details class="group mb-2 border border-gray-100 rounded bg-white">
                            <summary class="font-bold text-stone-700 bg-stone-50 p-2 cursor-pointer select-none flex justify-between items-center hover:bg-stone-100 transition-colors uppercase text-xs tracking-wider outline-none">
                                <span>${summaryHtml}</span>
                                <svg class="w-4 h-4 text-gray-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                            </summary>
                            <div class="p-2 border-t border-gray-100">
                                ${bodyHtml}
                            </div>
                         </details>`;

                    } else if (e.tagName === "head") {
                        // Fallback if head is found outside list (shouldn't happen with filter above, but safe to keep)
                        return `<h4 class="font-bold text-stone-800 mb-2 mt-4 text-xs uppercase tracking-wider bg-stone-100 p-1 rounded">` + processNodes(e.childNodes) + `</h4>`;
                    } else if (e.tagName === "witness" || e.tagName === "bibl") {
                        const id = e.getAttribute("xml:id");
                        return `<div class="tei-item mb-1 ml-2 text-sm text-gray-700" ${id ? `id="${id}"` : ''}>` + processNodes(e.childNodes) + `</div>`;
                    } else if (e.tagName === "abbr") {
                        return `<span class="font-mono text-xs bg-gray-100 px-1 rounded border border-gray-200 mr-1 text-gray-600" title="${e.getAttribute("type") || ''}">` + processNodes(e.childNodes) + `</span>`;
                    } else if (e.tagName === "title") {
                        return `<span class="italic font-medium">` + processNodes(e.childNodes) + `</span>`;
                    } else if (e.tagName === "editor" || e.tagName === "author" || e.tagName === "name") {
                        return `<span class="font-medium text-stone-800">` + processNodes(e.childNodes) + `</span>`;
                    } else if (e.tagName === "date") {
                        return `<span class="text-xs text-gray-500 ml-1">` + processNodes(e.childNodes) + `</span>`;
                    } else if (e.tagName === "pubPlace") {
                        return `<span class="text-xs text-gray-500 ml-1">` + processNodes(e.childNodes) + `</span>`;
                    } else if (e.tagName === "biblScope") {
                        return `<span class="text-xs text-gray-500 ml-1">` + processNodes(e.childNodes) + `</span>`;
                    } else {
                        return processContent(e);
                    }
                };

                return processNodes(el.childNodes);
            };
            sourceDescHtml = processSourceDesc(sourceDesc);
        }
    }

    return {
        metadata: { title, author, editor, publicationDate: pubDate },
        sections,
        apparatus,
        commentary,
        fragments,
        sourceDescHtml
    };
};
