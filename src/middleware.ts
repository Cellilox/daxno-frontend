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
  if (isProtectedRoute(req)) {
    const { userId } = await auth();

    // Strategy: PWA Soft Protection
    // If no user is logged in, we check if this is a page load (document)
    // We allow the document to load so that the Service Worker can serve the cache.
    // Online users will still be redirected by Clerk's client-side components.
    if (!userId) {
      const isDocumentRequest = req.headers.get('sec-fetch-dest') === 'document';
      if (isDocumentRequest) return;

      await auth.protect();
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
