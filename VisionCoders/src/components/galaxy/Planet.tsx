import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { useSpring, animated } from '@react-spring/three';
import { Html } from '@react-three/drei';
import { calculateLevel, getGlowIntensity } from '../../lib/xp-utils';
import XPRing from './XPRing';

interface PlanetProps {
    id: string;
    name: string;
    orbitRadius: number;
    orbitSpeed: number;
    size: number;
    textureType: string;
    activity: number;
    xp: number;
    angleOffset: number;
    onClick: () => void;
    onHover?: (isHovered: boolean) => void;
    isFocused: boolean;
}

export default function Planet({
    orbitRadius,
    orbitSpeed,
    size,
    textureType,
    angleOffset,
    name,
    xp,
    onClick,
    onHover,
    isFocused,
}: PlanetProps) {
    const planetRef = useRef<Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Calculate level and visual properties from XP
    const level = calculateLevel(xp);
    const glowIntensity = getGlowIntensity(level);

    // Hover animation
    const { scale } = useSpring({
        scale: hovered ? 1.1 : 1.0,
        config: { tension: 300, friction: 20 },
    });

    // Handle hover state
    const handlePointerOver = () => {
        setHovered(true);
        onHover?.(true);
    };

    const handlePointerOut = () => {
        setHovered(false);
        onHover?.(false);
    };

    // Orbital motion
    useFrame(({ clock }, _delta) => {
        if (planetRef.current && !isFocused) {
            const time = clock.elapsedTime;
            const angle = time * orbitSpeed + angleOffset;

            // Circular orbit to match rings
            const x = orbitRadius * Math.cos(angle);
            const z = orbitRadius * Math.sin(angle); // Removed * 0.9 to match circular ring
            const y = 0;

            planetRef.current.position.set(x, y, z);

            // Slow rotation on own axis
            planetRef.current.rotation.y += 0.002;
        }
    });

    // Get color based on texture type - Updated to solid stylized colors
    const getPlanetColor = (type: string) => {
        const colors: Record<string, string> = {
            rocky: '#A5A5A5',    // Mercury-like Gray
            icy: '#E3E3E3',      // Venus/Pluto-like Off-white
            desert: '#E27B58',   // Mars-like Rust
            ocean: '#4B9CD3',    // Earth-like Blue
            volcanic: '#C88B3A', // Jupiter-like Tan
        };
        return colors[type] || '#A5A5A5';
    };

    const planetColor = getPlanetColor(textureType);

    return (
        <animated.mesh
            ref={planetRef}
            scale={scale}
            onClick={onClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            castShadow
            receiveShadow
        >
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial
                color={planetColor}
                roughness={0.7}
                metalness={0.1}
                flatShading={false}
            />

            {/* Floating Label */}
            <Html
                position={[size * 1.2, size * 0.5, 0]}
                center
                style={{ pointerEvents: 'none', zIndex: 100 }}
            >
                <div className={`px-3 py-1 rounded-full whitespace-nowrap transition-all duration-200 ${hovered
                    ? 'bg-white text-black scale-110 shadow-lg'
                    : 'bg-black/70 text-white backdrop-blur-sm'
                    }`}>
                    <span className="text-[10px] font-sans font-bold tracking-wide">
                        {name}
                    </span>
                </div>
            </Html>

            {/* Atmospheric glow - enhanced based on level */}
            <mesh scale={1.1}>
                <sphereGeometry args={[size, 32, 32]} />
                <meshBasicMaterial
                    color={planetColor}
                    transparent
                    opacity={hovered ? glowIntensity * 0.5 : glowIntensity * 0.3}
                    toneMapped={false}
                />
            </mesh>

            {/* XP Progress Ring */}
            <XPRing xp={xp} planetSize={size} />
        </animated.mesh>
    );
}
