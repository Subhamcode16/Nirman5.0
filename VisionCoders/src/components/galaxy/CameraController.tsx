import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraControllerProps {
    focusedPlanetId?: string;
    chatbots?: any[]; // Pass chatbots to find target position
}

export default function CameraController({ focusedPlanetId, chatbots }: CameraControllerProps) {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { camera } = useThree();
    const isTransitioning = useRef(false);

    // Handle focus change
    useEffect(() => {
        if (focusedPlanetId && chatbots) {
            const targetBot = chatbots.find(b => b.id === focusedPlanetId);
            if (targetBot) {
                // Calculate target position based on current orbit angle
                // Note: Since planets move, we might need a more dynamic approach,
                // but for now we'll zoom to where it is at this moment or just close to its orbit
                // A simpler approach for "zoom to planet" in a moving system is to track it in useFrame
                isTransitioning.current = true;
            }
        } else {
            isTransitioning.current = false;
        }
    }, [focusedPlanetId, chatbots]);

    useFrame((state, delta) => {
        // Smooth damping for controls is handled by enableDamping prop

        if (focusedPlanetId && chatbots) {
            const targetBot = chatbots.find(b => b.id === focusedPlanetId);
            if (targetBot) {
                // Calculate current planet position
                const time = state.clock.elapsedTime;
                const angle = time * targetBot.planetData.orbitSpeed + targetBot.planetData.angleOffset;
                const radius = targetBot.planetData.orbitRadius;

                const x = radius * Math.cos(angle);
                const z = radius * Math.sin(angle) * 0.9;
                const y = Math.sin(angle * 2) * 0.3;

                const planetPos = new Vector3(x, y, z);

                // Smoothly interpolate camera position to follow planet
                // Offset camera slightly to see the planet
                const offset = new Vector3(5, 2, 5);
                const targetCamPos = planetPos.clone().add(offset);

                camera.position.lerp(targetCamPos, delta * 2); // 800ms approx speed factor
                controlsRef.current?.target.lerp(planetPos, delta * 2);
            }
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            enableDamping={true} // "Butter" smooth
            dampingFactor={0.1} // Inertial feel
            minDistance={15}
            maxDistance={50}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 6}
            enabled={!focusedPlanetId} // Disable manual control when focused
        />
    );
}
