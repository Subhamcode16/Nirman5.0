import { useRef, useMemo } from 'react';
import { Points } from 'three';
import { useFrame } from '@react-three/fiber';

export default function Starfield() {
    const dustRef = useRef<Points>(null);
    const sharpRef = useRef<Points>(null);

    // Layer A: Faint dust (more particles, smaller, spread out)
    const dustPositions = useMemo(() => {
        const count = 600; // Increased to 600
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // Distribute stars in a disk/ring structure
            const r = 20 + Math.random() * 130;
            const theta = Math.random() * Math.PI * 2;
            const ySpread = (Math.random() - 0.5) * 20 * (1 - r / 200);

            positions[i * 3] = r * Math.cos(theta);
            positions[i * 3 + 1] = ySpread;
            positions[i * 3 + 2] = r * Math.sin(theta);
        }
        return positions;
    }, []);

    // Layer B: Bright sharp stars (fewer, distinct)
    const sharpPositions = useMemo(() => {
        const count = 200; // Increased to 200
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 15 + Math.random() * 140;
            const theta = Math.random() * Math.PI * 2;
            const ySpread = (Math.random() - 0.5) * 30 * (1 - r / 200);

            positions[i * 3] = r * Math.cos(theta);
            positions[i * 3 + 1] = ySpread;
            positions[i * 3 + 2] = r * Math.sin(theta);
        }
        return positions;
    }, []);

    // Subtle rotation for parallax effect
    useFrame(() => {
        if (dustRef.current) dustRef.current.rotation.y += 0.00005;
        if (sharpRef.current) sharpRef.current.rotation.y += 0.0001;
    });

    return (
        <>
            {/* Layer A: Static, faint dust (40% opacity) */}
            <points ref={dustRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[dustPositions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial size={0.2} color="#ffffff" sizeAttenuation transparent opacity={0.4} />
            </points>

            {/* Layer B: Bright, sharp stars (100% opacity) */}
            <points ref={sharpRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[sharpPositions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial size={0.4} color="#ffffff" sizeAttenuation transparent opacity={1.0} />
            </points>
        </>
    );
}
