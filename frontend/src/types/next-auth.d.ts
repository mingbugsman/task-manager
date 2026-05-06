import NextAuth, {DefaultSession, DefaultUser} from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
        } & DefaultSession["user"];
        accessToken: string;
        error?: string;
    }

    interface User extends DefaultUser {
        id: string;
        email: string;
        accessToken: string;
        refreshToken: string;
        accessTokenExpires: number;
    }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
  }
}