// "use client";
//
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
//
// export default function Home() {
//     const router = useRouter();
//     const [scrolled, setScrolled] = useState(false);
//
//     useEffect(() => {
//         const handleScroll = () => setScrolled(window.scrollY > 50);
//         window.addEventListener("scroll", handleScroll);
//         return () => window.removeEventListener("scroll", handleScroll);
//     }, []);
//
//     return (
//         <div className="min-h-screen bg-black text-white">
//             {/* Header */}
//             <header
//                 className={`fixed w-full top-0 z-50 ${
//                     scrolled ? "bg-black/50 backdrop-blur-md" : ""
//                 }`}
//             >
//                 <div className="container mx-auto p-4 flex justify-between items-center">
//                     <h1 className="text-xl font-bold">
//                         Convo<span className="text-blue-500">Vue</span>
//                     </h1>
//                     <button
//                         onClick={() => router.push("/dashboard")}
//                         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//                     >
//                         Get Started
//                     </button>
//                 </div>
//             </header>
//
//             {/* Hero Section */}
//             <section className="min-h-screen flex flex-col justify-center items-center text-center">
//                 <h2 className="text-4xl font-bold mb-4">
//                     Master Interviews with <span className="text-blue-500">AI</span>
//                 </h2>
//                 <p className="text-lg text-gray-300 mb-6">
//                     Personalized mock interviews and real-time feedback to help you land
//                     your dream job.
//                 </p>
//                 <button
//                     onClick={() => router.push("/sign-up")}
//                     className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600"
//                 >
//                     Start Practicing Now
//                 </button>
//             </section>
//
//             {/* Features Section */}
//             <section className="py-12 bg-gray-900">
//                 <div className="container mx-auto">
//                     <h3 className="text-3xl font-bold text-center mb-8">How It Works</h3>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                         <div className="bg-gray-800 p-6 rounded shadow-lg text-center">
//                             <div className="text-blue-400 text-4xl mb-4">💬</div>
//                             <h4 className="text-xl font-bold mb-2">AI-Powered Questions</h4>
//                             <p className="text-gray-300">
//                                 Tailored interview questions based on your field and experience.
//                             </p>
//                         </div>
//                         <div className="bg-gray-800 p-6 rounded shadow-lg text-center">
//                             <div className="text-yellow-400 text-4xl mb-4">⚡</div>
//                             <h4 className="text-xl font-bold mb-2">Real-time Feedback</h4>
//                             <p className="text-gray-300">
//                                 Instant insights to improve your interview performance.
//                             </p>
//                         </div>
//                         <div className="bg-gray-800 p-6 rounded shadow-lg text-center">
//                             <div className="text-green-400 text-4xl mb-4">👤</div>
//                             <h4 className="text-xl font-bold mb-2">Personalized Coaching</h4>
//                             <p className="text-gray-300">
//                                 Custom strategies to boost your interview skills.
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </section>
//
//             {/* Footer */}
//             <footer className="py-6 bg-black text-center">
//                 <p className="text-gray-400">
//                     &copy; 2024 InterviewMe.AI. All rights reserved.
//                 </p>
//             </footer>
//         </div>
//     );
// }


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
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
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700 transition-all"
                    >
                        Get Started
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-grow flex flex-col justify-center items-center text-center p-6">
                <h2 className="text-4xl font-bold mb-4">
                    Master Interviews with <span className="text-slate-600">AI</span>
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                    Personalized mock interviews and real-time feedback to help you land
                    your dream job.
                </p>
                <button
                    onClick={() => router.push("/sign-up")}
                    className="bg-slate-600 text-white px-6 py-3 rounded hover:bg-slate-700 transition-all"
                >
                    Start Practicing Now
                </button>
            </section>

            {/* Features Section */}
            <section className="py-12 bg-slate-100">
                <div className="container mx-auto">
                    <h3 className="text-3xl font-bold text-center mb-8">How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="text-slate-600 text-4xl mb-4">💬</div>
                            <h4 className="text-xl font-bold mb-2">AI-Powered Questions</h4>
                            <p className="text-slate-600">
                                Tailored interview questions based on your field and experience.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="text-slate-600 text-4xl mb-4">⚡</div>
                            <h4 className="text-xl font-bold mb-2">Real-time Feedback</h4>
                            <p className="text-slate-600">
                                Instant insights to improve your interview performance.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="text-slate-600 text-4xl mb-4">👤</div>
                            <h4 className="text-xl font-bold mb-2">Personalized Coaching</h4>
                            <p className="text-slate-600">
                                Custom strategies to boost your interview skills.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}

        </div>
    );
}
