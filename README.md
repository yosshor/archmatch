# ArchMatch

A student project group matching platform for Software Architecture class.

## Features

- **Auto-Match Students**: Automatically form groups of 2-3 students using various algorithms
- **Manual Group Entry**: Add pre-formed partnerships directly
- **Student Management**: Add, view, and manage student roster with preferences
- **Matching Algorithms**: Random, preference-based, skill-balanced, and alphabetical strategies
- **Export Options**: HTML print view, JSON backup, clipboard copy, presentation mode
- **Dark/Light Mode**: Toggle between themes

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme
- **State Management**: Zustand with localStorage persistence
- **Testing**: Jest + React Testing Library (56 unit tests), Playwright (18 E2E tests)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/
│   ├── ui/                 # Reusable UI components (Button, Modal, Toast)
│   ├── panels/             # Main panel components
│   ├── students/           # Student-related components
│   └── groups/             # Group-related components
├── lib/
│   ├── data.ts             # Data management and export functions
│   ├── matching-engine.ts  # Core matching logic
│   └── matching-strategies.ts # Algorithm implementations
├── store/                  # Zustand state management
└── types/                  # TypeScript type definitions

scripts/                    # CLI utilities for terminal operations
e2e/                        # Playwright E2E tests
```

## Matching Strategies

| Strategy | Description |
|----------|-------------|
| Random | Shuffles students randomly into groups |
| Preference | Prioritizes student preferences when forming groups |
| Skill-Balanced | Distributes skills evenly across groups |
| Alphabetical | Groups students alphabetically by name |

## License

MIT
