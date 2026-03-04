import { stackServerApp } from "./stack";

export const middleware = stackServerApp.middleware;

export const config = {
    matcher: ["/dashboard/:path*", "/inbox/:path*", "/handler/:path*"],
};
