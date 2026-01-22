"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProjectPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto py-12 px-4 md:px-8">
                <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black mb-12">
                    <ArrowLeft className="w-4 h-4" /> Torna alla Home
                </Link>

                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-sm font-bold text-euripides-accent uppercase tracking-wider mb-3">Il Progetto</h1>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                        Descrizione del progetto
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed font-light">
                        <strong className="font-medium text-gray-900">Euripides Rewritten</strong> è un’edizione critica nativamente digitale dedicata alla fortuna delle tragedie euripidee, con particolare attenzione ai drammi frammentari e alla loro ricezione latina.
                    </p>
                </div>

                {/* Content Section */}
                <div className="max-w-3xl mx-auto space-y-12 text-gray-800 leading-relaxed text-lg">

                    {/* Section 1 */}
                    <section>
                        <p className="mb-6">
                            La piattaforma di <strong className="font-medium text-gray-900">Euripides Rewritten</strong> offre a studiosi, docenti e studenti liceali e universitari la possibilità di esplorare i drammi euripidei e le loro riscritture, costituendo un punto di riferimento stabile per lo studio inclusivo e dinamico del teatro greco e della sua fortuna.
                        </p>
                        <p className="mb-6">
                            Le edizioni nativamente digitali che popoleranno la piattaforma si compongono di introduzione, testo, apparato critico, traduzione, commento generale e puntuale ai singoli lemmi e alle sezioni paratestuali, con l’obiettivo di individuare nei testi esaminati le riprese euripidee strutturali, semantiche e lessicali.
                        </p>
                        <p>
                            Uno degli aspetti più significativi di <strong className="font-bold text-gray-900">Euripides Rewritten</strong> è rappresentato dall’adozione del metalinguaggio <strong className="font-bold text-gray-900">XML-TEI</strong> come architettura di codifica permanente e interoperabile, ma soprattutto adattabile alle specificità dei frammenti tragici.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
