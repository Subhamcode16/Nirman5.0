/**
 * XP and Leveling System Utilities
 * 
 * Handles all calculations for the gamified planet progression system.
 * Planets grow, glow, and evolve as users study and interact with their chatbots.
 */

// =============================================
// XP Reward Constants
// =============================================

export const XP_REWARDS = {
    UPLOAD_PDF: 30,
    PDF_PROCESSING: 20,
    ASK_QUESTION: 5,
    SUMMARY_COMMAND: 15,
    SHORT_NOTES: 12,
    QUIZ_ME: 20,
    CORRECT_QUIZ_ANSWER: 8,
    LONG_STUDY_SESSION: 50, // 20+ minutes
    DAILY_STREAK_BASE: 25,
    CREATE_BOT: 10,
} as const;

// Export type for XP reward actions
export type XPRewardAction = keyof typeof XP_REWARDS;

// =============================================
// Level Calculation
// =============================================

/**
 * Calculate planet level from total XP
 * Formula: floor((XP / 100) ^ 0.6)
 * 
 * In toon logic: "Every 100 XP = Planet eats a star candy.
 * After enough candies = POWER UP!"
 */
export function calculateLevel(xp: number): number {
    if (xp <= 0) return 1;
    const level = Math.floor(Math.pow(xp / 100, 0.6));
    return Math.max(1, Math.min(level, 10)); // Clamp between 1-10
}

/**
 * Calculate XP required to reach a specific level
 */
export function getXPForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.ceil(Math.pow(level, 1 / 0.6) * 100);
}

/**
 * Get XP required for the next level
 */
export function getXPForNextLevel(currentLevel: number): number {
    return getXPForLevel(currentLevel + 1);
}

/**
 * Get progress percentage to next level (0-100)
 */
export function getLevelProgress(xp: number): number {
    const currentLevel = calculateLevel(xp);
    const currentLevelXP = getXPForLevel(currentLevel);
    const nextLevelXP = getXPForLevel(currentLevel + 1);

    if (currentLevel >= 10) return 100; // Max level

    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
}

/**
 * Get XP remaining until next level
 */
export function getXPToNextLevel(xp: number): number {
    const currentLevel = calculateLevel(xp);
    if (currentLevel >= 10) return 0; // Max level

    const nextLevelXP = getXPForLevel(currentLevel + 1);
    return Math.max(0, nextLevelXP - xp);
}

// =============================================
// Visual Scaling Functions
// =============================================

/**
 * Calculate planet size based on level
 * Formula: baseSize + (level * 0.15)
 * 
 * Toon version: "Eating XP makes the planet thicc."
 */
export function getPlanetScale(level: number, baseSize: number = 0.5): number {
    return baseSize + (level * 0.15);
}

/**
 * Calculate glow intensity based on level
 * Formula: 0.3 + (level * 0.08)
 * 
 * Toon version: "More XP = sparkly aura like magical space hair."
 */
export function getGlowIntensity(level: number): number {
    return 0.3 + (level * 0.08);
}

/**
 * Calculate orbit ring brightness based on total XP
 * Formula: 0.5 + (XP / 5000)
 * 
 * Toon version: "Orbit ring turns into a rainbow swoosh track!"
 */
export function getOrbitBrightness(xp: number): number {
    const brightness = 0.5 + (xp / 5000);
    return Math.min(brightness, 1.5); // Cap at 1.5 for visibility
}

// =============================================
// Planet Evolution Titles
// =============================================

export const PLANET_TITLES: Record<number, string> = {
    1: 'Baby Pebble',
    2: 'Dusty Dumpling',
    3: 'Cloudy Berry',
    4: 'Shiny Marble',
    5: 'Mega Marble',
    6: 'Hot Puffy Boy',
    7: 'Gas Wizard',
    8: 'Blazing Champion',
    9: 'Space Guardian',
    10: 'Titan of the Stars',
};

/**
 * Get the evolution title for a planet based on its level
 */
export function getPlanetTitle(level: number): string {
    return PLANET_TITLES[level] || PLANET_TITLES[1];
}

// =============================================
// XP Action Descriptions (Toon Style)
// =============================================

export const XP_ACTION_DESCRIPTIONS: Record<string, string> = {
    UPLOAD_PDF: 'Planet snacks on new knowledge crystals!',
    PDF_PROCESSING: 'Om nom nom… digesting data!',
    ASK_QUESTION: 'Planet listens wisely.',
    SUMMARY_COMMAND: 'Planet scribbles in its cosmic notebook.',
    SHORT_NOTES: 'Planet condenses wisdom squishily.',
    QUIZ_ME: 'Planet challenges you like a space sensei!',
    CORRECT_QUIZ_ANSWER: 'Brain blast! Planet celebrates.',
    LONG_STUDY_SESSION: 'Planet meditates and glows brighter.',
    DAILY_STREAK: 'Planet returns every day like a reliable space buddy.',
    CREATE_BOT: 'Baby planet is born with a sparkle!',
};

/**
 * Get a fun description for an XP action
 */
export function getXPActionDescription(action: XPRewardAction): string {
    return XP_ACTION_DESCRIPTIONS[action] || 'Planet grows stronger!';
}

// =============================================
// Daily Streak Calculations
// =============================================

/**
 * Calculate XP bonus based on daily streak length
 * Base: 25 XP, increases with streak
 */
export function getDailyStreakXP(streakDays: number): number {
    const base = XP_REWARDS.DAILY_STREAK_BASE;
    const bonus = Math.min(streakDays * 2, 30); // Max +30 bonus
    return base + bonus;
}

/**
 * Check if two dates are consecutive days
 */
export function areConsecutiveDays(date1: Date, date2: Date): boolean {
    const day1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const day2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const diffTime = Math.abs(day2.getTime() - day1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

// =============================================
// Level-Up Detection
// =============================================

/**
 * Check if adding XP will cause a level up
 */
export function willLevelUp(currentXP: number, xpToAdd: number): boolean {
    const currentLevel = calculateLevel(currentXP);
    const newLevel = calculateLevel(currentXP + xpToAdd);
    return newLevel > currentLevel;
}

/**
 * Get level-up info when adding XP
 */
export function getLevelUpInfo(currentXP: number, xpToAdd: number): {
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
    newXP: number;
} {
    const oldLevel = calculateLevel(currentXP);
    const newXP = currentXP + xpToAdd;
    const newLevel = calculateLevel(newXP);

    return {
        leveledUp: newLevel > oldLevel,
        oldLevel,
        newLevel,
        newXP,
    };
}
