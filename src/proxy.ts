import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except API/tRPC, Next internals, Vercel internals and files with a dot.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
