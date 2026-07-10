# DEVDARIANI Experience V2 Plan

## Context
- Stack: Next.js App Router 15.3.5, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Three, React Three Fiber and Drei.
- Current homepage remains unchanged at `/`.
- New experience will be built at `/experience-v2`, `/experience-v2/en`, and `/experience-v2/ka`.
- Existing dependencies include `three`, `@react-three/fiber`, `@react-three/drei`, and `framer-motion`.
- Missing requested packages: `@react-three/postprocessing`, `postprocessing`.

## Art Direction
- Reference mood: cinematic dark graphite interface, large restrained typography, right-biased mechanical-architectural sculpture, hairline UI, chapter rail, projected system labels.
- Avoid: DNA/helix, cross forms, generic particles, neon, gold-heavy styling, medical/scientific visuals, raster 3D object.
- Main object: “The Mechanical Orchestrator”, a procedural 3D sculpture made from primitives.

## File Structure
- `app/experience-v2/page.tsx`: redirect/default English entry.
- `app/experience-v2/[locale]/page.tsx`: localized experience route.
- `components/devdariani-v2/DevdarianiExperience.tsx`: client shell.
- `components/devdariani-v2/ExperienceHeader.tsx`
- `components/devdariani-v2/ChapterRail.tsx`
- `components/devdariani-v2/StoryChapter.tsx`
- `components/devdariani-v2/DevdarianiWordmark.tsx`
- `components/devdariani-v2/LanguageSwitcher.tsx`
- `components/devdariani-v2/ProjectIndex.tsx`
- `components/devdariani-v2/scene/OrchestricsCanvas.tsx`
- `components/devdariani-v2/scene/OrchestricsScene.tsx`
- `components/devdariani-v2/scene/MechanicalOrchestrator.tsx`
- `components/devdariani-v2/scene/CameraRig.tsx`
- `components/devdariani-v2/scene/SceneLighting.tsx`
- `components/devdariani-v2/scene/SceneEffects.tsx`
- `components/devdariani-v2/scene/ProjectedSystemLabels.tsx`
- `components/devdariani-v2/scene/scene-keyframes.ts`
- `components/devdariani-v2/scene/geometry-spec.ts`
- `lib/devdariani-v2/copy.ts`
- `lib/devdariani-v2/locales.ts`
- `lib/devdariani-v2/motion.ts`
- `lib/devdariani-v2/scene-state.ts`

## Milestones
1. Dependencies and foundation
   - Add missing postprocessing packages if compatible.
   - Add `/experience-v2` routing and typed locale copy.
   - Add global CSS variables for V2 color system.
   - Verify TypeScript/build.

2. Static interface and wordmark
   - Implement custom vector/HTML `DevdarianiWordmark` with engineered V and A glyphs.
   - Build header, language switcher, chapter rail, story chapter layout and fallback silhouette.
   - Verify desktop and mobile layout without WebGL reliance.

3. Persistent WebGL scene
   - Implement one fixed persistent Canvas.
   - Build procedural Mechanical Orchestrator with central spine, layered core, incomplete arcs, structural slabs, rods and system nodes.
   - Add studio lighting, ACES tone mapping, subtle postprocessing and reduced-motion fallback.
   - Add pointer parallax and scroll-driven scene state via refs/MotionValues.

4. Story integration
   - Map scroll chapters to deterministic keyframes.
   - Add projected system labels on desktop and simplified mobile labels.
   - Add work placeholder without fake project data.
   - Add debug mode via `?debug3d=1`.

5. Verification
   - Run `npm run lint` and `npm run build`.
   - Browser verify `/experience-v2/en` and `/experience-v2/ka`.
   - Capture/inspect desktop and mobile states: hero, approach, systems, orchestrics, contact.

## Verification Commands
- `npm run lint`
- `npm run build`
- Local preview: `next start -H 127.0.0.1 -p 3000`
- Browser routes:
  - `http://127.0.0.1:3000/experience-v2`
  - `http://127.0.0.1:3000/experience-v2/en`
  - `http://127.0.0.1:3000/experience-v2/ka`
  - `http://127.0.0.1:3000/experience-v2/en?debug3d=1`

## Risks
- `npm run lint` currently maps to `next lint`, which may not be supported by Next 15; if it fails due tool removal, document the limitation and use TypeScript/build verification.
- React 19 plus R3F/Drei compatibility should be checked through production build and browser render.
- Postprocessing packages may require network install approval.
- The reference includes image-like richness; V1 implementation must approximate with real procedural primitives, not raster/GLB.
