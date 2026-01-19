"use client";

import { useState, useEffect } from "react";
import { getUser } from "@/lib/auth";
import { StrapiUser } from "@/types/strapi";

interface ProtectScholarProps {
    children: React.ReactNode;
}

export function ProtectScholar({ children }: ProtectScholarProps) {
    const [user, setUser] = useState<StrapiUser | null>(null);

    useEffect(() => {
        setUser(getUser());
    }, []);

    if (!user) return null;

    // Check scholarship
    const isScholar = user.role?.name === "Authenticated" || user.role?.name === "Scholar" || user.role?.type === "scholar";
    // Assuming Authenticated users can also contribute for now based on context, or strictly Scholar. 
    // Usually "Scholar" role is specific. Let's start strictly if "Scholar" role exists, but previous code checked for "Scholar".
    // Reverting to strict Scholar check as per previous "ScholarActions" logic.
    const isScholarStrict = user.role?.name === "Scholar" || user.role?.type === "scholar";

    if (!isScholarStrict) return null;

    return <>{children}</>;
}
