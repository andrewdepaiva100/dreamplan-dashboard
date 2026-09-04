# Fix the 404 on the shared game link

## What's happening
The game page exists in your working version, but the live site at `dreamplan-dashboard.lovable.app` is still the older published copy, which has no game page. That's why your friend's link shows "Page not found".

## The fix
Publish the current version. Nothing in the app needs to change — the game page, the password lock on the main plan, and everything else are already built.

After publishing, this link works for your friend:
`https://dreamplan-dashboard.lovable.app/game`

They'll land straight on the game, with no way to reach the financial plan (that still asks for your password).

## Steps
1. Publish the project (re-deploy the current version).
2. Load the `/game` link once to confirm it opens the game instead of the 404 page.
