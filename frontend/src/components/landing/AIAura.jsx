import { useEffect, useRef } from 'react';

/**
 * AIAura - 3D Interactive Spline Animation
 * Beautiful organic sphere with mesh gradient
 */
export default function AIAura({ size = 400, showBadge = true }) {
    const scriptLoadedRef = useRef(false);

    useEffect(() => {
        if (scriptLoadedRef.current) return;

        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js';
        script.onload = () => {
            scriptLoadedRef.current = true;
        };
        document.head.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, []);

    return (
        <div
            className="relative rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-3 shadow-xl"
            style={{ width: size, height: size }}
        >
            {/* Ambient glow background */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute -top-48 left-1/2 -translate-x-1/2 w-[90vw] h-[90vw] rounded-full opacity-25 blur-3xl"
                    style={{
                        background:
                            'radial-gradient(circle at center, rgba(147,51,234,0.35), rgba(59,130,246,0.25), rgba(249,115,22,0.20) 60%, transparent 70%)',
                    }}
                />
            </div>

            {/* Spline 3D viewer */}
            <div className="relative z-10 aspect-square rounded-xl overflow-hidden bg-black/30">
                <spline-viewer
                    url="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {/* Badge */}
            {showBadge && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                    AI Aura Animation
                </div>
            )}
        </div>
    );
}
