# DUWash

A fast PWA alternative to [duwo.multiposs.nl](https://duwo.multiposs.nl) for checking washing machine availability. The official site is painfully slow and requires re-logging in on every reload, but is obligatory for DUWO residents. This app loads it in the background so you don't have to.

Built with Solid.js, Solid Start, and TanStack Router.

## Setup

Requires Node.js 22+ and pnpm.

```sh
pnpm install
```

Create a `.env` file:

```
MULTIPOSS_EMAIL=your-duwo-email
MULTIPOSS_PASSWORD=your-duwo-password
JWT_SECRET=some-random-secret
APP_PASSWORD_HASH=scrypt-hash-of-your-app-password
```

## Development

```sh
pnpm dev
```

Runs on http://localhost:3000.

## Production

Expects an external Traefik reverse proxy setup.

```sh
docker compose up -d --build
```