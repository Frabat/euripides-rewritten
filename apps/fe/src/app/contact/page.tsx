"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Twitter, Linkedin, Globe, Github } from "lucide-react";

interface TeamMemberProps {
    name: string;
    role: string;
    bio: string;
    image?: string;
    imageColor: string;
    socials: { icon: any; href: string }[];
}

function TeamMemberCard({ member }: { member: TeamMemberProps }) {
    return (
        <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
            {/* Avatar */}
            <div className="relative w-32 h-32 rounded-full mb-6 overflow-hidden border-4 border-white shadow-md">
                {member.image ? (
                    <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center text-3xl font-serif font-bold ${member.imageColor}`}>
                        {member.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                    </div>
                )}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-1">{member.name}</h3>
            <div className="text-euripides-accent font-medium mb-4">{member.role}</div>

            <p className="text-gray-600 mb-6 leading-relaxed">
                {member.bio}
            </p>

            <div className="flex gap-4">
                {member.socials.map((social, i) => (
                    <a
                        key={i}
                        href={social.href}
                        className="text-gray-400 hover:text-gray-900 transition-colors p-2"
                    >
                        <social.icon className="w-5 h-5" />
                    </a>
                ))}
            </div>
        </div>
    );
}

export default function ContactPage() {
    const team: TeamMemberProps[] = [
        {
            name: "Anastasia Maria Gervasi",
            role: "Ph.D. Candidate",
            bio: `Dottoranda in Lingua e Letteratura greca presso l’Università di Bari, si occupa di nuove tecnologie e metodologie didattiche per lo studio del dramma antico, con particolare riferimento alla fortuna latina dell’Ipsipile euripidea.`,
            socials: [
                { icon: Linkedin, href: "https://www.linkedin.com/in/anastasia-maria-gervasi-9b9123212/" },
            ],
            image: "https://media.licdn.com/dms/image/v2/D4E03AQGab2zKDoZzzA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1729431177908?e=1770249600&v=beta&t=4zJwbibP88qYOrMKgVslsHyz_fKVhTfkjYR4COK_XoQ", // Placeholder
            imageColor: "bg-purple-100 text-purple-600"
        },
        {
            name: "Francesco Battista",
            role: "Software Engineer",
            bio: `Senior Software Engineer con un Master of Science in Computer Science presso il Georgia Institute of Technology. Ha esperienza in sviluppo di software per realtà internazionali nell'ambito media e industriale.`,
            socials: [
                { icon: Linkedin, href: "https://www.linkedin.com/in/frabat/" },
                { icon: Github, href: "https://github.com/frabat" }
            ],
            image: "https://media.licdn.com/dms/image/v2/D4E03AQHYsN445wX4Eg/profile-displayphoto-shrink_800_800/B4EZZy_mlGHMAc-/0/1745685999579?e=1770249600&v=beta&t=xrzjVRozX7dMmnMRXG8ZRLULIPhw5WTDpuDPtlXamdw", // Placeholder
            imageColor: "bg-blue-100 text-blue-600"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto py-12 px-4 md:px-8">
                <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black mb-12">
                    <ArrowLeft className="w-4 h-4" /> Torna alla Home
                </Link>

                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-sm font-bold text-euripides-accent uppercase tracking-wider mb-3">Il Team</h1>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                        Un piccolo team con una grande missione.
                    </h2>
                    <p className="text-xl text-gray-600">
                        Uniamo  competenze umanistiche e ingegneria del software per promuovere il coinvolgimento attivo degli utenti e rispondere in modo efficace alle esigenze degli studenti.
                    </p>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    {team.map((member, index) => (
                        <TeamMemberCard key={index} member={member} />
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-24 text-center bg-gray-50 rounded-2xl p-12">
                    <h3 className="text-2xl font-bold mb-4">Hai domande sul progetto?</h3>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        Siamo sempre alla ricerca di collaborazioni con altri istituti di ricerca e studiosi. Contattaci per saperne di più.
                    </p>
                    <a
                        href="mailto:anastasia.gervasi97@gmail.com"
                        className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-md font-bold hover:bg-gray-800 transition-colors"
                    >
                        <Mail className="w-4 h-4" /> Scrivici una Email
                    </a>
                </div>
            </div>
        </div>
    );
}
