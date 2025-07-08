"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getUser } from "@/lib/supabase/server";

export async function bulkUpdateJobStatus(jobIds: string[], status: string) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const database = await db();
    
    await database
      .update(jobs)
      .set({ 
        status: status as any,
        updatedAt: new Date() 
      })
      .where(inArray(jobs.id, jobIds));

    revalidateTag("admin-jobs");
    revalidateTag("admin-jobs-stats");
    revalidatePath("/admin/jobs");

    return { success: true };
  } catch (error) {
    console.error("Error updating job statuses:", error);
    return { success: false, error: "Failed to update job statuses" };
  }
}

export async function bulkDeleteJobs(jobIds: string[]) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const database = await db();
    
    // Instead of hard deleting, update status to DELETED
    await database
      .update(jobs)
      .set({ 
        status: "DELETED",
        updatedAt: new Date() 
      })
      .where(inArray(jobs.id, jobIds));

    revalidateTag("admin-jobs");
    revalidateTag("admin-jobs-stats");
    revalidatePath("/admin/jobs");

    return { success: true };
  } catch (error) {
    console.error("Error deleting jobs:", error);
    return { success: false, error: "Failed to delete jobs" };
  }
}