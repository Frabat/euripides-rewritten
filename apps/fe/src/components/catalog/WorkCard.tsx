"use client";

import Link from "next/link";
import { User, BookOpen, Calendar } from "lucide-react";
import { CardActions } from "@/components/common/CardActions";
import { deleteCatalog } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export interface WorkCardProps {
    id: string | number; // documentId
    title: string;
    author: string;
    editor: string;
    createdDate: string;
    updatedDate: string;
    coverImage?: string; // URL
}

export function WorkCard({ id, title, author, editor, createdDate, updatedDate, coverImage }: WorkCardProps) {
    const router = useRouter();

    const handleDelete = async () => {
        const token = getToken();
        if (!token) {
            alert("Non autorizzato");
            return;
        }
        await deleteCatalog(String(id), token);
        router.refresh();
    };

    return (
        <div className="block group relative">
            {/* Actions positioned absolute bottom right, z-index higher than link */}
            <div className="absolute bottom-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
                <CardActions
                    itemType="Progetto"
                    editUrl={`/catalog/${id}/edit`}
                    onDelete={handleDelete}
                />
            </div>

            <Link href={`/catalog/${id}`} className="block">
                <div className="bg-white/50 hover:bg-white transition-colors duration-300 rounded-lg overflow-hidden border border-black/5 hover:shadow-lg flex flex-row h-48">
                    {/* Cover Image Placeholder */}
                    <div className="w-32 md:w-48 bg-gray-200 shrink-0 relative overflow-hidden">
                        {coverImage ? (
                            <img src={coverImage} alt={title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                                <BookOpen className="w-8 h-8 opacity-50" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col justify-between flex-1">
                        <div>
                            <h3 className="text-xl font-bold text-euripides-accent mb-1 group-hover:text-euripides-accent/80 transition-colors pr-8">
                                {title}
                            </h3>
                            <div className="text-lg font-semibold text-euripides-fg mb-0.5">
                                {author}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                                {editor}
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                                <span className="font-medium">Creato il:</span> {createdDate}
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-medium">Ultima Modifica il:</span> {updatedDate}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
