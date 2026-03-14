import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // защищаем ВСЁ приложение, включая API
    "/((?!_next|.*\\..*).*)",
  ],
};
