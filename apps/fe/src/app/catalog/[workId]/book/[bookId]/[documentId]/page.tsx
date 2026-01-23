import { TEIViewer } from "@/components/viewer/TEIViewer";
import { CommentSection } from "@/components/viewer/CommentSection";
import { fetchXML, getDocumentById } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface DocumentViewerPageProps {
    params: Promise<{
        workId: string;
        bookId: string;
        documentId: string;
    }>;
}

export default async function DocumentViewerPage({ params }: DocumentViewerPageProps) {
    const { workId, bookId, documentId } = await params;

    // 1. Fetch Document Metadata & XML File URL
    let document;
    try {
        document = await getDocumentById(documentId);
    } catch (e) {
        console.error("Error fetching document:", e);
    }

    if (!document) {
        return <div className="p-12 text-center text-gray-500">Documento non trovato.</div>;
    }

    const xmlFile = document.xmlFile;
    if (!xmlFile || !xmlFile.url) {
        return (
            <div className="container mx-auto py-12 px-4 md:px-8">
                 <Link href={`/catalog/${workId}/book/${bookId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8">
                    <ArrowLeft className="w-4 h-4" /> Torna al Libro
                </Link>
                <h1 className="text-2xl font-bold mb-4">Documento: {document.verseBlockName || document.documentId}</h1>
                <div className="bg-yellow-50 p-4 rounded text-yellow-800 border border-yellow-200">
                    Nessun file XML associato a questo documento.
                </div>
                <div className="mt-8">
                    <CommentSection documentId={documentId} />
                </div>
            </div>
        );
    }

    // 2. Fetch XML Content
    let xmlContent = "";
    try {
        xmlContent = await fetchXML(xmlFile.url);
    } catch (e) {
        console.error("Error fetching XML content:", e);
        return <div className="p-12 text-center text-red-600">Errore nel caricamento del file XML.</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-8">
             <Link href={`/catalog/${workId}/book/${bookId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8">
                <ArrowLeft className="w-4 h-4" /> Torna al Libro
            </Link>

            <div className="mb-4">
                 <h1 className="text-2xl font-bold">{document.title || document.verseBlockName}</h1>
                 {document.summary && <p className="text-gray-500 mt-1">{document.summary}</p>}
            </div>

            <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-mono text-gray-500">
                    XML Source: {document.xmlFile.name}
                </div>
                <div className="bg-white">
                     <TEIViewer xmlContent={xmlContent} />
                </div>
            </div>

            <hr className="my-12 border-gray-200" />

            <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold mb-6">Discussione</h3>
                <CommentSection documentId={documentId} />
            </div>
        </div>
    );
}
