import { useRef, useMemo } from 'react';
import { Points } from 'three';
import { useFrame } from '@react-three/fiber';

export default function AsteroidBelt() {
    const asteroidsRef = useRef<Points>(null);

    const asteroidPositions = useMemo(() => {
        const count = 2000;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Between Mars (17) and Jupiter (23) -> ~19-21 radius
            const radius = 19 + Math.random() * 2.5;
            const theta = Math.random() * Math.PI * 2;

            // Slight vertical spread for volume
            const y = (Math.random() - 0.5) * 1.5;

            positions[i * 3] = radius * Math.cos(theta);
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = radius * Math.sin(theta);
        }
        return positions;
    }, []);

    useFrame(() => {
        if (asteroidsRef.current) {
            // Rotate slightly slower than planets
            asteroidsRef.current.rotation.y += 0.0005;
        }
    });

    return (
        <points ref={asteroidsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[asteroidPositions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#cccccc"
                sizeAttenuation
                transparent
                opacity={0.6}
            />
        </points>
    );
}
