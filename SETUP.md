# ProofOS Setup

## What you need (3 things)

| Variable | Where to get it |
|----------|-----------------|
| `SESSION_SECRET` | **You generate it** — run `npm run setup` |
| `ARKIV_PRIVATE_KEY` | **You create** a new test wallet in MetaMask → export private key |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

## SESSION_SECRET — important

**You do not find SESSION_SECRET anywhere.** It is not from Arkiv, GitHub, or MetaMask.

It is a random password your server uses to encrypt login cookies.

```bash
npm run setup
```

This creates/updates `.env.local` with a secure random value.

## ARKIV_PRIVATE_KEY

1. MetaMask → create **new** test account
2. Account details → Export private key
3. Paste into `.env.local` (with or without `0x`)
4. Get Braga GLM: [Arkiv docs](https://docs.arkiv.network/)

## Run

```bash
npm install
npm run setup    # if you haven't
# edit .env.local → add ARKIV_PRIVATE_KEY
npm run dev
```

Open http://localhost:3000/dashboard

Verify: http://localhost:3000/api/status
