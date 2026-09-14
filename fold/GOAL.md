# Fold goal: feed a logo from a flat line

## Intent

Create the logo by reshaping one continuous, flat horizontal line into the logo drawing. The line enters from the left and its right-hand material is progressively folded into the logo; there must not be a second line, pulse, or independently flying logo.

## Desired motion

1. Begin with one long, straight horizontal strip from the left to the right-side construction point.
2. The strip's total length must equal the full scaled length of the logo drawing route.
3. If that length exceeds the viewport, curl the excess material visibly on the left instead of clipping it offscreen. Keep a straight run from the curl into the right-side handoff point.
4. Keep the strip's right endpoint fixed as the handoff point.
5. Starting at that endpoint, progressively reshape the strip into the logo route. The boundary between straight material and shaped material must travel from right to left.
6. The forming route starts low at the handoff point and rises as the line is shaped; it must not translate into the scene as a separate object.
7. Finish with the complete logo route, with all of the original strip consumed into that route.

## Important constraints

- There is one visible drawing stroke. The reset line and the final logo are two shapes of the same path, not separate paths shown together.
- The feed direction is left to right; the logo must not assemble from the left or appear to be drawn independently of the feed.
- The right-side endpoint stays stable while the stroke changes shape.
- The complete starting line remains visible inside the stage; excess length is represented by a non-crossing curl on the left.
- The straight line should visibly become the active logo route at its right end, with no gap or overlay.
- The rising motion should come from reshaping the path's points, not translating, scaling, or flying in a finished logo.
- Preserve the existing one-pass route from the base logo design and avoid adding crossing or overlapping drawing paths.

## Acceptance checks

- On reset, the stage shows only one flat horizontal line with its active end on the right.
- During playback, the right end of the line visibly bends first and the bend travels left through the strip.
- The full reset line is visible, including its curled left-hand excess and its straight run into the logo handoff.
- The first logo geometry appears at the right endpoint and is low; it rises as the route grows.
- Every intermediate frame is one connected stroke with a straight section on the left and a shaped section on the right.
- No gap appears between the incoming feed and the forming logo.
- The final frame is a complete, upright logo on the right side, with the left side of the strip having fed into it.
- Reset and replay remain deterministic.

## Current gap

The existing study animates `#line-pulse` and `#logo-fold` as separate timeline items, then changes the whole logo transform. The next implementation should use one visible path whose points begin collinear and interpolate into sampled points from the one-pass route, starting at the fixed right endpoint and progressing toward the left.
