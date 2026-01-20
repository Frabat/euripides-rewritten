import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4">
      {/* Hero Section */}
      <div className="max-w-4xl space-y-8 animate-fade-in-up">
        {/* Logo / Icon */}
        <div className="w-24 h-24 bg-black text-white text-4xl font-serif font-bold flex items-center justify-center mx-auto rounded-lg shadow-xl mb-8">
          ER
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-black tracking-tight">
          Euripides Rewritten
        </h1>

        {/* Subtitle */}
        <h2 className="text-xl md:text-2xl text-gray-700 font-light tracking-wide max-w-2xl mx-auto">
          Edizione scientifica digitale delle tragedie euripidee e della loro fortuna<br />
          <span className="text-base mt-2 block opacity-80">Progetto a cura di Anastasia Maria Gervasi</span>
        </h2>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <Link
            href="/catalog"
            className="flex items-center gap-2 bg-euripides-accent hover:bg-euripides-accent/90 text-white text-lg font-bold py-4 px-8 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <BookOpen className="w-6 h-6" />
            Esplora il Catalogo
          </Link>

          <Link
            href="/project"
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-black border border-gray-200 text-lg font-semibold py-4 px-8 rounded-full shadow-sm transition-colors"
          >
            Scopri il Progetto
          </Link>
        </div>
      </div>
    </div>
  );
}
