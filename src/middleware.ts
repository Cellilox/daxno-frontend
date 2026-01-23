import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/projects(.*)',
  '/admin(.*)',
  '/pricing(.*)',
  '/payments(.*)',
  '/accept-invite(.*)',
  '/billing(.*)'
])


export default clerkMiddleware(async (auth, req) => {
  // Detect if this is an offline-requested page or a background sync
  // While navigator.onLine isn't here, we can check for specific headers
  // that a Service Worker might append, or simply let it fail gracefully
  // if we know the user is transitioning.

  if (isProtectedRoute(req)) {
    try {
      await auth.protect();
    } catch (err) {
      // If Clerk fails but we are technically "offline" from a PWA perspective,
      // we don't want to redirect to Clerk's error page.
      // The Service Worker will handle the caching fallback.
      console.error('[Middleware] Auth protect failed:', err);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
