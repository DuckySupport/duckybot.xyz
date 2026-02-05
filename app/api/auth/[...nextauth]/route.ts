import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      profile(profile) {
        const hasAvatar = Boolean(profile.avatar);
        const format = profile.avatar?.startsWith("a_") ? "gif" : "png";
        const image = hasAvatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`
          : null;

        return {
          id: profile.id,
          name: profile.global_name ?? profile.username ?? "Discord user",
          email: profile.email,
          image,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt({ token, user }) {
      if (user?.image !== undefined) {
        token.picture = user.image;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.image =
          typeof token.picture === "string" ? token.picture : null;
      }
      return session;
    },
  },
})

export { handler as GET, handler as POST }
