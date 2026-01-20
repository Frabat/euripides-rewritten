"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        // Using a rich dark taupe derived from the main background (#dccac9).
        <footer className="w-full bg-[#3e3635] text-white border-t border-[#524847] mt-auto">
            <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-20">

                    {/* Left Side: Project Info */}
                    <div className="text-left max-w-2xl space-y-6">
                        {/* Logo */}
                        <div className="relative w-40 h-12 mb-6">
                            <Image
                                src="/logos/logo_horizontal.png"
                                alt="Euripides Rewritten"
                                fill
                                className="object-contain object-left" // White logo on dark bg -> No invert needed
                                priority
                            />
                        </div>

                        <h3 className="text-lg font-bold font-serif leading-tight">
                            Edizione scientifica digitale delle tragedie euripidee e della loro fortuna
                        </h3>

                        <p className="text-gray-400 text-sm leading-relaxed">
                            La piattaforma Euripides Rewritten si inserisce nell’ambito del progetto di dottorato intitolato “Didattica interattiva e inclusiva per lo studio del teatro greco”, finanziato dalla Pubblica Amministrazione per la borsa PNRR D.M. 351/22.
                        </p>

                        <div className="pt-8 text-xs text-gray-500 space-y-1 font-mono">
                            <p>Distribuito secondo MIT License</p>
                            <p>Copyright (c) {currentYear} Anastasia Maria Gervasi</p>
                        </div>
                    </div>

                    {/* Right Side: Institutional Logos */}
                    <div className="flex flex-wrap lg:flex-col justify-start lg:items-end gap-6 lg:gap-4 opacity-80 hover:opacity-100 transition-opacity duration-300">
                        {/* EU Logo */}
                        <div className="relative w-40 h-10 lg:w-48 lg:h-12 bg-white/5 rounded-sm p-1">
                            <Image
                                src="/logos/ue_logo.png"
                                alt="Finanziato dall'Unione Europea - NextGenerationEU"
                                fill
                                className="object-contain"
                            />
                        </div>

                        {/* UniBa Logo */}
                        <div className="relative w-32 h-10 lg:w-40 lg:h-12 bg-white/5 rounded-sm p-1">
                            <Image
                                src="/logos/uniba.png"
                                alt="Università degli Studi di Bari Aldo Moro"
                                fill
                                className="object-contain"
                            />
                        </div>

                        {/* PhD Logo */}
                        <div className="relative w-24 h-10 lg:w-32 lg:h-12 bg-white/5 rounded-sm p-1">
                            <Image
                                src="/logos/leliar.png"
                                alt="Dottorato LeLiArt"
                                fill
                                className="object-contain"
                            />
                        </div>

                        {/* MUR Logo */}
                        <div className="relative w-24 h-10 lg:w-32 lg:h-12 bg-white/5 rounded-sm p-1">
                            <Image
                                src="/logos/mur.png"
                                alt="MUR - Ministero dell'Università e della Ricerca"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
