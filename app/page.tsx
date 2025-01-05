
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Code, Play, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
    const router = useRouter()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="bg-white text-gray-900 min-h-screen flex flex-col">
            {/* Header */}
            <header
                className={`fixed w-full top-0 z-50 transition-all duration-300 ${
                    scrolled ? 'bg-white shadow-md' : ''
                }`}
            >
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        Coder<span className="text-blue-600">Vue</span>
                    </h1>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 rounded-full"
                    >
                        Login
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-grow flex flex-col justify-center items-center text-center p-6 pt-24">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-5xl font-extrabold mb-6 leading-tight text-gray-900">
                        Master Coding Interviews with Real-Time Practice
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Experience in-person style coding interviews with dynamic questions and instant feedback.
                        Elevate your skills and confidence for your next tech interview.
                    </p>
                    <Button
                        onClick={() => router.push('/sign-up')}
                        size="lg"
                        className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white animate-pulse rounded-full"
                    >
                        Start Practicing Now
                    </Button>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose CoderVue?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <FeatureCard
                            icon={<Code className="w-12 h-12 text-blue-600"/>}
                            title="Real-Time Coding Environment"
                            description="Write and run code in a realistic IDE, just like in actual interviews."
                        />
                        <FeatureCard
                            icon={<Users className="w-12 h-12 text-blue-600"/>}
                            title="Dynamic Interview Scenarios"
                            description="Face unpredictable questions and challenges, simulating real interview conditions."
                        />
                        <FeatureCard
                            icon={<Play className="w-12 h-12 text-blue-600"/>}
                            title="Instant Feedback & Analysis"
                            description="Receive immediate insights on your performance and areas for improvement."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-3xl font-bold mb-6">Ready to Ace Your Next Coding Interview?</h3>
                    <p className="text-xl mb-8">Join the growing community of developers sharpening their skills with
                        CoderVue—your journey starts here</p>
                    <Button
                        onClick={() => router.push('/sign-up')}
                        variant="secondary"
                        size="lg"
                        className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 rounded-full"
                    >
                        Get Started
                    </Button>
                </div>
            </section>


            <footer className="bg-gray-100 py-8">
                <div className="container mx-auto px-4 text-center text-gray-600">
                    <p>
                        A Creation by: <a href="https://www.linkedin.com/in/bismansahni/" target="_blank"
                                          rel="noopener noreferrer" className="text-blue-500 hover:underline">Bisman
                        Sahni</a>
                    </p>
                    <p>
                        Connect with me:
                        <a href="https://github.com/bismansahni" target="_blank" rel="noopener noreferrer"
                           className="text-blue-500 hover:underline mx-2">GitHub</a> |
                        <a href="https://www.linkedin.com/in/bismansahni/" target="_blank" rel="noopener noreferrer"
                           className="text-blue-500 hover:underline mx-2">LinkedIn</a> |
                        <a href="mailto:bismansahni@outlook.com" className="text-blue-500 hover:underline mx-2">Email</a>
                    </p>
                </div>
            </footer>
        </div>
    )
}

type FeatureCardProps = {
    icon: React.ReactNode; // For React components or JSX elements
    title: string;         // Title is a string
    description: string;   // Description is a string
};

function FeatureCard({icon, title, description}: FeatureCardProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="inline-block mb-4">{icon}</div>
            <h4 className="text-xl font-bold mb-2 text-gray-900">{title}</h4>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}

