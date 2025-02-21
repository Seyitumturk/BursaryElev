import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route matchers (add more as needed)
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/dashboard/admin(.*)",
]);
const isOrganizationRoute = createRouteMatcher([
  "/org(.*)",
  "/dashboard/org(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect admin routes:
  if (isAdminRoute(req)) {
    if (!auth.sessionClaims?.metadata?.role || auth.sessionClaims.metadata.role !== "admin") {
      return NextResponse.redirect(new URL("/sign-in/admin", req.url));
    }
  }
  // Protect organization‐only routes:
  if (isOrganizationRoute(req)) {
    if (!auth.sessionClaims?.metadata?.role || auth.sessionClaims.metadata.role !== "organization") {
      // You might redirect to an error page or a dedicated sign-in for organizations
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
  // Otherwise, allow the request
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|.*\\.(?:png|jpg|jpeg|gif|css|js|ico|svg)).*)",
  ],
}; 