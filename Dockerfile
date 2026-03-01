FROM node:22-bookworm-slim

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
# Install dependencies
RUN pnpm install --frozen-lockfile

# Install Playwright browsers and necessary OS dependencies
RUN pnpm exec playwright install --with-deps chromium --only-shell

COPY . .
RUN pnpm build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000
CMD ["pnpm", "start"]
