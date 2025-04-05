import { auth } from "../auth";

const publicRoutes = ["/"];

const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error"
];

const apiAuthPrefix = "api/auth";

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

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
