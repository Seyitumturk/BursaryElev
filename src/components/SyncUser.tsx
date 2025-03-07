"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function SyncUser() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    async function syncUser() {
      if (isSignedIn && user) {
        try {
          // First check if user exists
          const checkRes = await fetch(`/api/users/${user.id}`);
          if (checkRes.status === 404) {
            // Only sync if user doesn't exist
            const res = await fetch("/api/sync-user", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: user.primaryEmailAddress?.emailAddress,
                role: user.publicMetadata?.role || "student",
                firstName: user.firstName || "",
                lastName: user.lastName || "",
              }),
            });
            const data = await res.json();
            console.log("Sync response:", data);
          }
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      }
    }
    syncUser();
  }, [isSignedIn, user]);

  return null;
} 