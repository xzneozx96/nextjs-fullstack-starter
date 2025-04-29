import type { NextFetchEvent, NextRequest } from 'next/server';
import arcjet from '@/core/ai/Arcjet';
import { detectBot } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { routing } from './core/config/i18nNavigation';
import { SafeError } from './shared/utils/error-handling';

const intlMiddleware = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  // '/dashboard(.*)',
  // '/:locale/dashboard(.*)',
]);

export type NextHandler = (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) => Promise<Response>;

export function withError(handler: NextHandler): NextHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: { issues: error.issues }, isKnownError: true },
          { status: 400 },
        );
      }

      if (isErrorWithConfigAndHeaders(error)) {
        error.config.headers = undefined;
      }

      if (error instanceof SafeError) {
        return NextResponse.json(
          { error: error.safeMessage, isKnownError: true },
          { status: 400 },
        );
      }

      // Quick fix: log full error in development. TODO: handle properly
      console.error(error);

      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 },
      );
    }
  };
}

function isErrorWithConfigAndHeaders(
  error: unknown,
): error is { config: { headers: unknown } } {
  return (
    typeof error === 'object'
    && error !== null
    && 'config' in error
    && 'headers' in (error as { config: any }).config
  );
}

const isAuthPage = createRouteMatcher([
  '/signin(.*)',
  '/:locale/signin(.*)',
  '/signup(.*)',
  '/:locale/signup(.*)',
]);

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR', // Allow uptime monitoring services
    ],
  }),
);

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    // These errors are handled by the global error boundary, but you could also
    // redirect or show a custom error page
    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        throw new Error('No bots allowed');
      }

      throw new Error('Access denied');
    }
  }

  // Run Clerk middleware only when it's necessary
  if (
    isAuthPage(request) || isProtectedRoute(request)
  ) {
    return clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        const locale
          = req.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';

        const signInUrl = new URL(`${locale}/signin`, req.url);

        await auth.protect({
          // `unauthenticatedUrl` is needed to avoid error: "Unable to find `next-intl` locale because the middleware didn't run on this request"
          unauthenticatedUrl: signInUrl.toString(),
        });
      }

      return intlMiddleware(req);
    })(request, event);
  }

  // Extract the URL pathname from the request
  const path = request.nextUrl.pathname;

  // Allow direct access to API routes, sitemap.xml and robots.txt without i18n middleware processing
  // This ensures these files are properly served without locale prefixing
  if (path === '/sitemap.xml' || path === '/robots.txt' || path.startsWith('/api/')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
