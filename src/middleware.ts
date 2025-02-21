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

// Define route matchers (add more as neededd)
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
  // Add other public routes if necessary (for example, a landing page or onboarding)
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes to skip further middleware checks
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { sessionClaims } = await auth();

  // If sessionClaims is null, redirect to sign-in
  if (!sessionClaims) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Explicitly assert the type of metadata to ensure TypeScript knows about "role"
  const metadata = sessionClaims.metadata as { role?: "admin" | "organization" | "student" | "funder" };

  // Protect admin routes:
  if (isAdminRoute(req)) {
    if (!metadata.role || metadata.role !== "admin") {
      return NextResponse.redirect(new URL("/sign-in/admin", req.url));
    }
  }
  // Protect organization‐only routes:
  if (isOrganizationRoute(req)) {
    if (!metadata.role || metadata.role !== "organization") {
      // You might redirect to an error page or a dedicated sign-in for organizations
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
  // Otherwise, allow the request
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|.*\\.(?:png|jpg|jpeg|gif|css|js|ico|svg)).*)",
  ],
}; 