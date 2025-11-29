export interface PlanetData {
    orbitRadius: number;
    orbitSpeed: number;
    textureType: 'rocky' | 'icy' | 'desert' | 'ocean' | 'volcanic';
    size: number;
    activity: number; // 0-1
    angleOffset: number;
}

export interface ChatBot {
    id: string;
    name: string;
    description: string;
    xp: number;
    pdfCount: number;
    lastActivity: Date;
    planetData: PlanetData;
    isNewlyCreated?: boolean; // Flag for birth animation
}

export interface PlanetProps {
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
    isFocused: boolean;
}
