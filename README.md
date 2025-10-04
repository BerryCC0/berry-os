# Berry OS ⌐◨-◨

> **The operating system for Web3.**

Browser-native OS inspired by Nouns. Mac OS 8's refined design language meets onchain computing.

🌐 **[berryos.wtf](https://berryos.wtf)**

---

## What is Berry OS?

A full operating system that runs in your browser. Desktop, mobile, or in Farcaster—works anywhere. Built with classic computing principles for the onchain era.

- 🪟 Windows, files, apps—familiar patterns that work
- 🔗 Multi-chain wallets (EVM, Solana, Bitcoin) at the OS level
- 🎨 Mac OS 8 design language—refined, proven, timeless
- ⌐◨-◨ Inspired by Nouns—proliferable, open, community-first

---

## Features

- **Browser-Native** - No downloads, just compute
- **Full OS Experience** - Windows, menus, dock, file system
- **Multi-Chain** - EVM, Solana, Bitcoin wallet integration
- **Touch-Optimized** - Mobile gestures and responsive design
- **Farcaster Mini App** - Built for Farcaster from day one
- **Native Apps** - Calculator, Finder, Media Viewer, Text Editor, and more
- **Refined UX** - Proven computing patterns, modern capabilities

---

## Quick Start

```bash
# Install
npm install

# Run dev
npm run dev

# Build
npm run build
```

Open [http://localhost:3000](http://localhost:3000)

---

## Apps

### OS Apps (Built-in)
- **Berry** - About This Berry OS
- **Calculator** - Computation with shareable state
- **Finder** - File system browser
- **Media Viewer** - Images, videos, audio
- **Text Editor** - Text file editing
- **Debug** - Testing tools (dev only)

### Nouns Apps (3rd Party Examples)
- **Camp** - Nouns proposals (coming soon)
- **Auction** - Daily Nouns auction (coming soon)

---

## Tech Stack

- **Framework:** Next.js 15 (TypeScript, App Router)
- **State:** Zustand (System 7 Toolbox pattern)
- **Styling:** CSS Modules
- **Web3:** Reown Appkit, Wagmi, Apollo, Neynar
- **Farcaster:** Mini App SDK
- **Deployment:** Vercel

---

## Project Structure

```
berry-os/
├── app/              # Next.js app (layout, page, lib, styles)
├── src/
│   ├── OS/          # Core system (components, lib, store, types)
│   └── Apps/        # Applications
│       ├── OS/      # Built-in OS apps
│       └── Nouns/   # 3rd party Nouns apps
├── public/          # Static files & virtual filesystem
└── docs/            # Documentation
```

---

## Documentation

- **Architecture:** `/claude.md` - Complete system design
- **Environment:** `/docs/ENV_SETUP.md` - Setup guide
- **Branding:** `/docs/brand/` - Messaging & brand guidelines
- **Mini App:** Deploy guide (see `/docs/`)

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id

# Optional (Farcaster features)
NEYNAR_API_KEY=your_api_key
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_client_id
```

See `/docs/ENV_SETUP.md` for complete setup.

---

## Contributing

Berry OS is Nounish:
- Fork it, remix it, proliferate it
- Build apps, themes, forks
- Share what you build

See `/claude.md` for development guidelines.

---

## License

**WTFPL** - Do What The Fuck You Want To Public License

See [LICENSE](./LICENSE) for full text.

---

## Links

- **Live:** [berryos.wtf](https://berryos.wtf)
- **Farcaster:** Launch from any Berry OS cast
- **GitHub:** [BerryCC0/berry-os](https://github.com/BerryCC0/berry-os)

---

**Berry OS** - The operating system for Web3. ⌐◨-◨

Built by [Berry](https://warpcast.com/berry) with ⌐◨-◨
