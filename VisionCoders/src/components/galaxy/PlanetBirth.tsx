import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { animated, useSpring } from '@react-spring/three';
import * as THREE from 'three';

interface PlanetBirthProps {
    position: [number, number, number];
    onComplete: () => void;
}

export default function PlanetBirth({ position, onComplete }: PlanetBirthProps) {
    const particlesRef = useRef<THREE.Points>(null);
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const timeRef = useRef(0);
    const completedRef = useRef(false);

    // Animated scale for the core glow
    const { scale, opacity } = useSpring({
        from: { scale: 0, opacity: 1 },
        to: { scale: 1.5, opacity: 0 },
        config: { duration: 2000 },
    });

    // Create particle system
    useEffect(() => {
        if (!particlesRef.current) return;

        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Random position in a small sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = Math.random() * 0.3;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Velocity pointing outward
            velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * 2;
            velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * 2;
            velocities[i * 3 + 2] = Math.cos(phi) * 2;
        }

        particlesRef.current.geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        );
        particlesRef.current.geometry.setAttribute(
            'velocity',
            new THREE.BufferAttribute(velocities, 3)
        );
    }, []);

    // Animation loop
    useFrame((_state, delta) => {
        timeRef.current += delta;

        // Animate particles
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position;
            const velocities = particlesRef.current.geometry.attributes.velocity;

            for (let i = 0; i < positions.count; i++) {
                positions.array[i * 3] += velocities.array[i * 3] * delta;
                positions.array[i * 3 + 1] += velocities.array[i * 3 + 1] * delta;
                positions.array[i * 3 + 2] += velocities.array[i * 3 + 2] * delta;
            }

            positions.needsUpdate = true;

            // Fade out particles
            const material = particlesRef.current.material as THREE.PointsMaterial;
            material.opacity = Math.max(0, 1 - timeRef.current / 2);
        }

        // Animate rings
        if (ring1Ref.current) {
            ring1Ref.current.scale.set(
                1 + timeRef.current * 2,
                1 + timeRef.current * 2,
                1
            );
            const material = ring1Ref.current.material as THREE.MeshBasicMaterial;
            material.opacity = Math.max(0, 0.6 - timeRef.current / 3);
        }

        if (ring2Ref.current) {
            ring2Ref.current.scale.set(
                1 + timeRef.current * 1.5,
                1 + timeRef.current * 1.5,
                1
            );
            const material = ring2Ref.current.material as THREE.MeshBasicMaterial;
            material.opacity = Math.max(0, 0.4 - timeRef.current / 3.5);
        }

        // Complete animation after 3 seconds
        if (timeRef.current > 3 && !completedRef.current) {
            completedRef.current = true;
            onComplete();
        }
    });

    return (
        <group position={position}>
            {/* Core glow */}
            <animated.mesh scale={scale}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <animated.meshBasicMaterial
                    color="#4B9CD3"
                    transparent
                    opacity={opacity}
                />
            </animated.mesh>

            {/* Particle burst */}
            <points ref={particlesRef}>
                <bufferGeometry />
                <pointsMaterial
                    size={0.08}
                    color="#4B9CD3"
                    transparent
                    opacity={1}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Expanding ring 1 */}
            <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.8, 1, 32]} />
                <meshBasicMaterial
                    color="#4B9CD3"
                    transparent
                    opacity={0.6}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Expanding ring 2 */}
            <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.6, 0.8, 32]} />
                <meshBasicMaterial
                    color="#6BB6FF"
                    transparent
                    opacity={0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Light flash */}
            <pointLight
                color="#4B9CD3"
                intensity={timeRef.current < 0.5 ? 5 : 0}
                distance={10}
            />
        </group>
    );
}
