"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { CardActions } from "@/components/common/CardActions";
import { deleteBook } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export interface BookCardProps {
    workId: string;
    book: {
        documentId: string;
        title: string;
        type?: string;
        period?: string;
    };
}

export function BookCard({ workId, book }: BookCardProps) {
    const router = useRouter();

    const handleDelete = async () => {
        const token = getToken();
        if (!token) {
            alert("Non autorizzato");
            return;
        }
        await deleteBook(book.documentId, token);
        router.refresh();
    };

    return (
        <div className="block group relative">
            <div className="absolute bottom-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
                <CardActions
                    itemType="Opera"
                    editUrl={`/catalog/${workId}/book/${book.documentId}/edit`}
                    onDelete={handleDelete}
                />
            </div>

            <Link
                href={`/catalog/${workId}/book/${book.documentId}`}
                className="block bg-white p-6 rounded-lg border border-gray-200 hover:border-euripides-accent transition-colors hover:shadow-sm"
            >
                <div className="flex items-start justify-between mb-4">
                    <BookOpen className="w-8 h-8 text-gray-300 group-hover:text-euripides-accent transition-colors" />
                    {book.type && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 group-hover:bg-euripides-accent/10 group-hover:text-euripides-accent transition-colors">
                            {book.type}
                        </span>
                    )}
                </div>
                <h4 className="font-bold text-lg mb-2 group-hover:text-euripides-accent transition-colors pr-8">
                    {book.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-3">
                    {book.period || "Nessun periodo specificato"}
                </p>
            </Link>
        </div>
    );
}
