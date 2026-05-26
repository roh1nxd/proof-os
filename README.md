# ProofOS

Proof-of-work identity infrastructure for builders. All reputation proofs are stored as **Arkiv entities** on the [Braga DB-chain](https://docs.arkiv.network/) (network id `60138453102`).

## Stack

- Next.js (App Router), Tailwind
- [@arkiv-network/sdk](https://docs.arkiv.network/start-here/installation/) — `PublicClient` for reads, server `WalletClient` for writes
- SIWE (Sign-In with Ethereum) + encrypted iron-session cookies
- Zod validation on all write/verify endpoints

## Setup

1. Copy environment file:

```bash
cp .env.example .env.local
```

2. Set variables:

| Variable | Purpose |
|----------|---------|
| `SESSION_SECRET` | Min 32 chars for session encryption |
| `ARKIV_PRIVATE_KEY` | Server relayer wallet (needs Braga GLM) |
| `NEXT_PUBLIC_APP_URL` | e.g. `http://localhost:3000` for SIWE |

3. Fund the relayer wallet with test GLM from the [Braga faucet](https://docs.arkiv.network/) (see docs home page).

4. Run:

```bash
npm install
npm run dev
```

## Arkiv entity model

| `type` attribute | Purpose |
|------------------|---------|
| `proofos_profile` | Public slug + wallet + profile JSON |
| `proofos_contribution` | Project/role proofs |
| `proofos_endorsement` | Builder-to-builder endorsements |
| `proofos_badge` | Issued badges |

Attributes are used for [indexed queries](https://docs.arkiv.network/start-here/fundamentals/); payloads hold full JSON. TTL defaults to 365 days (`ExpirationTime.fromDays`).

## API (from product spec)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reputation/:wallet` | Trust score |
| GET | `/api/contributions/:wallet` | Contributions |
| GET | `/api/endorsements/:wallet` | Endorsements received |
| POST | `/api/verify` | `{ "wallet", "minScore"? }` |

Authenticated writes (SIWE session required):

- `POST /api/profile`
- `POST /api/contributions`
- `POST /api/endorsements`

## Security notes

- `ARKIV_PRIVATE_KEY` is **server-only** (relayer); users prove wallet ownership via SIWE before writes.
- Rate limits on all public and auth routes (in-memory; use Redis in production).
- No secrets in the browser; httpOnly session cookie.
- Input validation with Zod; wallet addresses normalized with viem `getAddress`.

## Docs

- [Arkiv documentation](https://docs.arkiv.network/)
- [Installation & SDK](https://docs.arkiv.network/start-here/installation/)
- [Fundamentals (entities, attributes, queries)](https://docs.arkiv.network/start-here/fundamentals/)
