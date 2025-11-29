interface OrbitRingProps {
    radius: number;
    isHovered?: boolean;
}

export default function OrbitRing({ radius, isHovered = false }: OrbitRingProps) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
            {/* Hairline stroke using RingGeometry with very small width */}
            <ringGeometry args={[radius, radius + 0.05, 128]} />
            <meshBasicMaterial
                color="#FFFFFF"
                transparent
                opacity={isHovered ? 0.5 : 0.15}
                side={2} // DoubleSide
                toneMapped={false}
            />
        </mesh>
    );
}
