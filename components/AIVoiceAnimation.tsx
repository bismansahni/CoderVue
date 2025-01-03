

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const VoiceCircle = ({ delay = 0, isSpeaking }: { delay: number, isSpeaking: boolean }) => {
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (isSpeaking) {
            setIsAnimating(true); // Start animation when speaking
        } else {
            setIsAnimating(false); // Stop animation when not speaking
        }
    }, [isSpeaking]); // Trigger animation on isSpeaking change

    useEffect(() => {
        const interval = setInterval(() => {
            if (isSpeaking) {
                setIsAnimating((prev) => !prev);
            }
        }, 1000 + delay);

        return () => clearInterval(interval);
    }, [delay, isSpeaking]); // Adjust interval based on speaking state

    return (
        <motion.div
            className="w-4 h-4 bg-black rounded-full"
            animate={{
                scale: isAnimating ? [1, 1.5, 1] : 1,
                opacity: isAnimating ? [0.3, 1, 0.3] : 0.3,
            }}
            transition={{
                duration: 1,
                ease: "easeInOut",
            }}
        />
    )
}

export default function BoxedChatGPTVoice() {
    const [isSpeaking] = useState(false)

    // Handle the speech synthesis events to control the dot animation
// Example usage of speak function
    useEffect(() => {
        // speak("Hello! I will be taking your interview today. Please remain calm and relaxed throughout the interview.");
    }, []);

    return (
        <div className="bg-beige-100 text-slate-800 p-6 rounded-lg">
            <div className="flex items-center justify-center space-x-3 h-16">
                <VoiceCircle delay={0} isSpeaking={isSpeaking} />
                <VoiceCircle delay={250} isSpeaking={isSpeaking} />
                <VoiceCircle delay={500} isSpeaking={isSpeaking} />
            </div>
        </div>
    );
}
