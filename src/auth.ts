import NextAuth from "next-auth"
import { prisma } from "@/lib/prisma"
import Google from "next-auth/providers/google"

const googleClientId =
  process.env.AUTH_GOOGLE_ID ?? process.env.NEXTAUTH_GOOGLE_ID ?? ""
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ?? process.env.NEXTAUTH_GOOGLE_SECRET ?? ""
const authSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECERT ??
  ""

// Google is the ONLY login provider.
// Facebook / TikTok / YouTube are linked separately in settings for publishing.
export const { handlers, auth, signIn, signOut } = NextAuth({
  // trustHost: true is required for Vercel deployments to avoid CSRF host errors.
  trustHost: true,
  secret: authSecret,
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          // Request offline access so we can refresh tokens
          access_type: "offline",
          prompt: "consent",
          scope: "openid email profile",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
          },
        })
      } catch (err) {
        // Don't block login if DB is temporarily unavailable
        console.error("[auth] signIn DB error (non-fatal):", err)
      }
      return true
    },
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true },
          })
          if (dbUser?.id) (token as { uid?: string }).uid = dbUser.id
        } catch {}
      } else if (!(token as { uid?: string }).uid && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true },
          })
          if (dbUser?.id) (token as { uid?: string }).uid = dbUser.id
        } catch {}
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const uid = (token as { uid?: string }).uid
        if (uid) session.user.id = uid
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
})
