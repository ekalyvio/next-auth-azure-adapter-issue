////////////////////////////////////////////////////////////
// BE CAREFUL ON AZURE...
////////////////////////////////////////////////////////////
// THIS MIGHT BE ONLY WORKING ON EDGE ON VERCEL.
// IT MIGHT NOT WORK (IN AZURE) AS A MIDDLEWARE AND MIGHT NEED TO BE DELETED
// AND THE FUNCTIONALITY TO BE IMPLEMENTED DIFFERENTLY (EG. ON AUTH.TS).
////////////////////////////////////////////////////////////

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export { auth as middleware } from "auth";

// CORS: https://nextjs.org/docs/pages/building-your-application/routing/middleware#cors

//export default function middleware(req: NextRequest) {
export default auth((req) => {
  console.log(`${req.auth?.user?.email} requesting ${req.nextUrl.href}`);

  const { pathname } = req.nextUrl;

  let authRequired: boolean = false;

  // Regex to match paths like /courses/1, /courses/2, etc.
  //const courseIdPattern = /^\/courses\/\d+$/;
  const courseIdPattern = /^\/course$/;

  if (courseIdPattern.test(pathname) && !req.auth) {
    // If there is a session token in a cookie, then allow the request.

    // Either one of them on server or local host should exist in order to be signed in.
    // if (
    //   req.cookies.has("authjs.session-token") ||
    //   req.cookies.has("next-auth.session-token")
    // ) {
    //   console.error(`Security cookie token exists`);
    //   return NextResponse.next();
    // } else {
    //   console.error(`Security cookie token DOESN'T exists`);
    // }
    authRequired = true;
  }

  if (authRequired) {
    const loginUrl = new URL("/api/auth/signin", req.nextUrl);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${process.env.AUTH_URL}${req.nextUrl.pathname}`
    );

    console.error(`Redirect: ${loginUrl.href}`);

    return NextResponse.redirect(loginUrl);
  }

  //return NextResponse.rewrite(new URL('/about-2', request.url))

  // If the path does not match, let the request pass through
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  runtime: "nodejs", // Use Node.js runtime instead of Edge
};
