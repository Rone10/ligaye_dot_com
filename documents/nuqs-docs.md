
# nuqs: Next.js URL Query State Management Documentation

## I. Overview & Rationale

**Purpose:** `nuqs` is a third-party library designed for managing state within Next.js applications by leveraging the URL query string. It simplifies syncing UI state with the URL, providing persistence, shareability, and type safety.

**Core Concepts:**
*   Uses URL search parameters (`?key=value`) as the state storage.
*   Provides React hooks (`useQueryState`, `useQueryStates`) similar to `React.useState`.
*   Includes built-in and custom parsers for handling various data types beyond strings.
*   Supports Next.js App Router and Pages Router, along with other React frameworks.
*   Offers fine-grained control over URL updates (history, shallow routing, throttling).

**1. Why Choose `nuqs`?**
*   **Next.js App Router Support:** Seamless integration with the latest Next.js features.
*   **Type Safety:** Ensures type consistency between server and client state representation.
*   **URL Persistence:** State automatically persists in the URL, enabling bookmarking and sharing.
*   **Efficient Batch Updates:** Multiple state updates within a single render cycle are batched into one URL update.
*   **Server-Side Parsing:** Capabilities to parse and utilize query string state on the server (RSC, API routes, SSR).
*   **Complex Data Types:** Built-in support for common types (numbers, booleans, dates, arrays) and extensibility for custom types.

**2. Filter Structure Philosophy**
*   **Decision:** Utilizes a flattened structure for query parameters (e.g., `?sort=asc&page=2`) instead of nested JSON objects within a single parameter (e.g., `?filter={sort:"asc","page":2}`).
*   **Benefits:**
    *   **Cleaner URLs:** More readable and user-friendly URLs.
    *   **Better SEO:** Individual parameters are more easily indexed by search engines.
    *   **Easier Debugging:** Simple key-value pairs are easier to inspect.
    *   **Better Performance:** Avoids client-side JSON parsing/stringifying overhead for URL state.
    *   **Flexibility:** Allows easier per-page customization and mixing of state parameters.

## II. Core Usage: `useQueryState`

The `useQueryState` hook is the primary way to manage a single piece of state synced with a URL query parameter.

**Prerequisite:** Ensure you have set up `nuqs` with the appropriate adapter for your Next.js version or framework.

**Replacing `React.useState`:**
If you manage local UI state with `useState`, you can often replace it directly with `useQueryState` to sync it with the URL.

**Basic Example:**

```jsx
'use client'

import { useQueryState } from 'nuqs'

export function NameInputDemo() {
  // 'name' is the key used in the URL query string (?name=...)
  const [name, setName] = useQueryState('name')

  return (
    <>
      <input
        value={name ?? ''} // Handle null state for empty input
        onChange={e => setName(e.target.value)}
        placeholder="Enter your name..."
      />
      <button onClick={() => setName(null)}>Clear</button> {/* Set null to remove from URL */}
      <p>Hello, {name || 'anonymous visitor'}!</p>
    </>
  )
}
```

**Arguments:**
*   `key` (string, required): The name of the query parameter key in the URL.
*   `options` (object, optional): Configuration options (see Section VI) or a parser with options.

**Return Value:** An array `[value, setValue]`, similar to `React.useState`:
*   `value`: The parsed value from the URL query string for the specified `key`.
    *   Defaults to `string | null`. Returns `null` if the key is not present. Returns `''` (empty string) if the key is present but has no value (e.g., `?name=`).
    *   The type can change based on the parser used (see Section III).
*   `setValue`: A function to update the state.
    *   Accepts the new value or a function `(oldValue) => newValue`.
    *   Setting the value to `null` removes the corresponding key-value pair from the URL query string.
    *   Returns a `Promise<URLSearchParams>` that resolves with the updated search params object after the URL update is applied (useful for chaining or reacting to the update).

**URL Examples:**

| URL           | `name` value | Notes                                        |
| :------------ | :----------- | :------------------------------------------- |
| `/`           | `null`       | No `name` key in URL                         |
| `/?name=`     | `''`         | Key present, empty value                     |
| `/?name=foo`  | `'foo'`      | String value                                 |
| `/?name=2`    | `'2'`        | Still a string by default (use parsers for types) |

### Default Values

Providing a default value prevents the state from being `null` when the query parameter is absent, simplifying state updates and rendering logic.

**Problem without Default Value:** Handling potential `null` states can be verbose.

```typescript
import { useQueryState, parseAsInteger } from 'nuqs'

export default function Counter() {
  // count can be number | null
  const [count, setCount] = useQueryState('count', parseAsInteger)

  return (
    <>
      <pre>count: {count ?? 'Not set'}</pre>
      {/* Annoying null checks needed */}
      <button onClick={() => setCount(c => (c ?? 0) + 1)}>+</button>
      <button onClick={() => setCount(c => (c ?? 0) - 1)}>-</button>
      <button onClick={() => setCount(null)}>Clear</button>
    </>
  )
}
```

**Solution with Default Value:** Pass a `defaultValue` in the options object or use the `.withDefault()` builder method on a parser.

```typescript
import { useQueryState, parseAsInteger } from 'nuqs'

// Option 1: Using the options object
const [search, setSearch] = useQueryState('search', { defaultValue: '' })
// ^? string (never null)

// Option 2: Using the parser builder
const [count, setCount] = useQueryState('count', parseAsInteger.withDefault(0))
// ^? number (never null)

// Simplified update logic:
const increment = () => setCount(c => c + 1) // c is guaranteed to be a number
const decrement = () => setCount(c => c - 1) // c is guaranteed to be a number
const resetCount = () => setCount(0)        // Set to default value
const clearCount = () => setCount(null)     // Remove 'count' from URL, state becomes default (0)
```

**Key Points about Default Values:**
*   **Internal State:** The default value is primarily used *internally* within React state. It is *not* written to the URL unless explicitly set *and* the `clearOnDefault: false` option is used (see Section VI).
*   **Invalid Values:** The default value is also returned if the value found in the URL is invalid according to the specified parser.
*   **Setting to `null`:** When a default value is specified, calling `setState(null)`:
    *   Removes the key from the URL query string.
    *   Resets the *internal React state* back to the specified `defaultValue`.

## III. Parsers: Handling Data Types

URL search parameters are inherently strings. Parsers allow you to work with more complex data types (numbers, booleans, dates, arrays, etc.) while defining how they are serialized to and parsed from the URL string.

Parsers are passed as the second argument to `useQueryState` or within the configuration object for `useQueryStates`.

**Importing Parsers:**
*   **Client Components:** `import { parseAsString /* ... */ } from 'nuqs'`
*   **Shared Code (Client & Server):** `import { parseAsString /* ... */ } from 'nuqs/server'`
    *   Use `nuqs/server` imports in files that might be imported by both Server Components and Client Components (or server-side code in general) to avoid bundling the `'use client'` directive where it's not needed. Using functions like `.withDefault()` or `.withOptions()` requires the `nuqs/server` import in shared code.

### Built-in Parsers

`nuqs` provides several parsers out of the box:

**1. `parseAsString`**
*   The default behavior if no parser is specified.
*   Treats the value as a string.
*   Performs no validation. Use `parseAsStringLiteral` for specific allowed strings.
*   `import { parseAsString } from 'nuqs/server'`

**2. `parseAsBoolean`**
*   Parses values like `'1'`, `'true'` (case-insensitive) as `true`.
*   Parses values like `'0'`, `'false'` (case-insensitive) as `false`.
*   Serializes `true` to `'1'` and `false` to `'0'`.
*   `import { parseAsBoolean } from 'nuqs/server'`
*   Example: `useQueryState('isAdmin', parseAsBoolean.withDefault(false))`

**3. `parseAsInteger`**
*   Parses the string value into an integer using `parseInt(value, 10)`.
*   Returns `null` if parsing fails (e.g., non-numeric input).
*   Serializes numbers to their string representation.
*   `import { parseAsInteger } from 'nuqs/server'`
*   Example: `useQueryState('page', parseAsInteger.withDefault(1))`

**4. `parseAsFloat`**
*   Parses the string value into a floating-point number using `parseFloat(value)`.
*   Returns `null` if parsing fails.
*   Serializes numbers to their string representation.
*   `import { parseAsFloat } from 'nuqs/server'`
*   Example: `useQueryState('price', parseAsFloat)`

**5. Literal Parsers (`parseAsStringLiteral`, `parseAsNumberLiteral`)**
*   Ensure the value is one of a predefined set of string or number literals.
*   Useful for types like `'asc' | 'desc'` or specific IDs.
*   **Requires `as const`** on the array of allowed values.
*   Returns `null` if the value from the URL is not in the allowed set.

```typescript
import { parseAsStringLiteral, parseAsNumberLiteral } from 'nuqs/server'

// String Literals
const availableSorts = ['asc', 'desc'] as const // Use 'as const'!
type SortOrder = (typeof availableSorts)[number] // 'asc' | 'desc'
const sortParser = parseAsStringLiteral(availableSorts)
useQueryState('sort', sortParser.withDefault('asc'))

// Numeric Literals
const diceSides = [1, 2, 3, 4, 5, 6] as const // Use 'as const'!
type DiceSide = (typeof diceSides)[number] // 1 | 2 | 3 | 4 | 5 | 6
const diceParser = parseAsNumberLiteral(diceSides)
useQueryState('roll', diceParser)
```

**6. Date Parsers**
*   Provide a `Date` object, differing in URL serialization format.
    *   **`parseAsIsoDateTime`**: Serializes as ISO 8601 Datetime string (e.g., `2024-01-01T12:00:00.000Z`).
        `import { parseAsIsoDateTime } from 'nuqs/server'`
        Example: `useQueryState('updatedAt', parseAsIsoDateTime)`
    *   **`parseAsIsoDate`**: Serializes as ISO 8601 Date string (e.g., `2024-01-01`). Time is set to `00:00:00 UTC`. (Introduced in v2.1.0)
        `import { parseAsIsoDate } from 'nuqs/server'`
        Example: `useQueryState('startDate', parseAsIsoDate)`
    *   **`parseAsTimestamp`**: Serializes as milliseconds since the Unix epoch (e.g., `1704067200000`).
        `import { parseAsTimestamp } from 'nuqs/server'`
        Example: `useQueryState('eventTime', parseAsTimestamp)`

**7. `parseAsArrayOf`**
*   Parses a delimited string into an array of values, using another parser for the individual items.
*   Defaults to using `,` as the separator.
*   Returns `null` if the input is not a valid representation.
*   Serializes an array back into a delimited string.

```typescript
import { parseAsArrayOf, parseAsInteger } from 'nuqs/server'

// Array of integers, comma-separated (e.g., ?ids=1,2,3)
const idsParser = parseAsArrayOf(parseAsInteger)
useQueryState('ids', idsParser.withDefault([]))

// Array of integers, semicolon-separated (e.g., ?values=10;20;30)
const valuesParser = parseAsArrayOf(parseAsInteger, ';')
useQueryState('values', valuesParser)
```

### Custom Parsers (`createParser`)

For custom data types or specific URL formatting needs, create your own parser using `createParser`.

**Arguments:** An object with two functions:
*   `parse(queryValue: string): T | null`: Takes the raw string value from the URL and returns the parsed data type `T`, or `null` if the string is invalid.
*   `serialize(value: T): string`: Takes the internal state value `T` and returns its string representation for the URL.

**Example: Star Rating Parser (1-5 stars)**

```typescript
import { createParser } from 'nuqs/server' // Use nuqs/server if shared

type StarRating = 1 | 2 | 3 | 4 | 5;

const parseAsStarRating = createParser({
  // Parses "★", "★★", etc. up to 5 stars
  parse(queryValue): StarRating | null {
    if (!queryValue) return null;
    const starCount = queryValue.split('★').length - 1;
    if (starCount > 0 && queryValue === '★'.repeat(starCount)) {
      // Clamp to a maximum of 5 stars
      return Math.min(5, starCount) as StarRating;
    }
    return null; // Invalid format
  },

  // Serializes the number (1-5) back into star characters
  serialize(value: StarRating): string {
    // Ensure value is within range if necessary, though type should guarantee it
    const validValue = Math.max(1, Math.min(5, value)) as StarRating;
    return '★'.repeat(validValue);
  }
}).withDefault(3); // Example default

// Usage:
// const [rating, setRating] = useQueryState('rating', parseAsStarRating)
// URL examples: ?rating=★★★ (value is 3), ?rating=★ (value is 1)
```

**Caveat: Lossy Serializers**
If your `serialize` function loses precision (e.g., rounding numbers, simplifying complex objects), reloading the page or navigating back/forward will restore the state based on the *lossy* URL value, not the original higher-precision internal state.

*Example: Geo-coordinate rounded to 4 decimal places.*

```typescript
const lossyGeoCoordParser = createParser({
  parse: parseFloat,
  serialize: (v: number) => v.toFixed(4) // Precision loss here!
});

// const [lat, setLat] = useQueryState('lat', lossyGeoCoordParser);
// setLat(1.23456789) -> URL becomes ?lat=1.2345
// Reloading page -> lat state becomes 1.2345
```
Be mindful of this when designing custom parsers. Ensure `serialize` accurately represents the state if precision is critical.

---


## IV. Managing Multiple States: `useQueryStates`

When multiple query parameters are logically grouped or frequently updated together (e.g., map coordinates, pagination state), `useQueryStates` provides a more convenient API than multiple `useQueryState` hooks.

**Basic Usage:**
Pass an object where keys are your desired state variable names and values are their corresponding parsers.

```typescript
import { useQueryStates, parseAsFloat, parseAsInteger } from 'nuqs'

// Define parsers for grouped state
const mapStateParsers = {
  lat: parseAsFloat.withDefault(45.18),
  lng: parseAsFloat.withDefault(5.72),
  zoom: parseAsInteger.withDefault(10)
}

export function MapControl() {
  // Use useQueryStates with the parser map
  const [mapState, setMapState] = useQueryStates(mapStateParsers)

  // Access individual values from the returned state object
  const { lat, lng, zoom } = mapState
  // lat: number, lng: number, zoom: number (types inferred from parsers)

  const setNewLocation = () => {
    // Update multiple states at once
    setMapState({
      lat: Math.random() * 180 - 90,
      lng: Math.random() * 360 - 180
      // zoom remains unchanged if not specified
    });
  }

  const resetView = () => {
    // Setting to null clears all keys managed by this hook
    setMapState(null)
    // URL will remove ?lat=...&lng=...&zoom=...
    // mapState will revert to { lat: 45.18, lng: 5.72, zoom: 10 } (defaults)
  }

  return (
    <div>
      <p>Lat: {lat}, Lng: {lng}, Zoom: {zoom}</p>
      <button onClick={setNewLocation}>Random Location</button>
      <button onClick={resetView}>Reset View</button>
    </div>
  )
}
```

**Return Value:** An array `[stateObject, setStateFunction]`:
*   `stateObject`: An object where keys match the parser map keys, and values are the parsed state values. Types are inferred from the parsers (including nullability based on defaults).
*   `setStateFunction`: A function to update one or more states defined in the hook.
    *   Accepts a partial object containing the keys and new values to update. Omitted keys remain unchanged.
    *   Accepts `null` to clear *all* keys managed by this specific `useQueryStates` instance from the URL, resetting their internal state to their respective defaults.
    *   Returns a `Promise<URLSearchParams>` that resolves after the batched URL update is applied.

**Batching:** Similar to individual `useQueryState` updates, calls to the `setStateFunction` from `useQueryStates` within the same event loop tick are batched into a single URL update.

### Shorter Search Param Keys (`urlKeys`)

Often, internal variable names (like `latitude`) are more descriptive than desired URL keys (like `lat`). The `urlKeys` option allows mapping between them.

```typescript
import { useQueryStates, parseAsFloat, type UrlKeys } from 'nuqs' // or nuqs/server for UrlKeys

// Define descriptive parser keys
export const coordinatesParsers = {
  latitude: parseAsFloat.withDefault(45.18),
  longitude: parseAsFloat.withDefault(5.72)
}

// Define the mapping to URL keys (type-checked with UrlKeys)
export const coordinatesUrlKeys: UrlKeys<typeof coordinatesParsers> = {
  latitude: 'lat',
  longitude: 'lng'
}

function CoordinateDisplay() {
  const [{ latitude, longitude }, setCoordinates] = useQueryStates(
    coordinatesParsers,
    {
      // Pass the urlKeys mapping in options
      urlKeys: coordinatesUrlKeys,
      history: 'push' // Other options can be combined
    }
  )

  // Use descriptive variable names in code
  const updateCoords = () => {
    setCoordinates({ latitude: 0, longitude: 0 })
    // This will update the URL to ?lat=0&lng=0
  }

  return <p>Lat: {latitude}, Lng: {longitude}</p>
}
```
This pattern keeps the codebase readable while producing concise URLs. The `UrlKeys` type helper ensures the mapping keys match the parser keys. These parser and `urlKeys` objects can be exported and reused across components, hooks, and server-side utilities.

## V. Server-Side Usage

`nuqs` provides tools to parse and utilize URL search parameters on the server, enabling type-safe access in Server Components, API routes, and SSR functions (`getServerSideProps`).

**Key Imports:** Always use imports from `nuqs/server` for utilities intended for server-side or shared code.

### 1. Loaders (`createLoader`)

Loaders provide a way to parse search params on the server based on a predefined schema (similar to the object used in `useQueryStates`).

**Steps:**
1.  Define a search params schema object (parsers, optional defaults).
2.  Create a loader function using `createLoader` with the schema.
3.  Call the loader function with the `searchParams` object provided by Next.js (or other sources).

**Example:**

```typescript
// src/lib/searchParams.ts (shared file)
import { parseAsFloat, parseAsInteger, createLoader } from 'nuqs/server'

// 1. Define the schema (can be reused with useQueryStates)
export const mapSearchParams = {
  lat: parseAsFloat.withDefault(0),
  lng: parseAsFloat.withDefault(0),
  zoom: parseAsInteger.withDefault(5)
}

// Optionally define urlKeys mapping if needed
export const mapUrlKeys: UrlKeys<typeof mapSearchParams> = {
  lat: 'lt', // example short key
  lng: 'lg', // example short key
  zoom: 'z'  // example short key
}

// 2. Create the loader function
export const loadMapSearchParams = createLoader(mapSearchParams, { urlKeys: mapUrlKeys })
// loadMapSearchParams is now a function: (searchParamsInput) => Promise<{ lat: number, lng: number, zoom: number }>
```

```typescript
// app/map/page.tsx (Server Component using the loader)
import { loadMapSearchParams } from '@/lib/searchParams'
import type { SearchParams } from 'nuqs/server' // Type for Next.js searchParams prop
import MapComponent from './MapComponent' // Assume this component takes lat, lng, zoom props
import { Suspense } from 'react'

type PageProps = {
  // searchParams can be sync or async depending on Next.js version/setup
  searchParams: SearchParams | Promise<SearchParams>
}

export default async function MapPage({ searchParams }: PageProps) {
  // 3. Call the loader with the searchParams from Next.js
  // It handles parsing based on the schema and urlKeys mapping
  // It accepts various input types (string, URL, URLSearchParams, object, Request, Promise<...>)
  const mapState = await loadMapSearchParams(searchParams)
  // mapState = { lat: number, lng: number, zoom: number }

  return (
    <div>
      <h1>Map View</h1>
      {/* Pass parsed values to components */}
      <MapComponent lat={mapState.lat} lng={mapState.lng} zoom={mapState.zoom} />

      {/* Pro Tip: For better perf/streaming with Suspense/PPR,
          pass the Promise directly if the loader input is a Promise */}
      {/* <Suspense fallback={<div>Loading map data...</div>}>
        <MapDataLoader loaderPromise={loadMapSearchParams(searchParams)} />
      </Suspense> */}
    </div>
  )
}
```

**Note on Validation:** Loaders primarily handle *parsing* and *type coercion*. They don't perform deep *validation* (e.g., checking if a number is positive, validating object shapes). For complex validation, feed the loader's output into a schema validation library like Zod, or implement validation within custom parsers.

### 2. Server Component Cache (`createSearchParamsCache`) - Next.js Only

For accessing parsed search params deep within a Server Component tree without prop drilling, `createSearchParamsCache` offers a solution leveraging React's `cache` function.

**Steps:**
1.  Define a schema object (like for loaders).
2.  Create a cache instance using `createSearchParamsCache` with the schema.
3.  In the page/layout component, call the cache's `.parse()` method with the `searchParams`. This populates the cache for the current render request.
4.  In any child Server Component within the same render tree, use the cache's `.get('key')` or `.all()` methods to retrieve the type-safe, parsed values.

**Example:**

```typescript
// src/lib/searchCache.ts (shared file)
import { createSearchParamsCache, parseAsString, parseAsInteger } from 'nuqs/server'

// 1. Define schema
export const searchParamsParsers = {
  q: parseAsString.withDefault(''),
  maxResults: parseAsInteger.withDefault(10)
}

// Optional urlKeys mapping
export const searchUrlKeys: UrlKeys<typeof searchParamsParsers> = {
  q: 'query',
  maxResults: 'limit'
}

// 2. Create cache instance
export const searchParamsCache = createSearchParamsCache(searchParamsParsers, { urlKeys: searchUrlKeys });
```

```typescript
// app/search/page.tsx (Parent Server Component)
import { searchParamsCache } from '@/lib/searchCache'
import type { SearchParams } from 'nuqs/server'
import Results from './Results' // Child Server Component

type PageProps = {
  searchParams: Promise<SearchParams> | SearchParams
}

export default async function SearchPage({ searchParams }: PageProps) {
  // 3. Parse and populate the cache for this request
  // ⚠️ Crucial step: Must call .parse() here!
  const parsed = await searchParamsCache.parse(searchParams)
  // parsed = { q: string, maxResults: number }

  return (
    <div>
      <h1>Search Results for "{parsed.q}"</h1>
      <Results /> {/* Child component can now access cache */}
    </div>
  )
}
```

```typescript
// app/search/Results.tsx (Child Server Component)
import { searchParamsCache } from '@/lib/searchCache'

export default function Results() {
  // 4. Access cached, parsed values directly
  const query = searchParamsCache.get('q') // Returns string
  const limit = searchParamsCache.get('maxResults') // Returns number
  // const allParams = searchParamsCache.all() // Returns { q: string, maxResults: number }

  // Fetch data using the parsed & typed params...
  // const data = await fetchResults(query, limit);

  return (
    <div>
      <p>Showing up to {limit} results for "{query}".</p>
      {/* Render results... */}
    </div>
  )
}
```

**Sharing Schema with Client:** The parser schema object (`searchParamsParsers` in the example) can be exported and reused in Client Components with `useQueryStates` for consistency.

```typescript
// app/search/SearchInput.tsx (Client Component)
'use client'
import { useQueryStates } from 'nuqs'
import { searchParamsParsers, searchUrlKeys } from '@/lib/searchCache' // Reuse schema/keys

export function SearchInput() {
  const [{ q }, setSearchParams] = useQueryStates(searchParamsParsers, { urlKeys: searchUrlKeys })

  return (
    <input
      value={q}
      onChange={e => setSearchParams({ q: e.target.value })}
    />
  )
}
```

## VI. Configuration Options

`nuqs` hooks (`useQueryState`, `useQueryStates`) and state updater functions accept options to customize behavior.

**Passing Options:**
1.  **Hook Level (via builder):** Applied to all updates triggered by that hook instance.
    ```typescript
    const [state, setState] = useQueryState(
      'key',
      parseAsString.withOptions({ history: 'push', shallow: false })
    )
    ```
2.  **Hook Level (as argument):** For `useQueryStates`, options can be passed as the second argument.
    ```typescript
    const [state, setState] = useQueryStates(parsers, { history: 'push' })
    ```
3.  **Call Level:** Passed as the second argument to the state updater function. Overrides hook-level options for that specific update.
    ```typescript
    setState('newValue', { scroll: true, shallow: true }) // Overrides hook-level options
    setCoordinates({ lat: 10 }, { throttleMs: 500 }) // Overrides hook-level options
    ```

**Available Options:**

*   **`history: 'push' | 'replace'`** (Default: `'replace'`)
    *   `'replace'`: Updates the URL using `history.replaceState`. The change doesn't create a new entry in the browser history. Multiple sequential updates effectively become one history entry.
    *   `'push'`: Updates the URL using `history.pushState`. Each update creates a new entry, allowing the user to navigate back/forward through state changes.
    *   **Caution:** Use `'push'` judiciously, primarily for state changes that feel like navigation (e.g., tabs, modals), to avoid disrupting the expected back button behavior.

*   **`shallow: boolean`** (Default: `true`)
    *   `true`: Updates the URL on the client-side only using `history.pushState/replaceState`. No network request is made to the server, and server components are *not* re-rendered. Data associated with the page does not refetch.
    *   `false`: Updates the URL and triggers a navigation in Next.js. This *will* cause Server Components to re-render with the new `searchParams` and data fetching logic (e.g., `getServerSideProps`, RSC data fetching) may re-run based on the new URL. Essential for reflecting URL state changes on the server.
    *   **Note:** Only relevant in server-rendered frameworks (Next.js, Remix). No effect in pure React SPAs.

*   **`scroll: boolean`** (Default: `false`)
    *   `false`: Prevents the browser from scrolling to the top of the page after the URL update. Desirable for most UI state updates (filters, sorts) that shouldn't reset scroll position.
    *   `true`: Allows the default browser/framework behavior (usually scrolling to the top) after the URL navigation associated with the state update occurs. Useful if the state change significantly alters page content requiring a scroll reset.

*   **`throttleMs: number`** (Default: `50`)
    *   Specifies the minimum time in milliseconds between consecutive URL updates. Updates occurring faster than this threshold are queued and batched.
    *   Helps prevent hitting browser History API rate limits, especially with high-frequency updates (e.g., binding to sliders, text inputs).
    *   Safari has stricter limits, often requiring `120` or more. `nuqs` handles common browser defaults.
    *   Increase this value (e.g., `1000`) to reduce the frequency of server requests when using `shallow: false`.
    *   Internal React state updates instantly; only the URL update is throttled.
    *   Setting to `Infinity` disables URL updates entirely while keeping internal state synced. Values below `50` are ignored.

*   **`startTransition: (callback: () => void) => void`** (Optional)
    *   Integrates with React's `useTransition` hook for pending UI states during server updates.
    *   Pass the `startTransition` function obtained from `useTransition`.
    *   When provided, `nuqs` will wrap the state update logic (especially when `shallow: false`) within `startTransition`.
    *   The `isPending` value from `useTransition` will become `true` while Next.js is re-rendering Server Components and fetching data due to the URL change.
    *   **Important (nuqs >= 2.0.0):** You **must** explicitly set `shallow: false` when using `startTransition` if you want server re-rendering. It's no longer implied.

    ```jsx
    'use client'
    import React from 'react'
    import { useQueryState, parseAsString } from 'nuqs'

    function SearchForm() {
      const [isPending, startTransition] = React.useTransition()
      const [query, setQuery] = useQueryState(
        'q',
        parseAsString.withOptions({
          shallow: false, // Explicitly needed for server update
          startTransition // Pass the function here
        })
      )

      const handleChange = (e) => {
        // The update triggers a server re-render via shallow: false
        // isPending will be true during the re-render
        setQuery(e.target.value)
      }

      return (
        <>
          <input value={query ?? ''} onChange={handleChange} disabled={isPending} />
          {isPending && <span> Loading...</span>}
        </>
      )
    }
    ```

*   **`clearOnDefault: boolean`** (Default: `true`)
    *   `true`: When the state is set *back* to its specified `defaultValue`, the corresponding query parameter is *removed* from the URL.
    *   `false`: When the state is set back to its `defaultValue`, the query parameter is *kept* in the URL with the default value serialized (e.g., `?page=1` even if `1` is the default).
    *   **Note:** Setting state to `null` *always* removes the key from the URL, regardless of this option.

*   **`eq: (a: T, b: T) => boolean`** (Optional, defined on custom parsers)
    *   Used by the `clearOnDefault: true` logic to compare the incoming state value with the `defaultValue`.
    *   Necessary for custom parsers dealing with types where reference equality (`===`) doesn't work (e.g., `Date` objects, complex objects).
    *   Built-in parsers handle this automatically.

    ```typescript
    import { createParser } from 'nuqs/server'

    const dateParser = createParser({
      parse: (value: string) => new Date(value),
      serialize: (date: Date) => date.toISOString().slice(0, 10), // YYYY-MM-DD
      // Provide custom equality check for Dates
      eq: (a: Date, b: Date) => a?.getTime() === b?.getTime()
    }).withDefault(new Date()); // Example default
    ```

---


## VII. Utilities

`nuqs` provides helper functions for common tasks related to query string manipulation and type inference. Imports should come from `nuqs/server` if used in shared code, or `nuqs` if client-only.

### 1. Serializer Helper (`createSerializer`)

Generates URLs or query strings suitable for use in `<Link>` components or manual navigation, ensuring values are serialized correctly according to their parsers.

**Steps:**
1.  Define a search params schema object (parsers, same as for `useQueryStates` or loaders).
2.  Create a serializer function using `createSerializer` with the schema.
3.  Call the serializer function with an object containing the state values you want to include in the query string.

**Example:**

```typescript
// src/lib/linkUtils.ts
import {
  createSerializer,
  parseAsInteger,
  parseAsString,
  parseAsIsoDateTime,
  parseAsStringLiteral
} from 'nuqs/server' // Use nuqs/server if shared

// 1. Define the schema for the search params you want to serialize
export const searchLinkParams = {
  search: parseAsString.withDefault(''),
  limit: parseAsInteger.withDefault(10),
  from: parseAsIsoDateTime,
  sortBy: parseAsStringLiteral(['name', 'date'] as const).withDefault('date')
}

// Optional: Define urlKeys if needed for shorter URLs
export const searchLinkUrlKeys: UrlKeys<typeof searchLinkParams> = {
  search: 'q',
  limit: 'lim',
  // from: 'from', // Keep original if desired
  sortBy: 'sort'
}

// 2. Create the serializer function
export const serializeSearchLink = createSerializer(searchLinkParams, { urlKeys: searchLinkUrlKeys });
// serializeSearchLink is a function:
// (base: string | URL | URLSearchParams | null | undefined, values: Partial<StateType>) => string
// OR
// (values: Partial<StateType>) => string
```

```jsx
// components/MyLinks.tsx (Client or Server Component)
import Link from 'next/link'
import { serializeSearchLink } from '@/lib/linkUtils'

function MyLinks({ currentSearch }) {
  // 3. Use the serializer to generate query strings or full hrefs
  const linkToNextPage = serializeSearchLink({ limit: 20 }) // Returns "?lim=20&sort=date" (uses defaults)

  const linkWithSearch = serializeSearchLink({ search: 'new query' }) // Returns "?q=new+query&lim=10&sort=date"

  // Can take a base path/URL to append/amend params
  const linkWithBasePath = serializeSearchLink('/items', { search: 'items query' })
  // Returns "/items?q=items+query&lim=10&sort=date"

  // Setting a value to null removes it from the output
  const linkWithoutSort = serializeSearchLink({ sortBy: null, search: 'no sort' })
  // Returns "?q=no+sort&lim=10"

  // Passing existing search params to amend them
  const existingSearchParams = new URLSearchParams('?existing=true&q=old');
  const amendedLink = serializeSearchLink(existingSearchParams, { search: 'updated', limit: 5 })
  // Returns "?existing=true&q=updated&lim=5&sort=date" (overwrites q, adds lim/sort, keeps existing)

  return (
    <nav>
      <Link href={`/search${linkToNextPage}`}>View 20 Results</Link>
      <Link href={`/search${linkWithSearch}`}>Search for "new query"</Link>
      <Link href={linkWithBasePath}>Search Items</Link>
      <Link href={`/search${linkWithoutSort}`}>Search without Sort</Link>
      <Link href={`/search${amendedLink}`}>Amended Search</Link>
    </nav>
  )
}
```

**Base Parameter:** The first argument to the generated serializer function can be:
*   A string (path like `/path` or full URL like `https://...`).
*   A `URL` object.
*   A `URLSearchParams` object.
*   `null` or `undefined` (starts with an empty query string).
The provided `values` (second argument) will be merged into this base, overwriting existing keys and adding new ones. Setting a value to `null` in the `values` object removes that key from the resulting query string.

### 2. Parser Type Inference (`inferParserType`)

Retrieves the TypeScript type that a parser (or a schema object of parsers) will produce. Useful for defining prop types or function signatures that consume parsed state.

```typescript
import {
  parseAsInteger,
  parseAsBoolean,
  type inferParserType,
  createParser
} from 'nuqs/server' // or 'nuqs'

// Single parser
const intParserNullable = parseAsInteger
type IntTypeNullable = inferParserType<typeof intParserNullable> // number | null

const intParserNonNull = parseAsInteger.withDefault(0)
type IntTypeNonNull = inferParserType<typeof intParserNonNull> // number

// Parser schema object (like for useQueryStates/createLoader)
const myParsers = {
  id: parseAsInteger,
  isActive: parseAsBoolean.withDefault(true),
  tags: parseAsArrayOf(parseAsString).withDefault([])
}
type MyStateType = inferParserType<typeof myParsers>
/*
MyStateType = {
  id: number | null;
  isActive: boolean;
  tags: string[];
}
*/

// Example usage in component props
type MyComponentProps = {
  filters: MyStateType
}

function MyComponent({ filters }: MyComponentProps) {
  // filters.id is number | null
  // filters.isActive is boolean
  // filters.tags is string[]
}
```

## VIII. Limits and Considerations

Be aware of these inherent limitations when using URL state:

*   **URL Update Throttling:**
    *   Browsers rate-limit History API calls (`pushState`/`replaceState`).
    *   `nuqs` throttles URL updates by default (`50ms`) to prevent errors. Safari often needs higher values (`120ms+`), which `nuqs` attempts to handle.
    *   High-frequency updates (sliders, input binding) are safe; the internal React state updates instantly, but the URL sync is debounced/throttled.
    *   Custom throttling can be configured via the `throttleMs` option.

*   **Maximum URL Length:**
    *   Browsers impose limits on URL length, though they vary significantly (from ~2000 characters in older IE to tens of thousands in modern browsers).
    *   **Practical Limit:** Aim to keep URLs reasonably short, ideally well under **2000 characters**, for maximum compatibility, especially when sharing links via email, social media, or messaging apps, which often have stricter limits.
    *   **Guideline:** If your URL state frequently exceeds this length, reconsider if *all* that state truly belongs in the URL. Some complex or transient UI state might be better managed locally (e.g., `useState`, context) or persisted elsewhere. URL state is best for shareable, bookmarkable application states like filters, sorts, pagination, and view modes.

## IX. Example: TanStack Table Integration

TanStack Table (formerly React Table) often manages state like pagination, sorting, and filtering in memory, losing it on refresh. `nuqs` is ideal for persisting this state in the URL.

**Pagination Example:**
TanStack Table uses `pageIndex` (0-based) and `pageSize`. We typically want a 1-based `page` parameter in the URL for user-friendliness.

**1. Define Parsers and Hook:** Create a reusable hook for managing pagination state via URL params.

```typescript
// src/hooks/usePaginationSearchParams.ts
import {
  // parseAsInteger is fine, but parseAsIndex handles 0 vs 1 base mapping
  parseAsInteger, // Use for pageSize
  createParser,   // Use to create a 1-based page index parser
  useQueryStates,
  type UrlKeys
} from 'nuqs'

// Custom parser for 1-based page index in URL, 0-based internally
const parseAsOneBasedInteger = createParser({
  parse: (value) => {
    const num = parseInt(value, 10);
    // Handle invalid input and return 0-based index
    return isNaN(num) || num < 1 ? 0 : num - 1;
  },
  serialize: (value) => (value + 1).toString() // Convert 0-based back to 1-based string
});

const paginationParsers = {
  // Internal state name: parser. We use 0-based internally for TanStack Table.
  pageIndex: parseAsOneBasedInteger.withDefault(0), // Default internal index is 0
  pageSize: parseAsInteger.withDefault(10)
}

const paginationUrlKeys: UrlKeys<typeof paginationParsers> = {
  // Map internal state names to URL keys
  pageIndex: 'page', // URL uses 'page' (1-based)
  pageSize: 'perPage' // URL uses 'perPage'
}

// Custom hook to manage pagination state
export function usePaginationSearchParams() {
  return useQueryStates(paginationParsers, {
    urlKeys: paginationUrlKeys,
    // Consider history: 'replace' for pagination to avoid too many back button steps
    history: 'replace'
  })
}
```

**2. Integrate with TanStack Table:** Use the custom hook to provide state and update handlers to the table instance.

```jsx
// components/MyTable.tsx
'use client' // Or adapt for SSR data fetching with server-side parsing

import { useReactTable, getCoreRowModel, getPaginationRowModel, /* ...other models */ } from '@tanstack/react-table'
import { usePaginationSearchParams } from '@/hooks/usePaginationSearchParams'
import React from 'react' // Assuming React usage

function MyTable({ data, columns }) {
  // 1. Get pagination state and updater from our nuqs hook
  const [paginationState, setPaginationState] = usePaginationSearchParams();
  // paginationState = { pageIndex: number (0-based), pageSize: number }

  const table = useReactTable({
    data,
    columns,
    // Provide pagination state from nuqs
    state: {
      pagination: paginationState,
      // ... other table states (sorting, filtering - can also use nuqs)
    },
    // Update nuqs state when table requests pagination change
    onPaginationChange: (updater) => {
      // updater can be an object or a function (prevState => newState)
      // useQueryStates setter accepts a function, let's adapt
      if (typeof updater === 'function') {
        setPaginationState(prevState => updater(prevState));
      } else {
        setPaginationState(updater); // Directly set the new state object
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Important: Disable TanStack Table's manual pagination if controlling externally
    manualPagination: true, // Let nuqs and server handle page fetching
    // If fetching data server-side based on URL:
    // pageCount: serverCalculatedPageCount, // Tell table total pages
    debugTable: process.env.NODE_ENV === 'development',
  })

  return (
    <div>
      {/* Table rendering logic (<table>...</table>) */}
      {/* Pagination controls */}
      <div>
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </button>
        <span>
          Page{' '}
          <strong>
            {/* Display 1-based index */}
            {paginationState.pageIndex + 1} of {table.getPageCount() ?? -1}
          </strong>
        </span>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </button>
        <select
          value={paginationState.pageSize}
          onChange={e => {
            setPaginationState({ pageSize: Number(e.target.value) });
            // Optionally reset pageIndex to 0 when pageSize changes
            // setPaginationState({ pageSize: Number(e.target.value), pageIndex: 0 });
          }}
        >
          {[10, 20, 50, 100].map(size => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
```
This setup ensures that the TanStack Table's pagination state is driven by and updates the URL parameters (`?page=...&perPage=...`), making the table state persistent and shareable. Similar patterns can be applied to sorting, filtering, and column visibility state.

```

This completes the comprehensive documentation based on the provided text, structured for AI context.