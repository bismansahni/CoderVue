'use client'

import {motion} from 'framer-motion'

const VoiceCircle = ({delay, isSpeaking}: { delay: number; isSpeaking: boolean }) => (
    <motion.div
        className="w-3 h-3 bg-black  rounded-full"
        animate={{
            scale: isSpeaking ? [1, 3, 1] : 1,
            opacity: isSpeaking ? [0.3, 1, 0.3] : 1,
        }}
        transition={{
            duration: 1,
            repeat: isSpeaking ? Infinity : 0,
            ease: 'easeInOut',
            delay: delay / 1000,
        }}
    />
)

export default function AIVoiceAnimation({isSpeaking}: { isSpeaking: boolean }) {
    return (
        // <div className="flex items-center justify-center space-x-3 h-24">
        <div className="flex items-center justify-center space-x-2 h-16 w-16  rounded-full p-2">
            <VoiceCircle delay={0} isSpeaking={isSpeaking}/>
            <VoiceCircle delay={250} isSpeaking={isSpeaking}/>
            <VoiceCircle delay={500} isSpeaking={isSpeaking}/>
        </div>
    )
}

