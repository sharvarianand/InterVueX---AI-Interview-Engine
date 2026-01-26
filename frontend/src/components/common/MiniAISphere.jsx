import { motion } from 'framer-motion';

/**
 * MiniAISphere - Small animated gradient sphere for use across the app
 * Used as AI avatar/indicator in various contexts
 */
export default function MiniAISphere({ size = 60, animated = true, className = '' }) {
    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            {/* Ambient glow */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: size * 1.4,
                    height: size * 1.4,
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                    filter: 'blur(15px)',
                }}
                animate={animated ? {
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.6, 0.4],
                } : {}}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Main sphere */}
            <motion.div
                className="relative rounded-full overflow-hidden"
                style={{
                    width: size,
                    height: size,
                    background: `
            radial-gradient(ellipse 70% 50% at 30% 25%, rgba(251, 146, 60, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse 60% 60% at 70% 35%, rgba(236, 72, 153, 0.7) 0%, transparent 50%),
            radial-gradient(ellipse 65% 65% at 50% 75%, rgba(139, 92, 246, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse 45% 45% at 25% 60%, rgba(6, 182, 212, 0.6) 0%, transparent 50%),
            linear-gradient(135deg, #6366F1 0%, #8B5CF6 30%, #EC4899 60%, #F97316 100%)
          `,
                    boxShadow: `
            0 0 ${size * 0.4}px rgba(139, 92, 246, 0.4),
            0 0 ${size * 0.8}px rgba(236, 72, 153, 0.2),
            inset 0 0 ${size * 0.3}px rgba(255, 255, 255, 0.05)
          `,
                }}
                animate={animated ? {
                    scale: [1, 1.02, 1],
                } : {}}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                {/* Rotating gradient overlay */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: `
              radial-gradient(ellipse 50% 35% at 30% 30%, rgba(255, 200, 150, 0.4) 0%, transparent 60%),
              radial-gradient(ellipse 45% 40% at 70% 40%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)
            `,
                    }}
                    animate={animated ? {
                        rotate: [0, 360],
                    } : {}}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />

                {/* Highlight */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: '30%',
                        height: '20%',
                        top: '15%',
                        left: '20%',
                        background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                        filter: 'blur(3px)',
                    }}
                />

                {/* Inner glow pulse */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                    }}
                    animate={animated ? {
                        opacity: [0.3, 0.6, 0.3],
                    } : {}}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </motion.div>

            {/* Pulse ring */}
            {animated && (
                <motion.div
                    className="absolute rounded-full border border-purple-500/30"
                    style={{
                        width: size,
                        height: size,
                    }}
                    animate={{
                        scale: [1, 1.3],
                        opacity: [0.5, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut',
                    }}
                />
            )}
        </div>
    );
}
