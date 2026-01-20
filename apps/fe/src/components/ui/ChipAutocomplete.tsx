"use client";

import { useState, useRef, useEffect } from "react";
import { X, Check } from "lucide-react";

export interface AutocompleteItem {
    id: string;
    label: string;
}

interface ChipAutocompleteProps {
    items: AutocompleteItem[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function ChipAutocomplete({
    items,
    selectedIds,
    onChange,
    placeholder = "Cerca...",
    disabled = false
}: ChipAutocompleteProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter items: exclude already selected ones, filter by query
    const filteredItems = items.filter(item =>
        !selectedIds.includes(item.id) &&
        item.label.toLowerCase().includes(query.toLowerCase())
    );

    // Get selected item objects for display
    const selectedItems = items.filter(item => selectedIds.includes(item.id));

    // Handle outside click to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (id: string) => {
        onChange([...selectedIds, id]);
        setQuery(""); // Reset search
        setIsOpen(false); // Close dropdown (optional)
    };

    const handleRemove = (id: string) => {
        onChange(selectedIds.filter(selectedId => selectedId !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && query === "" && selectedIds.length > 0) {
            // Remove last item on backspace if input empty
            handleRemove(selectedIds[selectedIds.length - 1]);
        }
    };

    return (
        <div ref={wrapperRef} className="w-full relative">
            <div
                className={`flex flex-wrap items-center gap-2 p-2 border rounded-md bg-white transition-colors
                ${disabled ? "bg-gray-100 cursor-not-allowed" : "focus-within:ring-2 focus-within:ring-euripides-accent focus-within:border-transparent border-gray-300"}`}
                onClick={() => !disabled && setIsOpen(true)}
            >
                {selectedItems.map(item => (
                    <span key={item.id} className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full flex items-center gap-1">
                        {item.label}
                        {!disabled && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(item.id);
                                }}
                                className="text-gray-400 hover:text-red-500 rounded-full p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </span>
                ))}

                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    disabled={disabled}
                    placeholder={selectedIds.length === 0 ? placeholder : ""}
                    className="flex-1 outline-none min-w-[120px] text-sm bg-transparent h-6"
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                    {filteredItems.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">Nessun risultato.</div>
                    ) : (
                        filteredItems.map(item => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSelect(item.id)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between group"
                            >
                                <span>{item.label}</span>
                                <span className="opacity-0 group-hover:opacity-100 text-euripides-accent">
                                    <Check className="w-4 h-4" />
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
