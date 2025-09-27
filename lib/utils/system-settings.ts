import { db } from '@/lib/db';
import { systemSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

// Cache tags for system settings data
export const SYSTEM_SETTINGS_CACHE_TAG = 'system-settings';

// Free posting setting keys
export const FREE_POSTING_SETTINGS = {
  ENABLED: 'free_posting_enabled',
  START_DATE: 'free_posting_start_date',
  END_DATE: 'free_posting_end_date',
  REASON: 'free_posting_reason',
  ENABLED_BY: 'free_posting_enabled_by',
} as const;

// Get a system setting by key
export const getSystemSetting = unstable_cache(
  async (settingKey: string) => {
    const database = await db();
    const setting = await database
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, settingKey))
      .limit(1);

    return setting[0] || null;
  },
  ['system-setting'],
  {
    tags: [SYSTEM_SETTINGS_CACHE_TAG],
    revalidate: 300, // Cache for 5 minutes
  }
);

// Get multiple system settings by keys
export const getSystemSettings = unstable_cache(
  async (settingKeys: string[]) => {
    const database = await db();
    const settings = await database
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, settingKeys[0])); // Will use inArray later

    const settingsMap = new Map();
    settings.forEach(setting => {
      settingsMap.set(setting.settingKey, setting);
    });

    return settingsMap;
  },
  ['system-settings-multiple'],
  {
    tags: [SYSTEM_SETTINGS_CACHE_TAG],
    revalidate: 300,
  }
);

// Get free posting configuration
export const getFreePostingConfig = unstable_cache(
  async () => {
    const database = await db();
    const settings = await database
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, FREE_POSTING_SETTINGS.ENABLED));

    const enabledSetting = settings.find(s => s.settingKey === FREE_POSTING_SETTINGS.ENABLED);

    if (!enabledSetting || enabledSetting.settingValue !== 'true') {
      return {
        enabled: false,
        startDate: null,
        endDate: null,
        reason: null,
        enabledBy: null,
      };
    }

    // Get all free posting related settings
    const allFreePostingSettings = await database
      .select()
      .from(systemSettings);

    const configMap = new Map();
    allFreePostingSettings.forEach(setting => {
      configMap.set(setting.settingKey, setting.settingValue);
    });

    return {
      enabled: true,
      startDate: configMap.get(FREE_POSTING_SETTINGS.START_DATE) || null,
      endDate: configMap.get(FREE_POSTING_SETTINGS.END_DATE) || null,
      reason: configMap.get(FREE_POSTING_SETTINGS.REASON) || null,
      enabledBy: configMap.get(FREE_POSTING_SETTINGS.ENABLED_BY) || null,
    };
  },
  ['free-posting-config'],
  {
    tags: [SYSTEM_SETTINGS_CACHE_TAG],
    revalidate: 300,
  }
);

// Check if free posting is currently active
export const isFreePostingActive = async (): Promise<boolean> => {
  try {
    const config = await getFreePostingConfig();

    if (!config.enabled) {
      return false;
    }

    const now = new Date();

    // Check start date if provided
    if (config.startDate) {
      const startDate = new Date(config.startDate);
      if (now < startDate) {
        return false;
      }
    }

    // Check end date if provided
    if (config.endDate) {
      const endDate = new Date(config.endDate);
      if (now > endDate) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking free posting status:', error);
    return false;
  }
};

// Check if payment should be required for job posting
export const shouldRequirePayment = async (): Promise<boolean> => {
  const freePostingActive = await isFreePostingActive();
  return !freePostingActive;
};

// Get free posting status with details
export const getFreePostingStatus = async () => {
  try {
    const config = await getFreePostingConfig();
    const isActive = await isFreePostingActive();

    return {
      ...config,
      isCurrentlyActive: isActive,
      timeRemaining: config.endDate ? new Date(config.endDate).getTime() - Date.now() : null,
    };
  } catch (error) {
    console.error('Error getting free posting status:', error);
    return {
      enabled: false,
      isCurrentlyActive: false,
      startDate: null,
      endDate: null,
      reason: null,
      enabledBy: null,
      timeRemaining: null,
    };
  }
};

// Helper function to parse setting value based on type
export const parseSettingValue = (value: string, type: string): any => {
  switch (type) {
    case 'boolean':
      return value === 'true';
    case 'number':
      return parseFloat(value);
    case 'date':
      return new Date(value);
    case 'string':
    default:
      return value;
  }
};

// Helper function to serialize setting value based on type
export const serializeSettingValue = (value: any, type: string): string => {
  switch (type) {
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      return value.toString();
    case 'date':
      return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
    case 'string':
    default:
      return value.toString();
  }
};