# Interaction Plan

This plan defines how the site will feel premium and conversion-focused without unnecessary complexity.

## Core Interaction Goals

- Make booking feel like the natural next action.
- Create an editorial, high-end bridal atmosphere.
- Keep performance strong on mobile.

## Planned Interactions

1. Animated hero intro with subtle motion.
2. Scroll reveal for section blocks and editorial cards.
3. Image-led collection and spotlight cards with refined hover states.
4. Sticky/floating mobile appointment CTA.
5. FAQ accordion with smooth expand/collapse.
6. Dress category filter interactions for collections.
7. Guided "Find your bridal style" quiz concept (phase rollout).

## Implemented So Far

- Sticky mobile appointment CTA bar is in place.
- Mobile navigation now supports a dedicated dropdown sheet pattern.
- Mobile burger trigger sizing is tuned for iPhone-class touch targets.
- Mobile header now hides on downward scroll and reappears on upward scroll.
- Desktop header density has been tightened while preserving centered-logo composition.
- Homepage section structure has expanded to support journey storytelling and stronger booking intent flow.
- Theme toggle is implemented with three modes (Royal Blue, Blush, Monochrome) and persistent preference.
- Theme dropdown closes on selection/outside click/Escape and supports keyboard semantics.
- Header layout now uses component-scoped styling (`site-header.module.css`) for faster iterative visual tuning.
- Default first-load theme is monochrome (persisted user preference still respected).
- Instagram social entry point now exists in both desktop navbar and mobile menu.
- Homepage hero is now image-led with a featured editorial panel and responsive supporting gallery strip.

## Implementation Principles

- Motion should support content hierarchy, not distract from it.
- Keep animation lightweight (CSS and minimal JS where possible).
- Prioritize accessibility: visible focus states, reduced-motion support, semantic structure.
- Every interactive pattern must preserve fast load and strong CLS/LCP behavior.

## Rollout Approach

- Build static structure first.
- Layer interactions after layout and typography foundation are stable.
- Validate conversion pathways after each interaction pass.
