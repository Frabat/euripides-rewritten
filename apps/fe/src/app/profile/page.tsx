"use client";

import { useEffect, useState } from "react";
import { getUser, logout } from "@/lib/auth";
import { StrapiUser } from "@/types/strapi";
import { useRouter } from "next/navigation";
import { User, Shield, BookOpen, LogOut, Upload } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<StrapiUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = getUser();
        if (!userData) {
            router.push("/login");
        } else {
            setUser(userData);
        }
        setLoading(false);
    }, [router]);

    if (loading) return null;
    if (!user) return null;

    // Check if scholar (assuming role name contains 'Scholar' or is specifically that)
    const isScholar = user.role?.name === "Scholar" || user.role?.type === "scholar";

    return (
        <div className="container mx-auto py-12 px-4 md:px-8 max-w-4xl">
            <h1 className="text-3xl font-serif font-bold mb-8">Profilo Utente</h1>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 p-8 border-b border-gray-100 flex items-center gap-6">
                    <div className="w-20 h-20 bg-euripides-accent/10 rounded-full flex items-center justify-center text-euripides-accent">
                        <User className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user.username}</h2>
                        <p className="text-gray-500">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${isScholar ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'}`}>
                                {user.role?.name || "Utente"}
                            </span>
                            {user.confirmed && (
                                <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700">Verificato</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Scholar Actions */}
                    {isScholar && (
                        <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-purple-50 to-white p-6 rounded-lg border border-purple-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-full shadow-sm text-purple-600">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-2">Area Studiosi</h3>
                                    <p className="text-gray-600 mb-4 text-sm">Hai accesso ai privilegi di pubblicazione. Puoi caricare nuovi testi o revisioni.</p>
                                    <Link href="/profile/upload" className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md font-bold hover:bg-purple-700 transition-colors text-sm">
                                        <Upload className="w-4 h-4" />
                                        Carica Nuovo Contributo
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Standard Actions */}
                    <div className="p-4 rounded-lg border border-gray-100 hover:border-euripides-accent/50 transition-colors group">
                        <Link href="/catalog" className="flex items-center gap-4">
                            <BookOpen className="w-8 h-8 text-gray-400 group-hover:text-euripides-accent transition-colors" />
                            <div>
                                <h4 className="font-bold">Esplora Catalogo</h4>
                                <p className="text-sm text-gray-500">Riprendi la lettura o cerca nuovi testi.</p>
                            </div>
                        </Link>
                    </div>

                    <button onClick={logout} className="p-4 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-colors group text-left w-full flex items-center gap-4">
                        <LogOut className="w-8 h-8 text-gray-400 group-hover:text-red-500 transition-colors" />
                        <div>
                            <h4 className="font-bold text-gray-700 group-hover:text-red-600">Disconnetti</h4>
                            <p className="text-sm text-gray-500">Esci dalla sessione corrente.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
