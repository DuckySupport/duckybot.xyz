import jwt from "jsonwebtoken";

export type SessionJwtPayload = {
  token: string;
};

export function signSessionJwt(input: {
  token: string;
}) {
  const payload: Omit<SessionJwtPayload, "iat" | "exp"> = {
    token: input.token,
  };

  const secret = process.env.SESSION_JWT_SECRET;
  if (!secret) throw new Error("Missing SESSION_JWT_SECRET");

  return jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: 604800,
  });
}

export function verifySessionJwt(token: string): SessionJwtPayload | null {
  const secret = process.env.SESSION_JWT_SECRET;
  if (!secret) throw new Error("Missing SESSION_JWT_SECRET");

  try {
    return jwt.verify(token, secret, { algorithms: ["HS256"] }) as SessionJwtPayload;
  } catch {
    return null;
  }
}