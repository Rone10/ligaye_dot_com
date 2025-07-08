"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/supabase/server";

export async function updateJobStatus(jobId: string, status: string) {
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
      .where(eq(jobs.id, jobId));

    revalidateTag("admin-jobs");
    revalidateTag("admin-jobs-stats");
    revalidateTag("admin-job-detail");
    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${jobId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating job status:", error);
    return { success: false, error: "Failed to update job status" };
  }
}

export async function deleteJob(jobId: string) {
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
      .where(eq(jobs.id, jobId));

    revalidateTag("admin-jobs");
    revalidateTag("admin-jobs-stats");
    revalidateTag("admin-job-detail");
    revalidatePath("/admin/jobs");

    return { success: true };
  } catch (error) {
    console.error("Error deleting job:", error);
    return { success: false, error: "Failed to delete job" };
  }
}