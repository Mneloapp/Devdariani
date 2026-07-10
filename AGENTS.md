# DEVDARIANI EXPERIENCE — AGENT RULES

## Product
This repository contains the DEVDARIANI brand website.

DEVDARIANI is a premium engineering brand built around:
- The Art of Orchestrics™
- Orchestrics™
- Engineering the Whole.

Brand personality:
- Confident
- Precise
- Calm

Visual principles:
- Perfect Control
- Quiet Confidence
- Precision in Every Detail

## Core visual direction
The uploaded DEVDARIANI reference images are the authoritative art direction.

The experience must feel:
- cinematic
- architectural
- intelligent
- restrained
- premium
- technically precise
- genuinely three-dimensional

It must never feel:
- like a generic corporate website
- like a SaaS landing page
- like a gaming website
- like crypto/Web3
- like a medical DNA visualization
- like a particle demo
- like a template
- like a flat SVG pretending to be 3D

## Hard prohibitions
Never use:
- DNA chains
- helixes
- cross-shaped compositions
- generic particle clouds
- gears
- pipes as logos
- hexagon clichés
- skyline icons
- bright blue corporate colors
- neon
- gold-heavy luxury styling
- glassmorphism
- generic service cards
- fake project data
- Mnelo references
- raster images as the main 3D object

## 3D rule
The main experience must use one persistent real WebGL Canvas built with React Three Fiber.

The 3D object must:
- have visible depth and occlusion
- use perspective
- react subtly to pointer movement
- rotate slowly in actual 3D
- transform during scroll
- use moving specular highlights
- be constructed procedurally from real 3D primitives

CSS transforms, SVG animation, videos, and flat illustrations do not count as the primary 3D experience.

## Brand wordmark
DEVDARIANI is typography-first.

The wordmark must be recreated as vector/HTML typography, not used as a raster image.

Custom glyph rules:
- The V is formed from two diagonal strokes with a small, deliberate gap at its lower vertex.
- Both A letters have no crossbar.
- Each A is formed from two diagonal strokes with the same-sized gap at its upper apex.
- The gap and stroke logic must be visually consistent between V and A.
- All other letters remain clean, modern and restrained.

## Development rules
- Inspect the existing repository before changing anything.
- Preserve unrelated working functionality.
- Keep the current homepage unchanged while developing the new experience.
- Build the new version first at /experience-v2.
- Use reusable typed components.
- Keep content separate from presentation.
- Run lint and production build after each milestone.
- Fix all TypeScript, hydration and build errors.
- Respect prefers-reduced-motion.
- Provide a graceful WebGL fallback.
- Do not declare completion without visual browser verification.

## Definition of done
The task is complete only when:
1. /experience-v2 renders successfully.
2. A real WebGL canvas is visible.
3. The sculpture clearly has depth.
4. Scroll visibly changes the sculpture’s composition and camera.
5. The uploaded visual references are recognizably reflected in the result.
6. Desktop and mobile layouts are verified.
7. npm run lint passes.
8. npm run build passes.
