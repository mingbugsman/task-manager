import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
    } & DefaultSession["user"];
    accessToken: string;
    roles?: string[];
    isAdmin?: boolean;
    error?: string;
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    roles?: string[];
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    roles?: string[];
    isAdmin?: boolean;
    error?: string;
  }
}
