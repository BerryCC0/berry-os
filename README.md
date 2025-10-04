# Berry OS

> **The operating system for Web3.**

A browser-native operating system inspired by Nouns. Built with Mac OS 8's refined design language—classic computing principles brought to the onchain era.

🌐 **Live:** [berryos.xyz](https://berryos.xyz)

---

## Features

- 🌐 **Browser-Native** - Works anywhere: desktop, tablet, mobile
- 🪟 **Full OS Experience** - Windows, menus, dock, and file system
- 🔗 **Multi-Chain** - EVM, Solana, and Bitcoin wallet integration
- 📱 **Touch-Optimized** - Gestures and responsive design
- 🚀 **Farcaster Mini App** - Built for Farcaster from day one
- ⚡ **Native Apps** - Calculator, Finder, Media Viewer, Text Editor, and more
- 🎨 **Refined UX** - Mac OS 8's proven computing patterns

---

## Tech Stack

- **Framework:** Next.js 14+ (TypeScript, App Router)
- **State:** Zustand (System 7 Toolbox pattern)
- **Styling:** CSS Modules
- **Web3:** Reown Appkit, Wagmi, Apollo, Neynar
- **Deployment:** Vercel
- **Farcaster:** Mini App SDK, Frame v2

---

## Quick Start

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```env
# Required
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id

# Optional (Farcaster features)
NEYNAR_API_KEY=your_api_key
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_client_id
```

See `/docs/ENV_SETUP.md` for full setup.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

---

## Project Structure

```
nouns-os/
├── app/                    # Next.js app
├── system/                 # OS core (Finder, Window Manager, etc.)
├── apps/                   # User applications
├── components/             # Shared UI components
├── public/                 # Static files & virtual filesystem
└── docs/                   # Documentation
```

---

## Documentation

- **Architecture:** `/claude.md` - Complete system design guide
- **Environment:** `/docs/ENV_SETUP.md` - Setup instructions
- **Mini App:** `/DEPLOY_NOW.md` - Farcaster deployment guide

---

## Contributing

Built by **Berry** for the Nouns ecosystem.

For development guidelines and architecture principles, see `/claude.md`.

---

## Roadmap

- [x] Desktop environment
- [x] Window management
- [x] Native apps
- [x] Multi-chain wallets
- [x] Farcaster Mini App
- [ ] NFT Gallery
- [ ] Nouns DAO integration
- [ ] User customization & persistence
- [ ] App marketplace

---

## Links

- **Live App:** https://berryos.xyz
- **Farcaster:** Launch from any Berry OS cast
- **GitHub:** [BerryCC0/berry-os](https://github.com/BerryCC0/berry-os)

---

**Berry OS** - The operating system for Web3. ⌐◨-◨
