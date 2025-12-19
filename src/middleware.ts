import { auth } from "../auth";

/**
 * An array of routes that are accessible to the public and do not require authentication.
 */
const publicRoutes = ["/", "/conditions"];

/**
 * An array of routes that are used for authentication purposes (e.g., login, register).
 * These routes are also accessible to unauthenticated users.
 */
const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error"
];

/**
 * The prefix for API authentication routes.
 * All routes starting with this prefix are considered API authentication routes.
 */
const apiAuthPrefix = "api/auth";

/**
 * The main middleware function that handles authentication and authorization for the application.
 * It checks if a user is logged in and redirects them if they try to access protected routes.
 * @param req - The incoming Next.js request object.
 */
export default auth((req) => {
  // req.auth
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isApiAuthRoute = nextUrl.pathname.includes(apiAuthPrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute || isAuthRoute) {
    return;
  }

  if (!isPublicRoute && !isLoggedIn) {
    return Response.redirect(new URL("/", req.url));
  }

  return;
});

/**
 * Configuration for the middleware.
 * The `matcher` property is a regex that specifies which routes the middleware should run on.
 * This helps to avoid running the middleware on unnecessary routes, such as static files.
 */
// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
