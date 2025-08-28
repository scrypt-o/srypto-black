# scrypto_auth_patterns DDL

## Table Structure

```sql
CREATE TABLE scrypto_auth_patterns (
  id INTEGER NOT NULL,
  context_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  import_statement TEXT NOT NULL,
  function_name TEXT NOT NULL,
  behavior_on_no_auth TEXT NOT NULL,
  http_status_code INTEGER,
  example_code TEXT NOT NULL,
  common_mistakes TEXT,
  created_at TIMESTAMP
);
```

## Description
Stores authentication patterns and examples for different contexts in the Scrypto application.

## Key Fields
- `id`: Primary key (INTEGER)
- `context_type`: Context where auth pattern applies
- `file_name`: Associated file name
- `import_statement`: Required import statement
- `function_name`: Function implementing the pattern
- `behavior_on_no_auth`: What happens when not authenticated
- `http_status_code`: HTTP status returned on auth failure
- `example_code`: Code example demonstrating pattern
- `common_mistakes`: Common implementation mistakes
- `created_at`: Record creation timestamp