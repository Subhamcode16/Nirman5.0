import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface LevelUpAnimationProps {
    position: [number, number, number];
    planetSize: number;
    oldLevel: number;
    newLevel: number;
    onComplete: () => void;
}

/**
 * Level-Up Celebration Animation
 * 
 * Epic toon-style animation sequence when a planet levels up:
 * 1. Ring Overcharge: "BOOP—BOOP—BOOP—FLASH!"
 * 2. Planet Expansion: Schlorp! expands slightly
 * 3. Shockwave: Ripple across space like a cartoon "POOF!"
 * 4. Orbit Ring Color Change: new theme unlocked
 * 5. Toast Notification: "History Planet reached Level 4! Yayyyy!"
 */
export default function LevelUpAnimation({
    position,
    planetSize,
    oldLevel,
    newLevel,
    onComplete,
}: LevelUpAnimationProps) {
    const shockwaveRef = useRef<THREE.Mesh>(null);
    const burstRef = useRef<THREE.Group>(null);
    const timeRef = useRef(0);
    const hasCompleted = useRef(false);

    useFrame((_, delta) => {
        timeRef.current += delta;

        // Animation phases
        const phase1Duration = 0.5; // Ring overcharge
        const phase2Duration = 0.3; // Planet expansion
        const phase3Duration = 0.6; // Shockwave
        const totalDuration = phase1Duration + phase2Duration + phase3Duration;

        if (timeRef.current >= totalDuration && !hasCompleted.current) {
            hasCompleted.current = true;
            onComplete();
        }

        // Phase 3: Shockwave ripple
        if (shockwaveRef.current && timeRef.current > phase1Duration + phase2Duration) {
            const shockwaveTime = timeRef.current - (phase1Duration + phase2Duration);
            const progress = shockwaveTime / phase3Duration;

            shockwaveRef.current.scale.setScalar(1 + progress * 5);
            const material = shockwaveRef.current.material as THREE.MeshBasicMaterial;
            if (material) {
                material.opacity = Math.max(0, 1 - progress);
            }
        }

        // Particle burst rotation
        if (burstRef.current) {
            burstRef.current.rotation.z += delta * 2;
        }
    });

    return (
        <group position={position}>
            {/* Ring Overcharge Flash */}
            {timeRef.current < 0.5 && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[planetSize * 1.7, planetSize * 1.9, 64]} />
                    <meshBasicMaterial
                        color="#ffffff"
                        transparent
                        opacity={Math.sin(timeRef.current * 20) * 0.8 + 0.2}
                        toneMapped={false}
                    />
                </mesh>
            )}

            {/* Shockwave Ripple */}
            <mesh ref={shockwaveRef} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[planetSize * 0.9, planetSize * 1.1, 64]} />
                <meshBasicMaterial
                    color="#4B9CD3"
                    transparent
                    opacity={0.8}
                    toneMapped={false}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Particle Burst */}
            <group ref={burstRef}>
                {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    const distance = planetSize * 2;
                    const x = Math.cos(angle) * distance;
                    const z = Math.sin(angle) * distance;

                    return (
                        <mesh key={i} position={[x, 0, z]}>
                            <sphereGeometry args={[0.1, 8, 8]} />
                            <meshBasicMaterial
                                color="#FFD700"
                                transparent
                                opacity={Math.max(0, 1 - timeRef.current / 1.4)}
                                toneMapped={false}
                            />
                        </mesh>
                    );
                })}
            </group>

            {/* "LEVEL UP!" Text Bubble */}
            <Html center style={{ pointerEvents: 'none' }}>
                <div
                    className="animate-bounce"
                    style={{
                        animation: 'bounce 0.5s ease-in-out',
                    }}
                >
                    <div
                        className="
                            px-6 py-3 rounded-2xl
                            bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500
                            text-white font-black text-2xl
                            shadow-2xl border-4 border-white
                            transform rotate-[-5deg]
                        "
                        style={{
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        }}
                    >
                        LEVEL UP!
                    </div>
                    <div className="text-center mt-2 text-white font-bold text-sm drop-shadow-lg">
                        Level {oldLevel} → {newLevel} 🎉
                    </div>
                </div>
            </Html>
        </group>
    );
}
