//
//
//
// "use client";
//
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { SignUp } from "@clerk/nextjs";
//
// export default function Home() {
//     useRouter();
//     const [scrolled, setScrolled] = useState(false);
//
//     useEffect(() => {
//         const handleScroll = () => setScrolled(window.scrollY > 50);
//         window.addEventListener("scroll", handleScroll);
//         return () => window.removeEventListener("scroll", handleScroll);
//     }, []);
//
//     return (
//         <div className="bg-beige-100 text-slate-800 min-h-screen flex flex-col">
//             {/* Header */}
//             <header
//                 className={`fixed w-full top-0 z-50 transition-all duration-300 ${
//                     scrolled ? "bg-slate-600 text-white shadow-lg" : ""
//                 }`}
//             >
//                 <div className="container mx-auto p-4 flex justify-between items-center">
//                     <h1 className="text-xl font-bold">
//                         Convo<span className="text-slate-600">Vue</span>
//                     </h1>
//
//                 </div>
//             </header>
//
//             {/* Main Content */}
//             <main className="flex-grow flex items-center justify-center">
//                 <div className="">
//
//
//                     <SignUp />
//                 </div>
//             </main>
//
//             {/* Footer */}
//
//         </div>
//     );
// }




'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SignUp } from "@clerk/nextjs"
import { Button } from '@/components/ui/button'

export default function SignUpPage() {
    const router = useRouter()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="bg-white text-gray-900 min-h-screen flex flex-col">
            {/* Header */}
            <header
                className={`fixed w-full top-0 z-50 transition-all duration-300 ${
                    scrolled ? "bg-white shadow-md" : ""
                }`}
            >
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        Coder<span className="text-blue-600">Vue</span>
                    </h1>
                    <Button
                        onClick={() => router.push('/')}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400"
                    >
                        Back to Home
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center pt-16">
                <div className="">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Sign Up to CoderVue</h2>
                    <SignUp />
                </div>
            </main>

            {/* Footer */}

        </div>
    )
}

