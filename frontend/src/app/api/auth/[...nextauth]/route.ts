import NextAuth, {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import {jwtDecode} from "jwt-decode"
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

async function refreshAccessToken(token:any) {
    
    try {
        const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh-token`,{
            refreshToken: token.refreshToken,
        });

        const refreshedTokens = response.data.data;
        const decodedAtk = jwtDecode(refreshedTokens.accessToken);
        return {
            ...token,
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken ?? token.refreshToken, // Fallback nếu backend ko trả về rtk mới
            accessTokenExpires: (decodedAtk.exp as number) * 1000,
            }
    }
    catch (error) {
        return {
            ...token,
            error: "RefreshAccessTokenError",
        }
    }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Gọi API Login của Spring Boot
          const res = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          const data = res.data.data;
          if (data && data.accessToken) {
           
            const decoded = jwtDecode(data.accessToken) as any;
            
            return {
              id: decoded.sub || credentials.email, 
              email: credentials.email,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              accessTokenExpires: decoded.exp * 1000, 
            } as any;
          }
          return null;
        } catch (e: any) {
          throw new Error(e.response?.data.detail || "Đăng nhập thất bại");
        }
      }
    })
  ],
  callbacks: {
    // Callback chạy mỗi khi truy cập /api/auth/session hoặc useSession()
    async jwt({ token, user }) {
      // 1. Lần đăng nhập đầu tiên (user có dữ liệu trả về từ authorize)
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      // 2. Các lần sau: Kiểm tra xem Access Token còn hạn không (Trừ hao 10 giây)
      if (Date.now() < token.accessTokenExpires - 10 * 1000) {
        return token;
      }

      // 3. Access Token đã hết hạn -> Gọi hàm Refresh
      return refreshAccessToken(token);
    },
    
    async session({ session, token }) {
      session.user = session.user || {};
      session.accessToken = token.accessToken; 
      session.error = token.error;
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };