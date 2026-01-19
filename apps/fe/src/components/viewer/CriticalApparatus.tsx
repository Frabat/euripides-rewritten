"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface CriticalApparatusProps {
    notes: {
        title: string;
        content: string;
    }[];
}

export function CriticalApparatus({ notes }: CriticalApparatusProps) {
    const [isOpen, setIsOpen] = useState(true);

    if (!notes || notes.length === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm mt-8 overflow-hidden border border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors"
            >
                <h3 className="text-xl font-bold font-serif text-gray-900">Apparato Critico / Note Editoriali</h3>
                {isOpen ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
            </button>

            {isOpen && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <div className="font-serif text-lg leading-relaxed text-gray-800 space-y-6">
                        {notes.map((note, idx) => (
                            <div key={idx} className="group">
                                <p className="text-sm text-gray-400 mb-2 uppercase tracking-wide font-bold group-hover:text-black transition-colors">
                                    {note.title}
                                </p>
                                <div dangerouslySetInnerHTML={{ __html: note.content }} />
                                {idx < notes.length - 1 && (
                                    <div className="border-t border-gray-200 my-6 w-12 opacity-50"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
