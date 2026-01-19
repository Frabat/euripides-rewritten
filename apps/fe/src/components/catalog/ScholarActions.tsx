"use client";

import { useState, useEffect } from "react";
import { getUser } from "@/lib/auth";
import { PlusCircle, Upload, Shield } from "lucide-react";
import Link from "next/link";
import { StrapiUser } from "@/types/strapi";

export function ScholarActions() {
    const [user, setUser] = useState<StrapiUser | null>(null);

    useEffect(() => {
        setUser(getUser());
    }, []);

    if (!user) return null;

    // Check scholarship
    const isScholar = user.role?.name === "Scholar" || user.role?.type === "scholar";

    if (!isScholar) return null;

    return (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-4 text-purple-800 font-bold">
                <Shield className="w-4 h-4" />
                <span>Gestione Studiosi</span>
            </div>

            <div className="space-y-3">
                <Link
                    href="/catalog/new"
                    className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors"
                >
                    <PlusCircle className="w-4 h-4" />
                    Nuova Opera
                </Link>
                <Link
                    href="/catalog/upload"
                    className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    Nuovo Documento
                </Link>
            </div>
        </div>
    );
}
