import { createMiddleware, createServerFn } from '@tanstack/solid-start'
import { redirect } from '@tanstack/solid-router'
import { getRequest, setResponseHeader } from '@tanstack/solid-start/server'
import { parse, serialize } from 'cookie'
import { scryptSync, timingSafeEqual } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import z from 'zod'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const JWT_EXPIRY = 60 * 60 * 24 * 90 // 90 days
const COOKIE_KEY = 'session'

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  const derivedKey = scryptSync(password, salt, 64)
  return timingSafeEqual(Buffer.from(hash, 'hex'), derivedKey)
}

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const req = getRequest()
  const cookies = parse(req.headers.get('cookie') || '')
  const token = cookies[COOKIE_KEY]

  if (!token) throw redirect({ to: '/login' })

  try {
    await jwtVerify(token, JWT_SECRET)
  } catch {
    throw redirect({ to: '/login' })
  }

  return next()
})

export const verifyAuth = createServerFn()
  .middleware([authMiddleware])
  .handler(async () => true)

export const loginAuth = createServerFn({ method: 'POST' })
  .inputValidator(z.string())
  .handler(async (ctx) => {
    if (!verifyPassword(ctx.data, process.env.APP_PASSWORD_HASH!)) {
      throw new Error('Invalid password')
    }

    const jwt = await new SignJWT({ sub: 'user' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('90d')
      .sign(JWT_SECRET)

    setResponseHeader(
      'Set-Cookie',
      serialize(COOKIE_KEY, jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: JWT_EXPIRY,
        sameSite: 'lax',
      }),
    )
  })

export const logoutAuth = createServerFn({ method: 'POST' }).handler(
  async () => {
    setResponseHeader(
      'Set-Cookie',
      serialize(COOKIE_KEY, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
        sameSite: 'lax',
      }),
    )
  },
)
