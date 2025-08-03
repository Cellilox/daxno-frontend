// TO BE USED AFTER TESTING

// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// const isProtectedRoute = createRouteMatcher(['/dashboard', '/projects', '/admin', '/pricing', '/payments', '/accept-invite'])


// export default clerkMiddleware(async (auth, req) => {
//    if(isProtectedRoute(req)) await auth.protect()
// });

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// };




// TO BE USED WHILE APP IS BEING TESTED

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const TEMP_PASSWORD = process.env.TEMP_ACCESS_PASSWORD;
const TEMP_COOKIE = "temp-access";
const PUBLIC_ROUTES = ["/password", "/api/temp-auth"];

// Create route matchers for Clerk
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/projects(.*)', 
  '/admin(.*)',
  '/pricing(.*)',
  '/payments(.*)',
  '/accept-invite(.*)'
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // 1. Skip static assets and internals
  if (req.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // 2. Allow public routes (these bypass both temp password and Clerk auth)
  if (PUBLIC_ROUTES.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // 3. Check for temporary access cookie first
  const hasTempAccess = req.cookies.get(TEMP_COOKIE)?.value === TEMP_PASSWORD;

  // 4. Redirect to password page if no temp access
  if (!hasTempAccess) {
    const url = req.nextUrl.clone();
    url.pathname = "/password";
    return NextResponse.redirect(url);
  }

  // 5. If temp access is granted and route is protected, let Clerk handle authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // 6. Continue if all checks pass
  return NextResponse.next();
});


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};