# UI Archive (Read-Only)

This folder exists to archive legacy / duplicate UI directories without deleting them.

## Status
- **READ-ONLY**: Do not edit, import from, or depend on anything under `archives/ui/`.
- **Single source of truth**: The only active frontend is `client/`.

## Why this exists
The repository historically contained more than one UI directory. To remove ambiguity (and keep the baseline stable), the non-active UI folder was moved here as an archived snapshot.

## What is archived
- `archives/ui/📄 client/` — archived copy of the former top-level emoji-named client folder.

## How to revert (undo the archive)
If you need to restore the folder back to the root (exactly as it was):

```bash
git mv "archives/ui/📄 client" "📄 client"
```
