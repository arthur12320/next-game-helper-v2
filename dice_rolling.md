# Feature Spec: Dice Roll Visual Feedback

## Overview

Add a simple visual animation to skill rolls in `src/components/dg-character/DGPlayMode.tsx` so the user gets immediate feedback when an auto roll happens.

## Goal

When the player clicks **Roll d100** in the skill roll modal, the UI should briefly animate the result area with a simple number-flip effect before showing the final rolled value.

## Scope

- Applies only to the **Auto Roll** path.
- Reuses the existing roll modal in `DGPlayMode.tsx`.
- Uses a lightweight animation only; no full dice simulator or complex suspense sequence.

## Behavior

1. User opens the skill roll modal.
2. User clicks **Roll d100** in **Auto Roll** mode.
3. The UI generates the roll value as it does today.
4. The result display performs a short **number-flip** animation.
5. The final result is shown in the existing success/failure panel.
6. Manual roll mode remains unchanged.

## Animation Requirements

- The animation should be brief and simple.
- It should visually communicate that a roll happened.
- It should not add a separate dice screen or a large animated dice object.
- It should not delay the result for suspense; the animation is just a quick flourish.

## Non-Goals

- No dice animation for manual input rolls.
- No additional game logic changes.
- No change to success/failure rules.
- No new backend behavior.
- No persistence of animation state.

## Acceptance Criteria

- Auto rolling a skill shows a short number-flip animation.
- The final rolled value is still clearly visible in the existing result area.
- Manual roll mode behaves exactly as before.
- The feature stays visually simple and lightweight.
