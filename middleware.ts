import { stackServerApp } from "./stack";

export const middleware = stackServerApp.getMiddleware();

export const config = {
  matcher: ["/dashboard/:path*", "/inbox/:path*"],
};
