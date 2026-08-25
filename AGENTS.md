# Ultracite Code Standards

This project uses **Ultracite** with Oxlint and Oxfmt to enforce code quality through automated linting and formatting.

## Quick Reference

- **Format code**: `bun run fix`
- **Check for issues**: `bun run check`
- **Diagnose setup**: `bun x ultracite doctor`

Oxlint and Oxfmt provide fast Rust-based linting and formatting. Most issues are automatically fixable.

---

## Verification harness

Run these before declaring any change done.

- `bun run check` runs three gates: Ultracite format and lint, `tsc --noEmit`, and `scripts/check-style-hygiene.ts`. The hygiene gate rejects arbitrary hex colors and font sizes in Tailwind bracket syntax inside src/ (for example `text-[13px]` or `bg-[#fff]`). Use theme tokens instead.
- `bun run test` runs unit tests once.
- `bun run test:e2e` runs Playwright against the Vite dev server on port 3000. Install browsers first with `bun run test:e2e:install`. This is the gate: one command, all specs, six device projects, capped at four workers locally (`PLAYWRIGHT_WORKERS=n` to override).
- `e2e/visual-baseline.spec.ts` pins pixel snapshots of eight pages on Desktop Chrome and iPhone 16. If a change intentionally shifts pixels, refresh with `bun run test:e2e:baselines -- --update-snapshots`, then run `bun run test:e2e:baselines` once; it captures every shot twice and compares each against the pin, so one run proves stability. Never refresh snapshots to make an unexplained diff disappear; investigate it instead. Run the full `bun run test:e2e` once before pushing.
- The baselines mask live-data regions (aside, comments thread, github activity, dithered hero, tracker stats, post comment counts). Changes there get no automated pixel coverage, so verify them in a browser yourself. A measured pixel budget (`maxDiffPixels: 1500`) absorbs sub-pixel rasterization drift between dev-server sessions.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Automated Tools Can't Help

Oxlint catches most static issues automatically. Focus your attention on:

1. **Business logic correctness** - Static analysis can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Oxfmt and Oxlint. Run `bun run fix` before committing to ensure compliance.
