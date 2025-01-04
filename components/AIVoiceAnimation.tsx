


'use client'

import { motion } from 'framer-motion'

const VoiceCircle = ({ delay, isSpeaking }: { delay: number; isSpeaking: boolean }) => (
    <motion.div
        className="w-4 h-4 bg-blue-600 rounded-full"
        animate={{
            scale: isSpeaking ? [1, 1.5, 1] : 1,
            opacity: isSpeaking ? [0.3, 1, 0.3] : 0.3,
        }}
        transition={{
            duration: 1,
            repeat: isSpeaking ? Infinity : 0,
            ease: 'easeInOut',
            delay: delay / 1000,
        }}
    />
)

export default function AIVoiceAnimation({ isSpeaking }: { isSpeaking: boolean }) {
    return (
        <div className="flex items-center justify-center space-x-3 h-24">
            <VoiceCircle delay={0} isSpeaking={isSpeaking} />
            <VoiceCircle delay={250} isSpeaking={isSpeaking} />
            <VoiceCircle delay={500} isSpeaking={isSpeaking} />
        </div>
    )
}

