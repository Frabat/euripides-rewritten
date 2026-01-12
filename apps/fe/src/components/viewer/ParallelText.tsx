export interface TextLine {
    number: number;
    original: string;
    translation: string;
}

interface ParallelTextProps {
    lines: TextLine[];
    originalLanguage: string;
    translationLanguage: string;
}

export function ParallelText({ lines, originalLanguage, translationLanguage }: ParallelTextProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* Original Column */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                    <h3 className="text-xl font-bold">Originale</h3>
                    <span className="px-3 py-1 rounded-full border-2 border-euripides-accent text-euripides-accent font-bold text-sm uppercase">
                        {originalLanguage}
                    </span>
                </div>
                <div className="space-y-4 font-serif text-lg leading-relaxed">
                    {lines.map((line) => (
                        <div key={`orig-${line.number}`} className="flex gap-4">
                            <span className="font-bold text-black min-w-[2rem]">{line.number}</span>
                            <p>{line.original}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Translation Column */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                    <h3 className="text-xl font-bold">Traduzione</h3>
                    <span className="px-3 py-1 rounded-full border-2 border-euripides-accent text-euripides-accent font-bold text-sm uppercase">
                        {translationLanguage}
                    </span>
                </div>
                <div className="space-y-4 font-serif text-lg leading-relaxed">
                    {lines.map((line) => (
                        <div key={`trans-${line.number}`} className="flex gap-4">
                            <span className="font-bold text-black min-w-[2rem]">{line.number}</span>
                            <p>{line.translation}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
