"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CommentBox } from "./CommentBox";

export function CommentSection() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-white rounded-lg shadow-sm mt-8 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors"
            >
                <h3 className="text-xl font-bold">Commento</h3>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
            </button>

            {isOpen && (
                <div className="p-6 border-t border-gray-100 font-serif text-lg leading-relaxed text-gray-800">
                    <div className="border-t-2 border-black w-full mb-6"></div>
                    <p>
                        <span className="font-bold">335 Ecce autem :</span> il nesso è un colloquialismo che ricorre spesso in commedia ed è largamente attestato in Plauto (vd. e.g. Plu. Cas. 969: ecce autem uxor omviamst, Mer.748: Ecce autem perii, coquos adest) e in Terenzio (vd. e.g. Ter. Ad. 767: Ecce autem hic adest / senex noster, Eu. 967: ecce autem uideo rure redeuntem senem. / dicam huic an non dicam?) per esprimere la sorpresa della persona loquens di fronte a un brusco mutamento degli eventi (cf. anche Turp. com. 183). La formula funge da deittico, avverbio o particella atta a tener desta l’attenzione dei lettori (Dionisotti 2007, 87). Per quel che ci consta, il nesso non compare nell’epica, nella storiografia e nell’oratoria risalenti al periodo arcaico, ma ricorre una sola volta nei frammenti tragici di Ennio (80.167 Jocelyn: ecce autem caligo oborta est, omnem prospectum obstulit / derepente contulit sese in pedes) a indicare un brusco cambiamento narrativo che provoca sorpresa nel personaggio e nel pubblico. Ecce autem è frequentemente impiegato anche da Cicerone per sottolineare eventi determinanti e inattesi. Lo Pseudo Asconio nel commento a Ver. 1.17 sottolinea, infatti, che “ecce autem” proprium hoc Ciceronis est in rebus improvisis (Stangl 1912, 211.5s.) e che dall’uso che l’oratore fa della iunctura avrebbe poi tratto ispirazione Virgilio (quod cum cura Virgilius et legit et transtulit), che impiega e denota ecce autem per l’introduzione di personaggi o eventi imprevisti (vd. e.g. Aen. 2.203-5: Ecce autem gemini a Tenedo tranquilla per alta— / horresco referens...)
                    </p>
                    <br />
                    <CommentBox documentId={1} />
                </div>
            )}
        </div>
    );
}
