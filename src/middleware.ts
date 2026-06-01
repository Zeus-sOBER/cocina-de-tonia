import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except api, _next, static files, and login
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
