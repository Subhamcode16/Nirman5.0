import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Star from './Star';
import Planet from './Planet';
import OrbitRing from './OrbitRing';
import Starfield from './Starfield';
import AsteroidBelt from './AsteroidBelt';
import CameraController from './CameraController';
import PlanetBirth from './PlanetBirth';
import LevelUpAnimation from './LevelUpAnimation';
import ShootingStars from '../ui/ShootingStars';
import { useChatStore } from '../../store/useChatStore';
import { XPToastContainer } from '../ui/XPToast';
import type { ChatBot } from '../../types/galaxy';

interface GalaxySceneProps {
    chatbots: ChatBot[];
    onPlanetClick: (botId: string) => void;
    focusedPlanetId?: string;
}

export default function GalaxyScene({ chatbots, onPlanetClick, focusedPlanetId }: GalaxySceneProps) {
    const orbitRadii = [5, 8, 12, 17, 23];
    const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null);
    const [birthingPlanets, setBirthingPlanets] = useState<string[]>([]);
    const { newPlanetId, clearNewPlanetId, xpToasts, levelUpQueue, dismissXPToast, clearLevelUpQueue } = useChatStore();

    // Detect new planets and trigger birth animation
    useEffect(() => {
        if (newPlanetId && !birthingPlanets.includes(newPlanetId)) {
            setBirthingPlanets(prev => [...prev, newPlanetId]);
        }
    }, [newPlanetId, birthingPlanets]);

    const handleBirthComplete = (planetId: string) => {
        setBirthingPlanets(prev => prev.filter(id => id !== planetId));
        clearNewPlanetId();
    };

    return (
        <div className="w-full h-full relative bg-[radial-gradient(circle_at_center,#0B0B15_0%,#050505_100%)]">
            {/* Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,20,0.4)_100%)] z-0" />

            {/* Shooting Stars */}
            <ShootingStars />

            <Canvas
                camera={{ position: [0, 40, 20], fov: 60, near: 0.1, far: 1000 }}
                gl={{
                    antialias: true,
                    alpha: true,
                }}
                shadows
                className="w-full h-full z-10"
            >
                {/* Fog for depth - adjusted to match deep space */}
                <fog attach="fog" args={['#050505', 30, 100]} />

                {/* Lighting */}
                <ambientLight intensity={0.15} color="#1a1a2e" />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-far={500}
                    shadow-camera-left={-50}
                    shadow-camera-right={50}
                    shadow-camera-top={50}
                    shadow-camera-bottom={-50}
                />

                {/* Background starfield */}
                <Starfield />

                {/* Central star */}
                <Star />

                {/* Asteroid Belt (between Mars and Jupiter) */}
                <AsteroidBelt />

                {/* Orbit rings */}
                {orbitRadii.map((radius, index) => {
                    // Check if any planet on this orbit is hovered
                    const isHovered = chatbots.some(bot =>
                        bot.id === hoveredPlanetId && bot.planetData.orbitRadius === radius
                    );

                    return (
                        <OrbitRing key={index} radius={radius} isHovered={isHovered} />
                    );
                })}

                {/* Planets (chatbots) - Enforce 1 per orbit */}
                {chatbots.slice(0, 5).map((bot, index) => {
                    // Assign orbit based on index to ensure 1 per orbit
                    const assignedOrbitRadius = orbitRadii[index];
                    const isBirthing = birthingPlanets.includes(bot.id);

                    // Don't render planet if it's currently birthing
                    if (isBirthing) return null;

                    return (
                        <Planet
                            key={bot.id}
                            id={bot.id}
                            name={bot.name}
                            orbitRadius={assignedOrbitRadius}
                            orbitSpeed={bot.planetData.orbitSpeed}
                            size={bot.planetData.size}
                            textureType={bot.planetData.textureType}
                            activity={bot.planetData.activity}
                            xp={bot.xp}
                            angleOffset={bot.planetData.angleOffset}
                            onClick={() => onPlanetClick(bot.id)}
                            onHover={(isHovered) => setHoveredPlanetId(isHovered ? bot.id : null)}
                            isFocused={focusedPlanetId === bot.id}
                        />
                    );
                })}

                {/* Birth animations */}
                {birthingPlanets.map(planetId => {
                    const bot = chatbots.find(b => b.id === planetId);
                    if (!bot) return null;

                    const index = chatbots.indexOf(bot);
                    const assignedOrbitRadius = orbitRadii[Math.min(index, 4)];
                    const angle = bot.planetData.angleOffset;
                    const position: [number, number, number] = [
                        assignedOrbitRadius * Math.cos(angle),
                        0,
                        assignedOrbitRadius * Math.sin(angle),
                    ];

                    return (
                        <PlanetBirth
                            key={planetId}
                            position={position}
                            onComplete={() => handleBirthComplete(planetId)}
                        />
                    );
                })}

                {/* Level-up animations */}
                {levelUpQueue.map(levelUp => {
                    const bot = chatbots.find(b => b.id === levelUp.botId);
                    if (!bot) return null;

                    const index = chatbots.indexOf(bot);
                    const assignedOrbitRadius = orbitRadii[Math.min(index, 4)];
                    const angle = bot.planetData.angleOffset;
                    const position: [number, number, number] = [
                        assignedOrbitRadius * Math.cos(angle),
                        0,
                        assignedOrbitRadius * Math.sin(angle),
                    ];

                    return (
                        <LevelUpAnimation
                            key={`levelup-${levelUp.botId}`}
                            position={position}
                            planetSize={bot.planetData.size}
                            oldLevel={levelUp.oldLevel}
                            newLevel={levelUp.newLevel}
                            onComplete={() => clearLevelUpQueue(levelUp.botId)}
                        />
                    );
                })}

                {/* Camera controls */}
                <CameraController focusedPlanetId={focusedPlanetId} chatbots={chatbots} />

                {/* Post-processing effects */}
                <EffectComposer>
                    <Bloom
                        intensity={0.8}
                        luminanceThreshold={0.7}
                        luminanceSmoothing={0.9}
                        mipmapBlur
                    />
                </EffectComposer>
            </Canvas>

            {/* XP Toast Notifications */}
            <XPToastContainer
                toasts={xpToasts.map(toast => ({
                    id: toast.id,
                    xpAmount: toast.xpAmount,
                    action: toast.action,
                    planetName: toast.planetName,
                }))}
                onDismiss={dismissXPToast}
            />
        </div>
    );
}
