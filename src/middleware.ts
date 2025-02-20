import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define routes that should be accessible only by admins (adjust the patterns as needed)
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/dashboard/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    // Check if the session has a publicMetadata.role of 'admin'
    if (!auth.sessionClaims?.metadata?.role || auth.sessionClaims.metadata.role !== "admin") {
      // If not an admin, redirect to the Admin Sign In page
      return NextResponse.redirect(new URL("/sign-in/admin", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Protect all routes except static files and Next internals
    "/((?!_next|.*\\.(?:png|jpg|jpeg|gif|css|js|ico|svg)).*)",
  ],
}; 