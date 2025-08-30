# admin__feature__request DDL

## Table Structure

```sql
CREATE TABLE admin__feature__request (
  request_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  request_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT,
  description TEXT,
  requested_date DATE NOT NULL,
  requester_email TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  type TEXT NOT NULL,
  request_name TEXT NOT NULL,
  is_active BOOLEAN
);
```

## Description
Stores admin feature requests from users including request details, priority, status tracking.

## Key Fields
- `request_id`: Primary key (UUID)
- `user_id`: Foreign key to user (UUID)
- `title`: Request title 
- `request_type`: Type of request
- `priority`: Priority level
- `status`: Current request status
- `description`: Detailed description
- `requested_date`: Date request was made
- `requester_email`: Email of requester
- `type`: Request type classification
- `request_name`: Name of the request
- `is_active`: Active flag for soft delete
- `created_at`, `updated_at`: Audit timestamps