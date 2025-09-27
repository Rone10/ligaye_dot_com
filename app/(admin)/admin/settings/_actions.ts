'use server';

import { db } from '@/lib/db';
import { pricingConfig, profiles, systemSettings } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getUser } from '@/lib/supabase/server';
import { revalidateTag } from 'next/cache';
import { PRICING_CACHE_TAG } from '@/lib/utils/pricing';
import { validatePrice } from '@/lib/utils/pricing-client';
import { FREE_POSTING_SETTINGS, SYSTEM_SETTINGS_CACHE_TAG, serializeSettingValue } from '@/lib/utils/system-settings';

export async function updatePricing(priceInDalasi: number) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Convert dalasi to bututs
    const priceInBututs = Math.round(priceInDalasi * 100);
    
    // Validate the price
    const validation = validatePrice(priceInBututs);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const database = await db();
    
    // Get the profile ID for the authenticated user
    const profile = await database
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);
    
    if (!profile[0]) {
      return { success: false, error: 'Profile not found' };
    }
    
    // Start a transaction to deactivate old pricing and create new one
    await database.transaction(async (tx) => {
      // Deactivate all current active pricing configs
      await tx
        .update(pricingConfig)
        .set({ active: false })
        .where(eq(pricingConfig.active, true));
      
      // Create new pricing config
      await tx.insert(pricingConfig).values({
        pricePerMonth: priceInBututs,
        currency: 'GMD',
        active: true,
        createdBy: profile[0].id, // Use the profile ID, not the auth user ID
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Revalidate pricing cache
    revalidateTag(PRICING_CACHE_TAG);
    revalidateTag('admin-pricing');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating pricing:', error);
    return { success: false, error: 'Failed to update pricing' };
  }
}

export async function deactivatePricing(pricingId: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const database = await db();

    await database
      .update(pricingConfig)
      .set({
        active: false,
        updatedAt: new Date(),
      })
      .where(eq(pricingConfig.id, pricingId));

    // Revalidate pricing cache
    revalidateTag(PRICING_CACHE_TAG);
    revalidateTag('admin-pricing');

    return { success: true };
  } catch (error) {
    console.error('Error deactivating pricing:', error);
    return { success: false, error: 'Failed to deactivate pricing' };
  }
}

interface FreePostingSettingsInput {
  enabled: boolean;
  startDate: string | null;
  endDate: string | null;
  reason: string | null;
}

export async function updateFreePostingSettings(settings: FreePostingSettingsInput) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const database = await db();

    // Get the profile ID for the authenticated user
    const profile = await database
      .select({ id: profiles.id, role: profiles.role })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (!profile[0]) {
      return { success: false, error: 'Profile not found' };
    }

    // Check if user is admin
    if (profile[0].role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Validate date inputs
    if (settings.enabled && settings.startDate && settings.endDate) {
      const startDate = new Date(settings.startDate);
      const endDate = new Date(settings.endDate);
      if (startDate >= endDate) {
        return { success: false, error: 'End date must be after start date' };
      }
    }

    // Prepare settings to update
    const settingsToUpdate: Array<{
      key: string;
      value: string;
      type: string;
      description: string;
    }> = [
      {
        key: FREE_POSTING_SETTINGS.ENABLED,
        value: serializeSettingValue(settings.enabled, 'boolean'),
        type: 'boolean',
        description: 'Enable/disable free job posting campaigns'
      }
    ];

    if (settings.enabled) {
      if (settings.startDate) {
        settingsToUpdate.push({
          key: FREE_POSTING_SETTINGS.START_DATE,
          value: serializeSettingValue(settings.startDate, 'date'),
          type: 'date',
          description: 'Start date for free posting campaign'
        });
      }

      if (settings.endDate) {
        settingsToUpdate.push({
          key: FREE_POSTING_SETTINGS.END_DATE,
          value: serializeSettingValue(settings.endDate, 'date'),
          type: 'date',
          description: 'End date for free posting campaign'
        });
      }

      if (settings.reason) {
        settingsToUpdate.push({
          key: FREE_POSTING_SETTINGS.REASON,
          value: serializeSettingValue(settings.reason, 'string'),
          type: 'string',
          description: 'Reason for free posting campaign'
        });
      }

      settingsToUpdate.push({
        key: FREE_POSTING_SETTINGS.ENABLED_BY,
        value: serializeSettingValue(profile[0].id, 'string'),
        type: 'string',
        description: 'Profile ID of admin who enabled free posting'
      });
    }

    // Update settings in database
    await database.transaction(async (tx) => {
      for (const setting of settingsToUpdate) {
        // Try to update existing setting
        const existingSetting = await tx
          .select()
          .from(systemSettings)
          .where(eq(systemSettings.settingKey, setting.key))
          .limit(1);

        if (existingSetting.length > 0) {
          // Update existing setting
          await tx
            .update(systemSettings)
            .set({
              settingValue: setting.value,
              updatedBy: profile[0].id,
              updatedAt: new Date(),
            })
            .where(eq(systemSettings.settingKey, setting.key));
        } else {
          // Create new setting
          await tx.insert(systemSettings).values({
            settingKey: setting.key,
            settingValue: setting.value,
            settingType: setting.type,
            description: setting.description,
            createdBy: profile[0].id,
            updatedBy: profile[0].id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      // If disabling, remove date and reason settings
      if (!settings.enabled) {
        const keysToDelete = [
          FREE_POSTING_SETTINGS.START_DATE,
          FREE_POSTING_SETTINGS.END_DATE,
          FREE_POSTING_SETTINGS.REASON,
          FREE_POSTING_SETTINGS.ENABLED_BY,
        ];

        for (const key of keysToDelete) {
          await tx
            .delete(systemSettings)
            .where(eq(systemSettings.settingKey, key));
        }
      }
    });

    // Revalidate system settings cache
    revalidateTag(SYSTEM_SETTINGS_CACHE_TAG);

    return { success: true };
  } catch (error) {
    console.error('Error updating free posting settings:', error);
    return { success: false, error: 'Failed to update free posting settings' };
  }
}