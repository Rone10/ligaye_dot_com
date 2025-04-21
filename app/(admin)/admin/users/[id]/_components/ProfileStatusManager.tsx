"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Profile } from "@/lib/db/schema";

interface ProfileStatusManagerProps {
  profile: Profile;
  profileId: string;
}

export function ProfileStatusManager({ profile, profileId }: ProfileStatusManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(profile.deleted);
  
  const handleStatusChange = async (shouldDelete: boolean) => {
    setIsSubmitting(true);
    
    try {
      // Placeholder for actual API call to update status
      const formData = new FormData();
      formData.append("profileId", profileId);
      formData.append("deleted", shouldDelete.toString());
      
      // Call server action here
      // const result = await updateProfileStatusAdmin(formData);
      
      // Simulating success for now
      const success = true;
      
      if (success) {
        setCurrentStatus(shouldDelete);
        toast.success(`Account ${shouldDelete ? "deactivated" : "activated"} successfully`);
      } else {
        toast.error(`Failed to ${shouldDelete ? "deactivate" : "activate"} account`);
      }
    } catch (error) {
      console.error(`Error ${currentStatus ? "activating" : "deactivating"} account:`, error);
      toast.error(`An error occurred while ${currentStatus ? "activating" : "deactivating"} the account`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="p-6 border border-gray-100 rounded-lg bg-white/50 backdrop-blur-sm">
        <h4 className="text-base font-semibold mb-4">Account Status</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Status</p>
              <p className={`text-sm ${currentStatus ? "text-red-600" : "text-green-600"}`}>
                {currentStatus ? "Deactivated" : "Active"}
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant={currentStatus ? "default" : "destructive"}
                  disabled={isSubmitting}
                >
                  {currentStatus ? "Activate Account" : "Deactivate Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {currentStatus ? "Activate Account" : "Deactivate Account"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {currentStatus 
                      ? "This will make the account active again. The user will be able to log in and use their account normally."
                      : "This will deactivate the account. The user will not be able to log in until the account is activated again."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleStatusChange(!currentStatus)}
                    className={currentStatus ? "" : "bg-destructive hover:bg-destructive/90"}
                  >
                    {currentStatus ? "Activate" : "Deactivate"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>
              {currentStatus 
                ? "This account is currently deactivated. The user cannot log in or use their account." 
                : "This account is currently active. The user can log in and use their account normally."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 