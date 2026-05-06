export {default} from "next-auth/middleware"

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/kanban/:path*",
        "/projects/:path*",
        "/reports/:path*",
        "/calendar/:path*",
    ]
}