# Increase Lovable Cloud Database Disk

## Goal
Grow the Lovable Cloud database data disk from the current ~70 MB to 500 MB so the app has plenty of room for future plan data, expenses, notes, and devotional history.

## Current state
- Database size: 10.6 MB
- Data disk usage: 15% of ~70 MB total
- No disk pressure or errors currently

## Proposed change
Use Lovable Cloud's disk resize control to increase the provisioned data disk to **0.5 GB (500 MB)**.

## Notes
- Disk can only grow, never shrink.
- Only one disk resize is allowed every few hours.
- This affects only data storage, not compute/memory.
- After resize, the database may take a few minutes to restart with the larger disk.

## Approval needed
Please confirm you want to proceed with the resize to 500 MB.
