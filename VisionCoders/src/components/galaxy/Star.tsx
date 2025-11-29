import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export default function Star() {
    const starRef = useRef<Mesh>(null);
    const glowRef = useRef<Mesh>(null);

    // Pulsation animation (Breathing effect)
    useFrame(({ clock }) => {
        const time = clock.elapsedTime;
        if (starRef.current) {
            // Subtle scale pulsation
            const scale = 1 + Math.sin(time * 0.8) * 0.02;
            starRef.current.scale.setScalar(scale);
        }
        if (glowRef.current) {
            // Glow pulses slightly out of sync for organic feel
            const glowScale = 1.2 + Math.sin(time * 0.8 - 0.5) * 0.05;
            glowRef.current.scale.setScalar(glowScale);
        }
    });

    return (
        <group>
            {/* Core - Bright Yellow/White Center */}
            <mesh ref={starRef} position={[0, 0, 0]}>
                <sphereGeometry args={[2, 64, 64]} />
                <meshBasicMaterial color="#FFFFE0" toneMapped={false} />
            </mesh>

            {/* Inner Glow - Gold/Orange */}
            <mesh ref={glowRef} position={[0, 0, 0]}>
                <sphereGeometry args={[2.1, 32, 32]} />
                <meshBasicMaterial
                    color="#FFD700"
                    transparent
                    opacity={0.6}
                    toneMapped={false}
                />
            </mesh>

            {/* Mid Glow - Orange/Red */}
            <mesh scale={1.2}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial
                    color="#FF4500"
                    transparent
                    opacity={0.3}
                    toneMapped={false}
                />
            </mesh>

            {/* Outer Bloom - Deep Red/Heat */}
            <mesh scale={1.5}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial
                    color="#8B0000"
                    transparent
                    opacity={0.15}
                    toneMapped={false}
                />
            </mesh>

            {/* Point light from star - Warm Orange-Yellow */}
            <pointLight position={[0, 0, 0]} intensity={2.5} distance={100} decay={2} color="#FFD700" />
        </group>
    );
}
