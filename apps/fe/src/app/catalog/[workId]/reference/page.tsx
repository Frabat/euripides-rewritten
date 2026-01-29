import { ReferenceTEIViewer } from "@/components/viewer/ReferenceTEIViewer";
import { fetchXML, getCatalogById } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { notFound } from "next/navigation";

interface ReferenceViewerPageProps {
    params: Promise<{
        workId: string;
    }>;
}

export default async function ReferenceViewerPage({ params }: ReferenceViewerPageProps) {
    const { workId } = await params;

    const work = await getCatalogById(workId);
    if (!work) notFound();

    const referenceText = work.reference_file || work.reference_text;

    if (!referenceText || !referenceText.url) {
        return (
            <div className="container mx-auto py-12 px-4 md:px-8">
                <Link href={`/catalog/${workId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8">
                    <ArrowLeft className="w-4 h-4" /> Torna alla Tragedia
                </Link>
                <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-lg">
                    Questa opera non ha un testo di riferimento associato.
                </div>
            </div>
        );
    }

    let xmlContent = "";
    try {
        xmlContent = await fetchXML(referenceText.url);
    } catch (e) {
        console.error("Error fetching XML:", e);
        return (
            <div className="container mx-auto py-12 px-4 md:px-8">
                <Link href={`/catalog/${workId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8">
                    <ArrowLeft className="w-4 h-4" /> Torna alla Tragedia
                </Link>
                <div className="p-12 text-center text-red-600 bg-red-50 rounded-lg">
                    Errore nel caricamento del file di riferimento.
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-8">
            <Link href={`/catalog/${workId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8">
                <ArrowLeft className="w-4 h-4" /> Torna alla Tragedia
            </Link>

            <div className="mb-6">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Testo di Riferimento</span>
                <h1 className="text-2xl font-serif font-bold mt-1">{work.title}</h1>
                <p className="text-gray-500 mt-2">Trascrizione ufficiale</p>
            </div>

            <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-mono text-gray-500 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Source: {referenceText.name}
                </div>
                <div className="bg-white">
                    <ReferenceTEIViewer xmlContent={xmlContent} />
                </div>
            </div>
        </div>
    );
}
