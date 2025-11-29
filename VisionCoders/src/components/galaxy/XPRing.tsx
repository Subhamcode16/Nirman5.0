import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { calculateLevel, getLevelProgress, getPlanetTitle } from '../../lib/xp-utils';

interface XPRingProps {
    xp: number;
    planetSize: number;
    isLevelingUp?: boolean;
}

/**
 * XP Progress Ring Component
 * 
 * Displays a circular progress ring around planets showing XP progress to next level.
 * Features:
 * - Fills based on progress to next level
 * - Glows and pulses when gaining XP
 * - Flashes white when level-up occurs
 * - Shows current level number
 */
export default function XPRing({ xp, planetSize, isLevelingUp = false }: XPRingProps) {
    const ringRef = useRef<THREE.Mesh>(null);
    const level = calculateLevel(xp);
    const progress = getLevelProgress(xp);
    const title = getPlanetTitle(level);

    // Rotation animation
    useFrame(() => {
        if (ringRef.current) {
            ringRef.current.rotation.z += 0.005;
        }
    });

    // Calculate ring dimensions
    const ringRadius = planetSize * 1.8;
    const ringThickness = 0.08;

    // Calculate progress arc (in radians, 0 to 2π)
    const progressAngle = (progress / 100) * Math.PI * 2;

    return (
        <group>
            {/* Background ring (empty portion) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[ringRadius - ringThickness, ringRadius, 64]} />
                <meshBasicMaterial
                    color="#1a1a2e"
                    transparent
                    opacity={0.3}
                    toneMapped={false}
                />
            </mesh>

            {/* Progress ring (filled portion) */}
            <mesh ref={ringRef} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
                <ringGeometry
                    args={[
                        ringRadius - ringThickness,
                        ringRadius,
                        64,
                        1,
                        0,
                        progressAngle,
                    ]}
                />
                <meshBasicMaterial
                    color={isLevelingUp ? '#ffffff' : '#4B9CD3'}
                    transparent
                    opacity={isLevelingUp ? 1.0 : 0.8}
                    toneMapped={false}
                />
            </mesh>

            {/* Glow effect on progress ring */}
            {progress > 0 && (
                <mesh rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
                    <ringGeometry
                        args={[
                            ringRadius - ringThickness * 1.5,
                            ringRadius + ringThickness * 0.5,
                            64,
                            1,
                            0,
                            progressAngle,
                        ]}
                    />
                    <meshBasicMaterial
                        color={isLevelingUp ? '#ffffff' : '#4B9CD3'}
                        transparent
                        opacity={isLevelingUp ? 0.6 : 0.3}
                        toneMapped={false}
                    />
                </mesh>
            )}

            {/* Planet title (evolution stage) */}
            <Html
                position={[0, -planetSize * 2.2, 0]}
                center
                style={{ pointerEvents: 'none' }}
            >
                <div className="text-center">
                    <div className="text-[10px] text-white/70 font-medium tracking-wide">
                        {title}
                    </div>
                    <div className="text-[8px] text-white/50 mt-0.5">
                        {progress.toFixed(0)}% to Lv {level + 1}
                    </div>
                </div>
            </Html>
        </group>
    );
}
