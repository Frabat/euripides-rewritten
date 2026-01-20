"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Menu, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getUser, logout } from "@/lib/auth";
import { StrapiUser } from "@/types/strapi";

export function Navbar() {
    const [user, setUser] = useState<StrapiUser | null>(null);

    useEffect(() => {
        setUser(getUser());
    }, []); // Run once on mount

    return (
        <nav className="w-full py-4 px-8 flex items-center justify-between bg-euripides-bg text-euripides-fg">
            <div className="flex items-center gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative w-40 h-10">
                        <Image
                            src="/logos/logo_horizontal.png"
                            alt="Euripides Rewritten"
                            fill
                            className="object-contain object-left invert"
                            priority
                        />
                    </div>
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-8 font-medium">
                <Link href="/" className="hover:text-euripides-accent transition-colors">
                    Home
                </Link>
                <Link href="/catalog" className="hover:text-euripides-accent transition-colors">
                    Catalogo
                </Link>
                <Link href="/project" className="hover:text-euripides-accent transition-colors">
                    Progetto
                </Link>
                <Link href="/contact" className="hover:text-euripides-accent transition-colors">
                    Contatti
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold hidden sm:block">Hello, {user.username}</span>
                        <Link href="/profile" className="p-2 hover:bg-black/5 rounded-full transition-colors" title="Profile">
                            <User className="w-6 h-6" />
                        </Link>
                        <button onClick={logout} className="p-2 hover:bg-black/5 rounded-full transition-colors text-red-600" title="Logout">
                            <LogOut className="w-6 h-6" />
                        </button>
                    </div>
                ) : (
                    <Link href="/login" className="flex items-center gap-2 font-bold hover:text-euripides-accent transition-colors">
                        <User className="w-6 h-6" />
                        <span className="hidden sm:block">Accedi</span>
                    </Link>
                )}
                <button className="md:hidden p-2 hover:bg-black/5 rounded-full transition-colors">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </nav>
    );
}
