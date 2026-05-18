export {default} from "next-auth/middleware"

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/projects/:path*",
        "/tasks/:path*",
        "/reports/:path*",
        "/calendar/:path*",
        "/team/:path*",
        "/notifications/:path*",
        "/settings/:path*",
        "/profile/:path*",
        "/activities",
        "/activities/:path*",
        "/about/:path*",
        "/admin/:path*",
    ]
}