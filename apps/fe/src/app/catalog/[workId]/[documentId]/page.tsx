import { TEIViewer } from "@/components/viewer/TEIViewer";
import { CommentSection } from "@/components/viewer/CommentSection";
import { fetchXML, getDocumentById } from "@/lib/api";
import { notFound } from "next/navigation";

interface DocumentViewerPageProps {
    params: Promise<{
        workId: string;
        documentId: string;
    }>;
}

export default async function DocumentViewerPage({ params }: DocumentViewerPageProps) {
    const { documentId } = await params;

    // 1. Fetch Document Metadata & XML File URL
    let document;
    try {
        document = await getDocumentById(documentId);
    } catch (e) {
        console.error("Error fetching document:", e);
        // notFound(); // Should we 404? 
    }

    if (!document) {
        return <div className="p-12 text-center">Documento non trovato.</div>;
    }

    const xmlFile = document.xmlFile;
    if (!xmlFile || !xmlFile.url) {
        return (
            <div className="container mx-auto py-12 px-4">
                <h1 className="text-2xl font-bold mb-4">Documento: {document.documentId}</h1>
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
            {/* Back Link / Breadcrumbs could go here */}

            <div className="mb-8">
                <TEIViewer xmlContent={xmlContent} />
            </div>

            <hr className="my-12 border-gray-200" />

            <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold mb-6">Discussione</h3>
                <CommentSection documentId={documentId} />
            </div>
        </div>
    );
}
