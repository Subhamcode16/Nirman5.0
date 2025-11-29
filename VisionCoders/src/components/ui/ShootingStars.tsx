import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Star {
    id: number;
    startX: number;
    startY: number;
    delay: number;
    duration: number;
    size: number;
    opacity: number;
}

export default function ShootingStars() {
    const [stars, setStars] = useState<Star[]>([]);

    useEffect(() => {
        // Generate initial stars
        const initialStars: Star[] = Array.from({ length: 8 }, (_, i) => ({
            id: i,
            startX: Math.random() * 30, // Start from left 30% of screen
            startY: Math.random() * 30, // Start from top 30% of screen
            delay: i * 3, // Stagger by 3 seconds
            duration: 5 + Math.random() * 5, // 5-10 seconds duration (slower)
            size: 1 + Math.random() * 2, // 1-3px
            opacity: 0.4 + Math.random() * 0.4, // 0.4-0.8 opacity
        }));
        setStars(initialStars);

        // Spawn new stars at random intervals
        const spawnInterval = setInterval(() => {
            const newStar: Star = {
                id: Date.now(),
                startX: Math.random() * 30,
                startY: Math.random() * 30,
                delay: 0,
                duration: 5 + Math.random() * 5,
                size: 1 + Math.random() * 2,
                opacity: 0.4 + Math.random() * 0.4,
            };

            setStars(prev => [...prev.slice(-7), newStar]); // Keep last 8 stars
        }, 4000 + Math.random() * 3000); // Random interval 4-7 seconds

        return () => clearInterval(spawnInterval);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute"
                    style={{
                        left: `${star.startX}%`,
                        top: `${star.startY}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        rotate: '45deg', // Align with the diagonal movement
                    }}
                    initial={{
                        x: 0,
                        y: 0,
                        opacity: 0,
                    }}
                    animate={{
                        x: ['-20vmax', '150vmax'], // Use vmax to ensure consistent diagonal speed/angle
                        y: ['-20vmax', '150vmax'],
                        opacity: [0, star.opacity, star.opacity, 0],
                    }}
                    transition={{
                        duration: star.duration,
                        delay: star.delay,
                        repeat: Infinity,
                        repeatDelay: Math.random() * 10 + 10, // Randomize repeat delay
                        ease: 'linear',
                        times: [0, 0.1, 0.9, 1],
                    }}
                >
                    {/* Core star */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(200,220,255,0.8) 50%, transparent 100%)',
                            boxShadow: `
                                0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8),
                                0 0 ${star.size * 4}px rgba(200, 220, 255, 0.6),
                                0 0 ${star.size * 6}px rgba(150, 180, 255, 0.4)
                            `,
                        }}
                    />

                    {/* Tail blur effect */}
                    <div
                        className="absolute"
                        style={{
                            width: `${star.size * 40}px`,
                            height: `${star.size}px`,
                            right: `${star.size}px`,
                            top: 0,
                            background: `linear-gradient(
                                to left,
                                rgba(255, 255, 255, ${star.opacity * 0.6}) 0%,
                                rgba(200, 220, 255, ${star.opacity * 0.4}) 20%,
                                rgba(150, 180, 255, ${star.opacity * 0.2}) 40%,
                                transparent 100%
                            )`,
                            filter: 'blur(1px)',
                            transformOrigin: 'right center',
                        }}
                    />

                    {/* Soft glow bloom */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: `${star.size * 8}px`,
                            height: `${star.size * 8}px`,
                            left: `${-star.size * 3.5}px`,
                            top: `${-star.size * 3.5}px`,
                            background: `radial-gradient(circle, rgba(200, 220, 255, ${star.opacity * 0.3}) 0%, transparent 70%)`,
                            filter: 'blur(4px)',
                        }}
                    />
                </motion.div>
            ))}
        </div>
    );
}
