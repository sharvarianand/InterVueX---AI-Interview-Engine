import { motion } from 'framer-motion';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-dark-900 flex items-center justify-center z-50">
            {/* Background gradient effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-indigo/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/15 rounded-full blur-3xl animate-pulse animate-delay-500" />
            </div>

            {/* Loading content */}
            <div className="relative flex flex-col items-center gap-8">
                {/* AI Aura loader */}
                <div className="relative w-24 h-24">
                    {/* Outer ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-accent-indigo/30"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Middle ring */}
                    <motion.div
                        className="absolute inset-2 rounded-full border-2 border-accent-purple/40"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Inner glow */}
                    <motion.div
                        className="absolute inset-4 rounded-full bg-gradient-to-br from-accent-indigo to-accent-purple"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full shadow-glow-sm" />
                    </div>
                </div>

                {/* Loading text */}
                <motion.div
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-xl font-display font-semibold gradient-text">InterVueX</h2>
                    <p className="text-white/50 text-sm">Loading your experience...</p>
                </motion.div>

                {/* Progress dots */}
                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-accent-indigo"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
