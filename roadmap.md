# Maria's Quest — 3D Rebuild Roadmap

Full 3D rebuild (low-poly, R3F) alongside existing 2D game. 2D stays playable until 3D reaches parity.

## Stage 1 — Foundation + Act I playable (in progress)
- [ ] Install three/@react-three/fiber@^9/@react-three/drei@^10 + @types/three
- [ ] Source CC0 GLBs: animated female character (Quaternius), tree/nature (Kenney nature kit), verify glTF magic
- [ ] src/components/plan/quest3d/: Canvas3D, ActIMeadow scene, Player (WASD + mobile joystick, Idle/Walk/Run crossfade), FollowCamera
- [ ] Lighting/art direction: golden-hour hemisphere + directional shadows, fog, Environment Lightformers, low-poly toon look
- [ ] HUD3D: hearts, objective tracker, mobile joystick, title card
- [ ] Mount behind a "3D" toggle in quest section (ssr-safe)
- [ ] Verify in browser (screenshot + console clean)

## Stage 2 — Gameplay systems
- [ ] Enemies + melee attack, boss (Warden of Rushing Water) with 3D boss dialogue portraits
- [ ] Envelopes/collectibles, portal to Act II
- [ ] Save/load via existing maria_quest_saves table (new mode flag)

## Stage 3 — Acts II–V worlds
- [ ] Act II garden + keys + Conservatory, Act III town + Andrew companion, Act IV plateau dual bosses, Act V church interior + ceremony

## Stage 4 — Polish & cutover
- [ ] Post-processing (bloom/vignette), audio, haptics
- [ ] Migrate saves, make 3D the default mode, retire 2D
