import { NextResponse } from "next/server";

const CANONICAL_HOST_UNICODE = "oreum.제주맹글이.site";
const CANONICAL_HOST_ASCII = "oreum.xn--bj0b10u3zketa68a.site";

export function middleware(request) {
  const hostHeader = request.headers.get("host") || "";
  const cookies = request.cookies;
  const alreadyRedirected = cookies.get("o_canonical")?.value === "1";

  const isLocalhost =
    hostHeader.startsWith("localhost") ||
    hostHeader.startsWith("127.0.0.1") ||
    hostHeader.endsWith(".local");

  if (isLocalhost) {
    return NextResponse.next();
  }

  const isCanonicalHost =
    hostHeader === CANONICAL_HOST_UNICODE ||
    hostHeader === CANONICAL_HOST_ASCII;

  if (isCanonicalHost) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.hostname = CANONICAL_HOST_UNICODE;
  url.port = "";

  const response = NextResponse.redirect(url, 308);
  // 첫 리다이렉트 이후 동일 세션에서 추가 리다이렉트 방지용 (24시간)
  response.cookies.set("o_canonical", "1", {
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};
