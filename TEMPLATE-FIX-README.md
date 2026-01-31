# Template Fix Script

This script fixes any template slug issues in the database.

## Problem
If you see an error like "The template 'classic' does not exist", it means there's a template with an incorrect slug in the database.

## Solution

Run this command to fix the templates:

```bash
npx tsx scripts/fix-templates.ts
```

This will:
1. Check for any templates with incorrect slugs (like "classic" instead of "classic-green")
2. Delete incorrect templates
3. Ensure all 10 correct templates exist with proper slugs
4. Display the final list of templates

## Correct Template Slugs

The correct template slugs are:
- `modern-blue` (Free)
- `classic-green` (Free)
- `minimalist-gray` (Free)
- `friendly-yellow` (Free)
- `elegant-purple` (Premium)
- `bold-red` (Premium)
- `corporate-navy` (Premium)
- `fresh-orange` (Premium)
- `professional-black` (Premium)
- `tech-teal` (Premium)

## After Running

After running the fix script, refresh your browser and the template error should be resolved.
