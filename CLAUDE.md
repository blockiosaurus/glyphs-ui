# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Glyphs UI is a Solana NFT explorer and management interface built for Metaplex Core assets. It uses Next.js 14 (App Router), Mantine UI v7, and integrates with Solana wallets via wallet-adapter.

## Common Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm typecheck    # TypeScript type checking
pnpm lint         # ESLint + Stylelint
pnpm jest         # Run tests
pnpm test         # Full test suite (prettier + lint + typecheck + jest)
pnpm jest:watch   # Jest in watch mode
```

## Architecture

### Provider Stack (`providers/Providers.tsx`)
The app uses a nested provider architecture (inside-out):
1. `EnvProvider` - Network environment (mainnet/devnet)
2. `ConnectionProvider` - Solana RPC connection
3. `WalletProvider` - Wallet adapter (Phantom, Solflare)
4. `WalletModalProvider` - Wallet selection modal
5. `UmiProvider` - Metaplex Umi instance for MPL Core operations
6. `QueryClientProvider` - TanStack Query for data fetching

### Umi Integration (`providers/UmiProvider.tsx`, `providers/useUmi.ts`)
- `useUmi()` hook provides access to the Umi instance
- Automatically uses connected wallet as signer, or generates anonymous signer when disconnected
- Configured with `mplCore()` and `dasApi()` plugins

### Data Fetching (`hooks/fetch.ts`)
React Query hooks for Metaplex Core operations:
- `useFetchAsset(mint)` - Single asset by mint
- `useFetchCollection(mint)` - Single collection by mint
- `useFetchAssetWithCollection(mint)` - Asset with its parent collection
- `useFetchAssetsByOwner(owner?)` - All assets owned by address
- `useFetchAssetsByCollection(collection)` - All assets in a collection
- `useFetchCollectionsByUpdateAuthority(auth)` - Collections by update authority

### Plugin System (`lib/plugin.ts`)
Manages Metaplex Core plugin permissions:
- `ownerManagedPlugins`: transferDelegate, freezeDelegate, burnDelegate
- `authorityManagedPlugins`: royalties, updateDelegate, attributes
- `permanentPlugins`: permanentFreezeDelegate, permanentTransferDelegate
- `getAssetPluginActions()` / `getCollectionPluginActions()` compute available actions based on identity

### Transaction Handling (`lib/tx.ts`)
- `sendTxsWithRetries()` - Batch send transactions with retry logic
- `prepareAndSignTxs()` - Split transaction builders and sign

### Routes
- `/` - Landing page
- `/explorer` - NFT explorer (lists user's Core assets)
- `/explorer/[mint]` - Single asset view
- `/explorer/collection/[mint]` - Collection view
- `/excavate` - Asset creation (currently shows countdown)

### Environment Switching
Network is controlled via `?env=` query param (`mainnet` or `devnet`). RPC endpoints come from:
- `NEXT_PUBLIC_MAINNET_RPC_URL`
- `NEXT_PUBLIC_DEVNET_RPC_URL`

## Path Aliases

`@/*` maps to project root (defined in `tsconfig.json`).
