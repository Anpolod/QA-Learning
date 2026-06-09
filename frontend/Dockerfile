FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN corepack enable && pnpm install --no-frozen-lockfile

COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so the
# real API URL must be supplied as a build arg (compose passes it from the
# NEXT_PUBLIC_API_URL env). API_INTERNAL_URL stays a runtime env (server-side only).
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start", "--hostname", "0.0.0.0"]
