import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function refreshAccessToken(token: Record<string, unknown>) {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh-token`, {
      refreshToken: token.refreshToken,
    });

    const refreshedTokens = response.data.data;
    const decodedAtk = jwtDecode(refreshedTokens.accessToken) as {
      exp: number;
      role?: string[];
    };
    const roles = decodedAtk.role ?? (token.roles as string[] | undefined);
    const isAdmin = roles?.some((r) => r === "ROLE_ADMIN") ?? token.isAdmin;

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
      accessTokenExpires: decodedAtk.exp * 1000,
      roles,
      isAdmin,
      error: undefined,
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          const data = res.data.data;
          if (data?.accessToken) {
            const decoded = jwtDecode(data.accessToken) as {
              sub?: string;
              exp: number;
              role?: string[];
            };
            const roles = decoded.role ?? [];
            const isAdmin = roles.some((r) => r === "ROLE_ADMIN");

            return {
              id: decoded.sub || credentials.email,
              email: credentials.email,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              accessTokenExpires: decoded.exp * 1000,
              roles,
              isAdmin,
            };
          }
          return null;
        } catch (e: unknown) {
          const err = e as { response?: { data?: { message?: string; detail?: string } } };
          const msg =
            err.response?.data?.message ||
            err.response?.data?.detail ||
            "Đăng nhập thất bại";
          throw new Error(msg);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          roles: user.roles,
          isAdmin: user.isAdmin,
        };
      }

      const expires = token.accessTokenExpires as number | undefined;
      if (expires && Date.now() < expires - 10_000) {
        return token;
      }

      if (!token.refreshToken) {
        return { ...token, error: "RefreshAccessTokenError" };
      }

      return refreshAccessToken(token as Record<string, unknown>);
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: (token.sub as string) ?? "",
        email: (token.email as string) ?? session.user?.email ?? "",
      };
      session.accessToken = token.accessToken as string;
      session.roles = token.roles as string[] | undefined;
      session.isAdmin = (token.isAdmin as boolean) ?? false;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
