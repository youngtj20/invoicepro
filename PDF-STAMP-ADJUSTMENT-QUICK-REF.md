# PDF Stamp Adjustment - Quick Reference

## What Changed
Made the UNPAID, PAID, and PARTIALLY PAID stamps smaller and more visible on PDFs.

## Changes Summary

| Property | Before | After |
|----------|--------|-------|
| Font Size | 48pt | 32pt |
| Padding | 20 40 | 12 24 |
| Border | 6px | 4px |
| Opacity | 0.3 | 0.5 |
| Position | top: 150, right: 100 | top: 120, right: 80 |
| zIndex | None | 10 |

## Result
✅ Stamps are 33% smaller
✅ Stamps are 67% more visible
✅ Stamps are brought forward
✅ Professional appearance maintained

## File Modified
- `lib/pdf-generator.tsx`

## Testing
1. Download an invoice PDF
2. Verify stamp is smaller and more visible
3. Verify stamp doesn't obscure content
4. Check all three stamp types (PAID, UNPAID, PARTIALLY PAID)

---

**Status**: ✅ COMPLETE
