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
                        Esplorare nuove modalità di <strong className="font-medium text-gray-900">edizione, analisi e fruizione dei testi classici</strong> in ambiente digitale.
                    </p>
                </div>

                {/* Content Section */}
                <div className="max-w-3xl mx-auto space-y-12 text-gray-800 leading-relaxed text-lg">

                    {/* Section 1 */}
                    <section>
                        <p className="mb-6">
                            Il progetto nasce con l’obiettivo di mantenere come riferimento centrale il <strong className="font-medium text-gray-900">metodo filologico</strong> e la tradizione dell’edizione critica.
                        </p>
                        <p className="mb-6">
                            Il sistema si fonda sull’uso dello standard <strong className="font-bold text-gray-900">TEI-XML (Text Encoding Initiative)</strong> come strumento di rappresentazione formale della struttura testuale, delle varianti e dell’apparato critico. La TEI non è impiegata come semplice formato di pubblicazione, ma come <strong className="font-bold text-gray-900">modello esplicito della conoscenza filologica</strong>, capace di rendere visibili e interrogabili le relazioni tra testo, tradizione e interpretazione.
                        </p>
                        <p>
                            Il corpus principale è costituito dalle tragedie di <strong className="font-bold text-gray-900">Euripide</strong>, scelte per la complessità della loro trasmissione testuale e per la ricchezza della tradizione critica.
                        </p>
                    </section>

                    <div className="w-24 h-1 bg-euripides-accent/20 mx-auto rounded-full"></div>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-3xl font-serif font-bold mb-6 text-gray-900">Presupposti filologici</h2>
                        <p className="mb-4">
                            Il progetto si colloca all’interno della filologia testuale e dell’ecdotica, assumendo come presupposto che il testo classico non sia un’entità fissa, ma il risultato di una <strong className="font-bold text-gray-900">tradizione stratificata</strong>, composta da testimoni, varianti, congetture e interpretazioni.
                        </p>
                        <p className="mb-4">In questa prospettiva:</p>
                        <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700 marker:text-euripides-accent">
                            <li>il testo non è separabile dal suo apparato critico;</li>
                            <li>le varianti non sono elementi accessori, ma parte integrante dell’oggetto di studio;</li>
                            <li>la struttura formale del testo (divisioni, interventi dei personaggi, cori) ha valore interpretativo.</li>
                        </ul>
                        <p>
                            Il progetto mira a rendere esplicita questa complessità, evitando semplificazioni che riducano il testo a una versione “normalizzata” o priva di contesto critico.
                        </p>
                    </section>

                    <div className="w-24 h-1 bg-euripides-accent/20 mx-auto rounded-full"></div>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-3xl font-serif font-bold mb-6 text-gray-900">Metodo</h2>
                        <p className="mb-4">
                            Le fonti testuali sono codificate in <strong className="font-bold text-gray-900">TEI-XML</strong> secondo pratiche consolidate nelle Digital Humanities, con particolare attenzione a:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700 marker:text-euripides-accent">
                            <li>struttura drammatica (atti, scene, versi, cori);</li>
                            <li>attribuzione delle parti ai personaggi;</li>
                            <li>annotazioni filologiche e critiche;</li>
                            <li>rappresentazione delle varianti testuali.</li>
                        </ul>
                        <p className="mb-4">
                            Il markup TEI viene interpretato come una <strong className="font-bold text-gray-900">formalizzazione delle decisioni editoriali</strong>, non come un semplice strato tecnico. Ogni elemento codificato riflette una scelta filologica e rimane tracciabile all’interno del sistema.
                        </p>
                        <p>
                            Un livello di elaborazione dedicato consente di trasformare il markup in strutture dati interrogabili, preservando la distinzione tra testo base, apparato critico e annotazioni.
                        </p>
                    </section>

                    <div className="w-24 h-1 bg-euripides-accent/20 mx-auto rounded-full"></div>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-3xl font-serif font-bold mb-6 text-gray-900">Edizione e fruizione del testo</h2>
                        <p className="mb-4">
                            L’ambiente di consultazione è progettato per supportare una <strong className="font-bold text-gray-900">lettura filologicamente informata</strong>, in cui il testo e il suo apparato siano accessibili in modo integrato.
                        </p>
                        <p className="mb-4">Il sistema consente:</p>
                        <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700 marker:text-euripides-accent">
                            <li>la consultazione del testo mantenendo visibile il contesto critico;</li>
                            <li>l’accesso diretto a varianti e note senza interrompere il flusso di lettura;</li>
                            <li>l’esplorazione della struttura del testo come strumento interpretativo;</li>
                            <li>il confronto tra diverse soluzioni testuali e interpretative.</li>
                        </ul>
                        <p>
                            L’obiettivo non è semplificare il testo, ma <strong className="font-bold text-gray-900">rendere praticabile la complessità filologica</strong> in un ambiente digitale.
                        </p>
                    </section>

                    <div className="w-24 h-1 bg-euripides-accent/20 mx-auto rounded-full"></div>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-3xl font-serif font-bold mb-6 text-gray-900">Contributo</h2>
                        <p className="mb-4">
                            Il contributo principale del progetto consiste nel proporre un modello di <strong className="font-bold text-gray-900">edizione critica digitale</strong> in cui la TEI-XML funge da infrastruttura semantica esplicita, capace di:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700 marker:text-euripides-accent">
                            <li>rappresentare in modo formale le scelte editoriali;</li>
                            <li>mantenere la separazione tra dati testuali e interpretazione;</li>
                            <li>supportare pratiche di lettura e analisi coerenti con la tradizione filologica.</li>
                        </ul>
                        <p>
                            Il progetto si propone come strumento di ricerca e di studio, destinato a studiosi, studenti e lettori avanzati interessati alla trasmissione e all’interpretazione dei testi classici.
                        </p>
                    </section>

                    <div className="w-24 h-1 bg-euripides-accent/20 mx-auto rounded-full"></div>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-3xl font-serif font-bold mb-6 text-gray-900">Prospettive</h2>
                        <p className="mb-4">
                            L’architettura del sistema è concepita per essere estesa ad altri autori e corpora, mantenendo invariati i principi filologici alla base del progetto. In prospettiva, il sistema potrà supportare ulteriori strumenti di analisi e confronto, senza sostituire il giudizio critico dello studioso, ma affiancandolo.
                        </p>
                        <p className="font-medium text-lg text-gray-900 italic">
                            “L’obiettivo finale è contribuire allo sviluppo di edizioni digitali che rispettino la complessità del testo classico e ne valorizzino la dimensione storica, critica e interpretativa.”
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
