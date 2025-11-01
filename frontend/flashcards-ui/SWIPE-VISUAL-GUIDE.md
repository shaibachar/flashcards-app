# Swipe Gestures - Visual Guide

## 🎯 How It Works Now

### Stage 1: Touch Start
```
┌─────────────────────┐
│                     │
│    📝 FLASHCARD     │
│                     │
│   Touch detected    │
│   Element tracked   │
│   State reset       │
│                     │
└─────────────────────┘
      👆 (finger down)
```

### Stage 2: Intent Detection (5px threshold)
```
Movement detected...

Vertical (absY > absX * 1.5)?
     ↓
┌─────────────────────┐
│    ↕️ SCROLLING      │  ← User scrolling vertically
│  (gesture ignored)   │
└─────────────────────┘

Horizontal (absX > absY * 1.5)?
     ↓
┌─────────────────────┐
│  ↔️ SWIPING START    │  ← Swipe gesture begins
│ (visual feedback on) │
└─────────────────────┘
```

### Stage 3: Active Swipe (visual feedback)

#### Swipe Right (→) - Mark as Known
```
Progress: 0px → 30px → 60px → 100px+

┌─────────────────────┐
│  💚 FLASHCARD       │  ← Green tint appears
│     ↗️ 📝            │  ← Card rotates right
│  (slightly smaller)  │  ← Scale: 0.98
└─────────────────────┘  ← Opacity: 0.9
       →→→
```

Visual Changes:
- ✅ Background: Green overlay (opacity 0-30%)
- ✅ Transform: TranslateX(+40px)
- ✅ Scale: 0.98
- ✅ Rotate: +5deg
- ✅ Opacity: 0.9
- ✅ Haptic: Light vibration at 70px

#### Swipe Left (←) - Mark for Review
```
Progress: 0px → 30px → 60px → 100px+

┌─────────────────────┐
│       💔 FLASHCARD  │  ← Red tint appears
│          📝 ↖️       │  ← Card rotates left
│  (slightly smaller)  │  ← Scale: 0.98
└─────────────────────┘  ← Opacity: 0.9
       ←←←
```

Visual Changes:
- ✅ Background: Red overlay (opacity 0-30%)
- ✅ Transform: TranslateX(-40px)
- ✅ Scale: 0.98
- ✅ Rotate: -5deg
- ✅ Opacity: 0.9
- ✅ Haptic: Light vibration at 70px

### Stage 4A: Successful Swipe (60px+ or velocity 0.4+)

#### Flying Off Animation (Right)
```
Time: 0ms → 150ms → 300ms

     ┌─────────────┐
     │ ✅ KNOWN!   │  ← Flying off screen
     │    →→→      │  ← 150% translation
     └─────────────┘  ← Opacity: 0
                →→→
                      (card removed)

Animation:
• Duration: 300ms
• Transform: TranslateX(150%) Scale(0.8) Rotate(15deg)
• Opacity: 0
• Timing: ease-out
• Haptic: Medium vibration
```

#### Flying Off Animation (Left)
```
Time: 0ms → 150ms → 300ms

   ┌─────────────┐
   │ 📚 REVIEW!  │  ← Flying off screen
   │    ←←←      │  ← 150% translation
   └─────────────┘  ← Opacity: 0
←←←
      (card sent to end of deck)

Animation:
• Duration: 300ms
• Transform: TranslateX(-150%) Scale(0.8) Rotate(-15deg)
• Opacity: 0
• Timing: ease-out
• Haptic: Medium vibration
```

### Stage 4B: Incomplete Swipe (< 60px and < 0.4 velocity)

#### Snap Back Animation
```
Time: 0ms → 150ms → 300ms

┌─────────────────────┐
│    📝 FLASHCARD     │
│   ↶ (snapping back) │  ← Smooth return
│                     │
└─────────────────────┘

     Original Position

Animation:
• Duration: 300ms
• Transform: Reset to original
• Opacity: Reset to 1.0
• Background: Reset to transparent
• Timing: cubic-bezier(0.4, 0, 0.2, 1)
```

## 📊 Visual Feedback Formulas

### Translation (Horizontal Movement)
```
translateX = deltaX * 0.4

Example:
• User swipes 100px right
• Card moves 40px right
• Follows finger smoothly
```

### Scale (Size)
```
scale = max(0.95, 1 - (absX / 400))

Example:
• 0px: scale = 1.0 (100%)
• 100px: scale = 0.975 (97.5%)
• 200px: scale = 0.95 (95%)
• 400px+: scale = 0.95 (minimum)
```

### Rotation
```
rotation = deltaX * 0.05

Example:
• +100px right: rotate +5deg
• -100px left: rotate -5deg
• Natural card tilt effect
```

### Opacity (Transparency)
```
opacity = max(0.6, 1 - (absX / 250))

Example:
• 0px: opacity = 1.0 (100%)
• 50px: opacity = 0.8 (80%)
• 100px: opacity = 0.6 (60%)
• 250px+: opacity = 0.6 (minimum)
```

### Color Overlay
```
overlayOpacity = min(absX / 150, 0.3)

Example:
• 0px: overlay = 0 (invisible)
• 75px: overlay = 0.15 (subtle)
• 150px+: overlay = 0.3 (maximum)

Colors:
• Right: rgba(76, 175, 80, opacity)  [Green]
• Left: rgba(244, 67, 54, opacity)   [Red]
```

## 🎮 Gesture Recognition Logic

### Decision Tree
```
Touch Start
    ↓
Movement > 5px?
    ↓
   YES
    ↓
absY > absX * 1.5?
    ↓
   YES → Scrolling (vertical)
    ↓         ↓
    NO        Allow scroll
    ↓         Stop gesture
absX > absY * 1.5?
    ↓
   YES → Swiping (horizontal)
    ↓         ↓
    NO        Start visual feedback
    ↓         Track direction
Ambiguous     Apply transforms
    ↓
Continue tracking...
```

### Completion Check
```
Touch End
    ↓
Was Scrolling?
    ↓
   YES → Reset and exit
    ↓
    NO
    ↓
Check Thresholds:
    ↓
absX > 60px OR velocityX > 0.4?
    ↓
   YES → Successful Swipe
    │         ↓
    │     Animate off
    │     Record vote
    │     Haptic feedback
    ↓
    NO → Incomplete Swipe
         ↓
     Snap back
     Reset visuals
```

## 🎨 Color Coding

### Visual Language
```
🟢 GREEN = KNOWN
┌─────────────────────┐
│  ✅ I know this!    │
│  →→→ Swipe right    │
│  rgba(76,175,80,α)  │
└─────────────────────┘

🔴 RED = REVIEW
┌─────────────────────┐
│  📚 Need to review  │
│  ←←← Swipe left     │
│  rgba(244,67,54,α)  │
└─────────────────────┘

⚪ NO COLOR = NEUTRAL
┌─────────────────────┐
│  📝 Flashcard       │
│  No swipe active    │
│  rgba(0,0,0,0)      │
└─────────────────────┘
```

## 📱 Mobile-Specific Behaviors

### iPhone Safari
```
Features:
✅ Touch events
✅ Scroll detection
✅ Visual feedback
✅ Smooth animations
❌ Haptic (not supported by iOS)

Optimizations:
• -webkit-overflow-scrolling: touch
• overscroll-behavior-y: contain
• touch-action: manipulation
• user-scalable=no in viewport
```

### Android Chrome
```
Features:
✅ Touch events
✅ Scroll detection
✅ Visual feedback
✅ Smooth animations
✅ Haptic vibration

Optimizations:
• Vibration API support
• Hardware acceleration
• Pull-to-refresh prevention
• Touch-friendly targets (44px)
```

## 🔢 Threshold Summary

### Distance-Based
```
┌────────────────────────────────┐
│                                │
│  0px  ──────→  60px  ────→ ∞  │
│       fail      success         │
│                                │
└────────────────────────────────┘

Minimum: 60px horizontal distance
```

### Velocity-Based
```
┌────────────────────────────────┐
│                                │
│  0    ─────→  0.4   ────→  ∞  │
│  px/ms   fail    success        │
│                                │
└────────────────────────────────┘

Minimum: 0.4 pixels per millisecond
```

### Combined Logic
```
Success = (distance > 60px) OR (velocity > 0.4 px/ms)

Examples:
• 70px in 200ms (0.35 px/ms) = ✅ SUCCESS (distance)
• 50px in 100ms (0.5 px/ms) = ✅ SUCCESS (velocity)
• 40px in 200ms (0.2 px/ms) = ❌ FAIL (both below)
```

## 🎭 Animation Timeline

### Successful Swipe
```
0ms ─────────────────────→ 300ms
│                             │
Touch End                 Complete
    ↓                         ↓
Start animation          Card removed
    ↓                         ↓
Transform begins         New card appears
    ↓                         ↓
Opacity fades           Scroll to next
    ↓
Rotation increases
    ↓
Haptic feedback (20ms)
```

### Snap Back
```
0ms ─────────────────────→ 300ms
│                             │
Touch End                 Complete
    ↓                         ↓
Start return             Back to normal
    ↓                         ↓
Smooth transition        Ready for next swipe
    ↓
No haptic
```

## 💡 Tips for Users

### Quick Study Mode
```
Fast Flicks:
👉 → → → Known cards (quick swipes)
👈 ← ← ← Review cards (quick swipes)

Watch for:
• Flash of color
• Quick vibration (Android)
• Card disappears immediately
```

### Careful Review Mode
```
Slow Drags:
👉 → → → → → Known (slow, deliberate)
👈 ← ← ← ← ← Review (slow, deliberate)

Watch for:
• Color gradually appears
• Card transforms smoothly
• Vibration at 70px (Android)
• Can still snap back if unsure
```

### Visual Indicators
```
Progress Indicators:
• Opacity ↓ = Getting closer
• Scale ↓ = Movement confirmed
• Rotation = Direction confirmed
• Color = Action preview
• Haptic = Threshold reached
```

## 🎯 Success Indicators

### You Did It Right When:
```
✅ Card flies off screen
✅ Felt vibration (Android)
✅ Color appeared clearly
✅ Next card scrolls into view
✅ Action was recorded
```

### Try Again When:
```
⚪ Card snapped back
⚪ No vibration felt
⚪ Color was faint/unclear
⚪ Card stayed in place
⚪ No action recorded
```

---

**Visual Guide Version:** 2.0  
**Last Updated:** October 18, 2025  
**Component:** flashcard-scroll  
**Status:** ✅ Production Ready
