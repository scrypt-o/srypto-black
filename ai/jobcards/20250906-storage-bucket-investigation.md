# Job Card - Storage Bucket Investigation

**Date**: 2025-09-06
**Task**: Fix broken upload API and investigate storage bucket setup
**Status**: In Progress

## PROBLEM
- Profile picture upload fails with "Internal server error"
- curl test shows 500 response from /api/storage/upload
- No profile images display (profile_picture_url is null in DB)

## INVESTIGATION PLAN
1. Check current specs for storage bucket information
2. Research Supabase Storage best practices online
3. Look at old codebase for working bucket setup patterns
4. Find the exact error causing 500 response
5. Fix API and test upload works

## WHAT I'VE FOUND SO FAR
- Upload API exists with security features
- ProfilePhotoSection component exists
- API calls profile update endpoint after upload
- Database profile_picture_url field is null (no uploads saved)

## FINDINGS
**Buckets**: ✅ All 4 buckets exist and working (profile-images, personal-documents, etc.)
**Storage**: ✅ Files being uploaded successfully (found 5 profile images from July)
**Problem**: ❌ Our API uses `getAuthenticatedApiClient()` but reference uses `getAuthenticatedServerClient()`

## ROOT CAUSE
Upload API function name mismatch:
- Reference: `getAuthenticatedServerClient()` 
- Current: `getAuthenticatedApiClient()`

This function difference is causing the 500 internal server error.

## NEXT STEPS  
- Fix function name in upload API
- Test upload works after fix
- Add proper error messages

## NOTES
- Don't copy old code blindly - use for reference only
- Focus on bucket setup, not full reimplementation
- Keep it simple - just make upload work