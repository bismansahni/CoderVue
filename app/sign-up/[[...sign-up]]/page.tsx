


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignUp } from "@clerk/nextjs";

export default function Home() {
    useRouter();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="bg-beige-100 text-slate-800 min-h-screen flex flex-col">
            {/* Header */}
            <header
                className={`fixed w-full top-0 z-50 transition-all duration-300 ${
                    scrolled ? "bg-slate-600 text-white shadow-lg" : ""
                }`}
            >
                <div className="container mx-auto p-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">
                        Convo<span className="text-slate-600">Vue</span>
                    </h1>

                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center">
                <div className="">


                    <SignUp />
                </div>
            </main>

            {/* Footer */}

        </div>
    );
}
