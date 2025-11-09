/**
 * Next.js Middleware
 *
 * Runs on every request at the edge, before pages load.
 * Used for authentication checks, redirects, and security headers.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { type NextRequest, NextResponse } from "next/server";

/**
 * Middleware configuration
 *
 * Matches routes that should be protected or modified.
 */
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization)
		 * - favicon.ico (favicon file)
		 * - public folder assets
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};

/**
 * Protected routes that require authentication
 */
const protectedRoutes = ["/dashboard"];

/**
 * Auth routes that should redirect to dashboard if already logged in
 */
const authRoutes = ["/login", "/signup"];

/**
 * Public routes that anyone can access
 */
const publicRoutes = ["/", "/about", "/contact"];

/**
 * Check if a request has a valid session
 *
 * better-auth uses a session token cookie.
 */
function hasSession(request: NextRequest): boolean {
	const sessionToken = request.cookies.get("better-auth.session_token");
	return !!sessionToken?.value;
}

/**
 * Middleware function
 *
 * Runs on every request to matched routes.
 */
export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const isAuthenticated = hasSession(request);

	// Check if route is protected (starts with /dashboard)
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route),
	);

	// Check if route is an auth route (/login, /signup)
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

	/**
	 * RULE 1: Redirect unauthenticated users from protected routes to login
	 */
	if (isProtectedRoute && !isAuthenticated) {
		const loginUrl = new URL("/login", request.url);
		// Save the original URL to redirect back after login
		loginUrl.searchParams.set("from", pathname);
		return NextResponse.redirect(loginUrl);
	}

	/**
	 * RULE 2: Redirect authenticated users from auth pages to dashboard
	 *
	 * Note: This is also handled in AuthLayout, but middleware is faster
	 * since it runs at the edge before the page even loads.
	 */
	if (isAuthRoute && isAuthenticated) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	/**
	 * RULE 3: Add security headers to all responses
	 */
	const response = NextResponse.next();

	// Prevent clickjacking attacks
	response.headers.set("X-Frame-Options", "DENY");

	// Prevent MIME type sniffing
	response.headers.set("X-Content-Type-Options", "nosniff");

	// Enable XSS protection (legacy browsers)
	response.headers.set("X-XSS-Protection", "1; mode=block");

	// Referrer policy
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	// Content Security Policy (CSP)
	// Note: Adjust this based on your needs (inline scripts, external resources, etc.)
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval
		"style-src 'self' 'unsafe-inline'", // Tailwind uses inline styles
		"img-src 'self' data: https:",
		"font-src 'self' data:",
		"connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com", // Google OAuth
		"frame-src 'self' https://accounts.google.com", // Google OAuth iframe
	].join("; ");

	response.headers.set("Content-Security-Policy", csp);

	/**
	 * RULE 4: CORS headers for API routes (if needed)
	 *
	 * Uncomment and adjust if you need CORS for external API access.
	 */
	// if (pathname.startsWith('/api/')) {
	//   response.headers.set('Access-Control-Allow-Origin', '*')
	//   response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
	//   response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	//
	//   // Handle preflight requests
	//   if (request.method === 'OPTIONS') {
	//     return new NextResponse(null, { status: 200, headers: response.headers })
	//   }
	// }

	return response;
}
