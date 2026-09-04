# Maria's Quest — 3D Rebuild Roadmap

Full 3D rebuild (low-poly, R3F) alongside existing 2D game. 2D stays playable until 3D reaches parity.

## Stage 1 — Foundation + Act I playable ✅
- [x] Install three/@react-three/fiber@^9/@react-three/drei@^10 + @types/three
- [x] Source CC0 GLBs: KayKit Adventurers (Mage=Maria, Knight=Andrew, Rogue/Barbarian=bosses) + Kenney Nature Kit, verified
- [x] src/components/plan/quest3d/: Quest3D, Meadow scene, Player (WASD + joystick, Idle/Walk/Run/Spellcast crossfade), FollowCamera
- [x] Lighting: sky + fog + shadowed sun, Environment Lightformers
- [x] HUD3D: hearts, objective, joystick, act banner, attack button
- [x] Mounted behind "Enter the 3D Realm — Beta" on quest title screen (lazy-loaded, client-only)
- [x] Verified in browser: renders, walks, attacks, console clean

## Stage 2 — Gameplay systems
- [ ] Enemies + melee attack, boss (Warden of Rushing Water) with 3D boss dialogue portraits
- [ ] Envelopes/collectibles, portal to Act II
- [ ] Save/load via existing maria_quest_saves table (new mode flag)

## Stage 3 — Acts II–V worlds
- [ ] Act II garden + keys + Conservatory, Act III town + Andrew companion, Act IV plateau dual bosses, Act V church interior + ceremony

## Stage 4 — Polish & cutover
- [ ] Post-processing (bloom/vignette), audio, haptics
- [ ] Migrate saves, make 3D the default mode, retire 2D
