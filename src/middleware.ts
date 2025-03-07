import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define custom session claims type
declare module '@clerk/nextjs/server' {
  interface SessionClaims {
    metadata: {
      role?: "admin" | "organization" | "student" | "funder";
    };
  }
}

// Define route matchers
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/dashboard/admin(.*)",
]);

const isOrganizationRoute = createRouteMatcher([
  "/org(.*)",
  "/dashboard/org(.*)",
]);

// Define public routes (like sign-in, sign-up, etc.)
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
  "/"
  // Add other public routes if necessary
]);

export default clerkMiddleware((auth, req) => {
  // For debugging - log the current path
  console.log(`Request path: ${req.url}`);
  
  // Allow public routes to skip further middleware checks
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // If path is /submit, check role
  if (req.url.includes("/submit")) {
    // Get role from auth
    const { userId } = auth;
    const role = auth.sessionClaims?.metadata?.role;
    
    console.log(`User ID: ${userId}`);
    console.log(`User Role: ${role}`);
    
    // Only block students from accessing /submit
    if (role === "student") {
      console.log("Student attempting to access /submit - returning 404");
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    
    // Allow everyone else (organization, funder, admin, or no role)
    console.log("Non-student accessing /submit - allowing access");
    return NextResponse.next();
  }

  // Handle organization-only routes
  if (isOrganizationRoute(req)) {
    const role = auth.sessionClaims?.metadata?.role;
    if (role !== "organization") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  // Handle admin-only routes
  if (isAdminRoute(req)) {
    const role = auth.sessionClaims?.metadata?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/sign-in/admin", req.url));
    }
  }
  
  // For all other routes, allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|.*\\.(?:png|jpg|jpeg|gif|css|js|ico|svg)).*)",
  ],
}; 