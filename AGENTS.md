# AGENTS.md - Development Guidelines for WhisperRNote

## Build/Lint/Test Commands
- **Build**: `npm run build` (Next.js build)
- **Dev**: `npm run dev` (runs on port 3001 with turbopack)
- **Lint**: `npm run lint` (Next.js ESLint)
- **Start**: `npm run start` (production server)
- No test framework configured - verify with user before implementing tests

## Code Style Guidelines

### Imports & File Structure
- Use `@/` path alias for src imports (configured in tsconfig.json)
- Group imports: React first, then libraries, then local imports
- Use TypeScript strict mode - all files must be properly typed

### Components & Naming
- React components use PascalCase (e.g., `NoteCard`, `SearchBar`)
- Files/folders use camelCase or kebab-case
- Export interfaces with PascalCase (e.g., `ButtonProps`)
- Use descriptive names, avoid abbreviations

### Styling & UI
- TailwindCSS for all styling - no inline styles or CSS modules
- Class variance authority (cva) for component variants
- Dark mode support required - use `dark:` prefix
- Custom design system with `light-*` and `dark-*` color tokens

### State & Error Handling
- Use try/catch blocks with meaningful error messages
- Return null for failed auth/data operations, log errors to console
- Prefer async/await over Promises
- Use loading states and error boundaries appropriately


note:

1. never edit appwrite.json
2. never edit src/types/appwrite.d.ts