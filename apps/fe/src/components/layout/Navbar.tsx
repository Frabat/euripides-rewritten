import Link from "next/link";
import { User, Menu } from "lucide-react";

export function Navbar() {
    return (
        <nav className="w-full py-4 px-8 flex items-center justify-between bg-euripides-bg text-euripides-fg">
            <div className="flex items-center gap-4">
                {/* Placeholder Logo */}
                <Link href="/" className="font-bold text-xl uppercase tracking-wider flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center text-white text-xs">ER</div>
                    <span>Euripides<br /><span className="text-sm font-normal">Rewritten</span></span>
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
                <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
                    <User className="w-6 h-6" />
                </button>
                <button className="md:hidden p-2 hover:bg-black/5 rounded-full transition-colors">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </nav>
    );
}
