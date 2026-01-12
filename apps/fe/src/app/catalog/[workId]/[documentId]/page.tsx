import { ParallelText, TextLine } from "@/components/viewer/ParallelText";
import { CommentSection } from "@/components/viewer/CommentSection";
import { ChevronRight } from "lucide-react";

// Mock Data
const TEXT_LINES: TextLine[] = [
    {
        number: 335,
        original: "Ecce autem aerata dispellens aequora prora",
        translation: "Ecce autem aerata dispellens aequora prora",
    },
    {
        number: 336,
        original: "Pelias intacti late subit hospita ponti",
        translation: "Pelias intacti late subit hospita ponti",
    },
    {
        number: 337,
        original: "pinus; agunt Minyae, geminus fragor ardua canet",
        translation: "pinus; agunt Minyae, geminus fragor ardua canet",
    },
    {
        number: 338,
        original: "per latera: abruptam credas radicibus ire",
        translation: "per latera: abruptam credas radicibus ire",
    },
    {
        number: 339,
        original: "Ortygiam aut fractum pelago decurrere montem.",
        translation: "Ortygiam aut fractum pelago decurrere montem.",
    },
];

const SECTIONS = [
    { label: "vv. 335-340", active: true },
    { label: "vv. 341 - 345", active: false },
    { label: "vv. 346 - 350", active: false },
    { label: "vv. 351 - 357", active: false },
];

export default function DocumentViewerPage() {
    return (
        <div className="container mx-auto py-12 px-4 md:px-8">
            {/* Header Info */}
            <header className="mb-12">
                <h1 className="text-4xl font-bold mb-2">Tebaide - Libro V</h1>
                <div className="text-lg">
                    <span className="font-semibold block">Autore: Publio Papinio Stazio</span>
                    <span className="block text-gray-700">Edizione Critica a cura di: <span className="font-semibold text-black">Anastasia Maria Gervasi</span></span>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Indice */}
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-3 font-bold border-b border-gray-200">Indice</div>
                        <div className="flex flex-col">
                            {SECTIONS.map((section, idx) => (
                                <button
                                    key={idx}
                                    className={`text-left px-4 py-3 text-sm font-semibold border-b border-gray-100 last:border-0 hover:bg-euripides-bg/20 transition-colors ${section.active ? 'bg-euripides-bg/50 border-l-4 border-l-euripides-fg' : ''}`}
                                >
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Navigation / Range Header */}
                    <div className="bg-white rounded-lg p-4 shadow-sm mb-6 flex items-center justify-between font-bold text-xl">
                        <div className="flex-1 text-center">335-339</div>
                        <ChevronRight className="w-5 h-5 cursor-pointer hover:text-euripides-accent" />
                    </div>

                    <ParallelText
                        lines={TEXT_LINES}
                        originalLanguage="Latino"
                        translationLanguage="Italiano"
                    />

                    <CommentSection />
                </div>
            </div>
        </div>
    );
}
