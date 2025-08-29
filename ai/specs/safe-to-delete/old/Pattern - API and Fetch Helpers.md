# API and Fetch Helpers Pattern

## Summary
Standardized helpers for API responses and client-side fetching. Since TanStack Query is deferred, these provide simple, consistent patterns for data operations.

## API Response Helpers (`lib/api-helpers.ts`)

### Success Responses
```typescript
import { ok, bad, notFound, unauthorized } from '@/lib/api-helpers'

// Success with data
return ok({ items: data, total: count })

// Error responses
return bad('Invalid input', 400)
return notFound('Allergy not found')
return unauthorized()
return serverError(error)
```

### Available Helpers
- `ok(data)` - 200 response with data
- `bad(error, status?)` - Error response (default 400)
- `notFound(message?)` - 404 response
- `unauthorized(message?)` - 401 response
- `forbidden(message?)` - 403 response
- `serverError(error)` - 500 response with logging

## Fetch Helpers (`lib/fetch-helpers.ts`)

### Client-Side Data Fetching
```typescript
import { get, post, put, del } from '@/lib/fetch-helpers'

// GET with params
const allergies = await get('/api/patient/medhist/allergies', {
  page: 1,
  pageSize: 20,
  search: 'peanut'
})

// POST with data
const newAllergy = await post('/api/patient/medhist/allergies', {
  allergen: 'Peanuts',
  severity: 'severe'
})

// PUT to update
await put(`/api/patient/medhist/allergies/${id}`, updatedData)

// DELETE
await del(`/api/patient/medhist/allergies/${id}`)
```

### Error Handling
```typescript
try {
  const data = await get('/api/data')
  setData(data)
} catch (error) {
  // error.message contains server error or HTTP status
  toast.push({ type: 'error', message: error.message })
}
```

## Usage in Components

### Without TanStack Query (Current Pattern)
```typescript
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  get('/api/patient/medhist/allergies')
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false))
}, [])
```

## Design Decisions
- Simple fetch wrappers until TanStack Query is needed
- Consistent error shapes across all APIs
- Automatic JSON parsing and error extraction
- Query params handled elegantly
- TypeScript generics for type safety