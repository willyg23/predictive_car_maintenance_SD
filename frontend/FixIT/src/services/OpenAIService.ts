import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,   // Required for React Native
  defaultHeaders: { 'Content-Type': 'application/json' },
  timeout: 30_000,                 // Reduce timeout to 30s to avoid long waits
});

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const isCacheValid = (timestamp: number): boolean =>
  Date.now() - timestamp < CACHE_DURATION;

/**
 * Retrieve valid cached data or null if missing/stale.
 */
export const getCachedData = async (cacheKey: string): Promise<any | null> => {
  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    return isCacheValid(timestamp) ? data : null;
  } catch {
    return null;
  }
};

/**
 * Store data in cache under cacheKey.
 */
export const setCachedData = async (
  cacheKey: string,
  data: any
): Promise<void> => {
  const entry = { data, timestamp: Date.now() };
  await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
};

/**
 * Calls OpenAI with a system/user prompt, vehicleData, and carData.
 * Uses cache unless forceRefresh is true.
 */
export const generateInsights = async (
  prompt: string,
  vehicleData: { dtcs?: string[] | any; coolant_temp_c?: number | string; check_engine_light?: boolean },
  cacheKey: string,
  forceRefresh = false,
  carData?: {
    id?: string;
    nickname?: string;
    make?: string;
    model?: string;
    year?: string;
    mileage?: string;
    last_oil_change?: string;
    purchase_date?: string;
    color?: string;
  }
): Promise<string> => {
  // return cache if available
  if (!forceRefresh) {
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;
  }

  try {
    // minimize payload size & ensure correct types
    const simplified = {
      dtcs: Array.isArray(vehicleData.dtcs) ? vehicleData.dtcs : [],
      coolant_temp_c: typeof vehicleData.coolant_temp_c === 'string' 
        ? parseFloat(vehicleData.coolant_temp_c) || 0 
        : vehicleData.coolant_temp_c || 0,
      check_engine_light: Boolean(vehicleData.check_engine_light),
    };

    // Include car data if provided
    const carInfo = carData ? {
      make: carData.make || '',
      model: carData.model || '',
      year: carData.year || '',
      mileage: carData.mileage || '',
      last_oil_change: carData.last_oil_change || '',
    } : null;
    
    // Determine if maintenance is due based on date
    let maintenanceStatus = 'unknown';
    if (carInfo && carInfo.last_oil_change && 
        (carInfo.last_oil_change.includes('-') || carInfo.last_oil_change.includes('/'))) {
      try {
        const lastDate = new Date(carInfo.last_oil_change);
        const now = new Date();
        const nextDate = new Date(carInfo.last_oil_change);
        nextDate.setMonth(nextDate.getMonth() + 3);
        
        if (nextDate < now) {
          maintenanceStatus = 'due';
        } else if ((nextDate.getTime() - now.getTime()) < 1000 * 60 * 60 * 24 * 14) {
          maintenanceStatus = 'soon';
        } else {
          maintenanceStatus = 'good';
        }
      } catch (e) {
        console.error('Error parsing maintenance date:', e);
      }
    }

    // Check if this is a chat response (more tokens) or a diagnostic section (fewer tokens)
    const isChatResponse = cacheKey.startsWith('chat_');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano', // Using gpt-4.1-nano for better analysis
      messages: [
        {
          role: 'system',
          content: isChatResponse
            ? 'You are a vehicle diagnostic expert providing helpful information to car owners. Provide clear explanations with a moderate level of detail. Use plain language without special formatting characters. Focus on being informative while keeping answers easy to read.'
            : 'You are a vehicle diagnostic expert providing concise, actionable information. Keep all responses brief and to-the-point. Avoid lengthy explanations. Never exceed the requested length in the user prompt. Focus only on what is directly relevant to the question asked.',
        },
        {
          role: 'user',
          content: `${prompt}\n\nVehicle data: ${JSON.stringify(simplified)}${carInfo ? `\n\nCar information: ${JSON.stringify(carInfo)}\n\nMaintenance status: ${maintenanceStatus} (IMPORTANT: only recommend oil change or maintenance service if status is 'due' or 'soon'. If status is 'good', do NOT suggest scheduling maintenance soon.)` : ''}${!isChatResponse ? '\n\nIMPORTANT: Be extremely concise. Use short sentences. Avoid unnecessary details.' : ''}`,
        },
      ],
      temperature: isChatResponse ? 0.4 : 0.2, // Higher temperature for chat responses
      max_tokens: isChatResponse ? 500 : 300,  // More tokens for chat, fewer for diagnostic sections
    });

    const result = completion.choices?.[0]?.message?.content?.trim() ?? '';
    await setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return 'Unable to generate insights at this time. Please check your network connection and try again.';
  }
};
