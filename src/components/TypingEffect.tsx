
import * as React from 'react';
import { motion, useInView } from 'framer-motion';

interface TypingEffectProps {
    text: string;
}

export function TypingEffect({ text = 'Typing Effect' }: TypingEffectProps) {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });
    
    return (
        <motion.div
            ref={ref}
        >
            {text.split('').map((letter, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.05, delay: index * 0.05 }}
                >
                    {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
            ))}
        </motion.div>
    );
}
