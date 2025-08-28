#!/bin/bash

echo "🧪 Setting up AI default test users for Scrypto..."
echo ""
echo "NOTE: t@t.com is YOUR personal test user - not touched by this script"
echo ""
echo "This will create the following AI default test users:"
echo "  - test@example.com (AI default)"
echo "  - john.doe@example.com (AI favorite)"
echo "  - jane.doe@example.com"
echo "  - user@example.com"
echo "  - test@test.com"
echo "  - alice@example.com"
echo "  - bob@example.com"
echo "  - admin@example.com"
echo ""
echo "All with password: password123 (except t@t.com which uses t12345)"
echo ""

# Run the seed file
npx supabase db push --db-url "$DATABASE_URL" < supabase/seed.sql

echo "✅ Test users created!"
echo ""
echo "Now AI-generated tests will work with their default users!"