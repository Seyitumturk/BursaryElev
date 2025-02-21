"use client";
import { useUser } from "@clerk/nextjs";
import React from "react";

export default function SyncUser() {
  const { user, isSignedIn } = useUser();
  
  // Add actual usage of the variables
  React.useEffect(() => {
    if (isSignedIn && user) {
      // Sync user logic here
      console.log("User signed in:", user.id);
    }
  }, [isSignedIn, user]);

  return null;
} 