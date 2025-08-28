#!/bin/bash

# Install Jest and testing dependencies for Scrypto medical portal

echo "📦 Installing Jest and testing dependencies..."

# Core Jest packages
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  jest-environment-jsdom \
  @jest/globals

# React Testing Library
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @testing-library/react-hooks

# Additional testing utilities
npm install --save-dev \
  jest-junit \
  jest-watch-typeahead \
  identity-obj-proxy \
  node-mocks-http \
  supertest \
  @types/supertest \
  msw

# Coverage tools
npm install --save-dev \
  @vitest/coverage-v8

echo "✅ Jest dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Run 'npm test' to run all tests"
echo "2. Run 'npm run test:watch' for development"
echo "3. Run 'npm run test:coverage' to check coverage"
echo "4. Run 'npm run test:medical' for critical medical tests"
echo ""
echo "🏥 Remember: Medical software requires minimum 80% test coverage!"