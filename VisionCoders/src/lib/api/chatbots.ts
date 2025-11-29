import { supabase } from '../supabase';
import type { ChatBot, PlanetData } from '../../types/galaxy';
import { calculateLevel, getLevelUpInfo, getPlanetScale } from '../xp-utils';

// =============================================
// Type Definitions
// =============================================

interface CreateChatbotInput {
    name: string;
    description: string;
}

interface DatabaseChatbot {
    id: string;
    user_id: string;
    name: string;
    description: string;
    xp: number;
    pdf_count: number;
    last_activity: string;
    orbit_radius: number;
    orbit_speed: number;
    texture_type: 'rocky' | 'icy' | 'desert' | 'ocean' | 'volcanic';
    planet_size: number;
    activity: number;
    angle_offset: number;
    created_at: string;
    updated_at: string;
}

// =============================================
// Planet Data Generation
// =============================================

const orbitRadii = [5, 8, 12, 17, 23];
const textureTypes: PlanetData['textureType'][] = ['rocky', 'icy', 'desert', 'ocean', 'volcanic'];

function generatePlanetData(existingCount: number): PlanetData {
    const orbitRing = existingCount % 5;
    const orbitRadius = orbitRadii[orbitRing];

    return {
        orbitRadius,
        orbitSpeed: 0.5 / orbitRadius,
        textureType: textureTypes[Math.floor(Math.random() * textureTypes.length)],
        size: 0.5,
        activity: 0.3,
        angleOffset: Math.random() * Math.PI * 2,
    };
}

// =============================================
// Transform Functions
// =============================================

function transformToChatBot(dbBot: DatabaseChatbot): ChatBot {
    return {
        id: dbBot.id,
        name: dbBot.name,
        description: dbBot.description,
        xp: dbBot.xp,
        pdfCount: dbBot.pdf_count,
        lastActivity: new Date(dbBot.last_activity),
        planetData: {
            orbitRadius: dbBot.orbit_radius,
            orbitSpeed: dbBot.orbit_speed,
            textureType: dbBot.texture_type,
            size: dbBot.planet_size,
            activity: dbBot.activity,
            angleOffset: dbBot.angle_offset,
        },
    };
}

// =============================================
// API Functions
// =============================================

/**
 * Create a new chatbot for the authenticated user
 */
export async function createChatbot(data: CreateChatbotInput): Promise<ChatBot> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        throw new Error('Not authenticated');
    }

    // Get existing chatbot count to determine orbit
    const { count } = await supabase
        .from('chatbots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.user.id);

    const existingCount = count || 0;
    const planetData = generatePlanetData(existingCount);

    // Insert new chatbot
    const { data: chatbot, error } = await supabase
        .from('chatbots')
        .insert({
            user_id: userData.user.id,
            name: data.name,
            description: data.description,
            orbit_radius: planetData.orbitRadius,
            orbit_speed: planetData.orbitSpeed,
            texture_type: planetData.textureType,
            planet_size: planetData.size,
            activity: planetData.activity,
            angle_offset: planetData.angleOffset,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating chatbot:', error);
        throw new Error(`Failed to create chatbot: ${error.message}`);
    }

    return transformToChatBot(chatbot as DatabaseChatbot);
}

/**
 * Fetch all chatbots for the authenticated user
 */
export async function fetchUserChatbots(): Promise<ChatBot[]> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        console.warn('Not authenticated, returning empty array');
        return [];
    }

    const { data, error } = await supabase
        .from('chatbots')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching chatbots:', error);
        throw new Error(`Failed to fetch chatbots: ${error.message}`);
    }

    return (data as DatabaseChatbot[]).map(transformToChatBot);
}

/**
 * Fetch a single chatbot by ID
 */
export async function fetchChatbotById(id: string): Promise<ChatBot | null> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
        .from('chatbots')
        .select('*')
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found
        }
        console.error('Error fetching chatbot:', error);
        throw new Error(`Failed to fetch chatbot: ${error.message}`);
    }

    return transformToChatBot(data as DatabaseChatbot);
}

/**
 * Update a chatbot's information
 */
export async function updateChatbot(
    id: string,
    updates: Partial<Pick<ChatBot, 'name' | 'description'>>
): Promise<ChatBot> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
        .from('chatbots')
        .update({
            name: updates.name,
            description: updates.description,
            last_activity: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating chatbot:', error);
        throw new Error(`Failed to update chatbot: ${error.message}`);
    }

    return transformToChatBot(data as DatabaseChatbot);
}

/**
 * Update a chatbot's activity level (for planet glow effect)
 */
export async function updateChatbotActivity(id: string, activity: number): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        throw new Error('Not authenticated');
    }

    const { error } = await supabase
        .from('chatbots')
        .update({
            activity: Math.max(0, Math.min(1, activity)), // Clamp between 0 and 1
            last_activity: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userData.user.id);

    if (error) {
        console.error('Error updating chatbot activity:', error);
        throw new Error(`Failed to update chatbot activity: ${error.message}`);
    }
}

/**
 * Delete a chatbot and all associated data
 */
export async function deleteChatbot(id: string): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        throw new Error('Not authenticated');
    }

    // Delete associated PDFs from storage
    const { data: pdfDocs } = await supabase
        .from('pdf_documents')
        .select('file_path')
        .eq('chatbot_id', id);

    if (pdfDocs && pdfDocs.length > 0) {
        const filePaths = pdfDocs.map(doc => doc.file_path);
        await supabase.storage.from('pdf-documents').remove(filePaths);
    }

    // Delete chatbot (cascades to pdf_documents and document_chunks)
    const { error } = await supabase
        .from('chatbots')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);

    if (error) {
        console.error('Error deleting chatbot:', error);
        throw new Error(`Failed to delete chatbot: ${error.message}`);
    }
}

/**
 * Increment chatbot XP (simple version, no return value)
 */
export async function addChatbotXP(id: string, xpToAdd: number): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        throw new Error('Not authenticated');
    }

    // Fetch current XP and planet size
    const { data: chatbot } = await supabase
        .from('chatbots')
        .select('xp, planet_size')
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .single();

    if (!chatbot) {
        throw new Error('Chatbot not found');
    }

    const currentXP = chatbot.xp || 0;
    const newXP = currentXP + xpToAdd;
    const newLevel = calculateLevel(newXP);
    const newSize = getPlanetScale(newLevel, 0.5);

    // Update XP and planet size
    const { error } = await supabase
        .from('chatbots')
        .update({
            xp: newXP,
            planet_size: newSize,
            last_activity: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userData.user.id);

    if (error) {
        console.error('Error adding XP:', error);
        throw new Error(`Failed to add XP: ${error.message}`);
    }
}

/**
 * Add XP and return level-up information
 * Use this when you need to trigger level-up animations
 */
export async function addXPWithLevelCheck(
    id: string,
    xpToAdd: number
): Promise<{
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
    newXP: number;
    bot: ChatBot;
}> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        throw new Error('Not authenticated');
    }

    // Fetch current chatbot data
    const { data: chatbot } = await supabase
        .from('chatbots')
        .select('*')
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .single();

    if (!chatbot) {
        throw new Error('Chatbot not found');
    }

    const currentXP = chatbot.xp || 0;
    const levelUpInfo = getLevelUpInfo(currentXP, xpToAdd);
    const newSize = getPlanetScale(levelUpInfo.newLevel, 0.5);

    // Update XP and planet size
    const { data: updatedBot, error } = await supabase
        .from('chatbots')
        .update({
            xp: levelUpInfo.newXP,
            planet_size: newSize,
            last_activity: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .select()
        .single();

    if (error || !updatedBot) {
        console.error('Error adding XP:', error);
        throw new Error(`Failed to add XP: ${error?.message || 'Unknown error'}`);
    }

    return {
        ...levelUpInfo,
        bot: transformToChatBot(updatedBot as DatabaseChatbot),
    };
}

// =============================================
// Daily Streak Functions
// =============================================

/**
 * Get the current daily streak for a user
 */
export async function getDailyStreak(userId: string): Promise<number> {
    const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, last_activity_date')
        .eq('user_id', userId)
        .single();

    if (error) {
        // If no streak record exists, return 0
        if (error.code === 'PGRST116') {
            return 0;
        }
        console.error('Error fetching streak:', error);
        return 0;
    }

    return data?.current_streak || 0;
}

/**
 * Update daily streak and return new streak count
 */
export async function updateDailyStreak(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Get existing streak data
    const { data: existingStreak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

    let newStreak = 1;
    let longestStreak = 1;

    if (existingStreak) {
        const lastActivityDate = new Date(existingStreak.last_activity_date);
        lastActivityDate.setHours(0, 0, 0, 0);
        const lastActivityStr = lastActivityDate.toISOString().split('T')[0];

        // If already logged in today, return current streak
        if (lastActivityStr === todayStr) {
            return existingStreak.current_streak;
        }

        // Check if consecutive day
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActivityStr === yesterdayStr) {
            // Consecutive day - increment streak
            newStreak = existingStreak.current_streak + 1;
        } else {
            // Streak broken - reset to 1
            newStreak = 1;
        }

        longestStreak = Math.max(newStreak, existingStreak.longest_streak);
    }

    // Upsert streak data
    const { error } = await supabase
        .from('user_streaks')
        .upsert({
            user_id: userId,
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_activity_date: todayStr,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        console.error('Error updating streak:', error);
    }

    return newStreak;
}
