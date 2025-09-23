Great — let’s expand on **SM5** and **SM15** — these are later evolutions of the same **SuperMemo** *Spaced Repetition* idea, but with refinements that improve accuracy for different learning needs.

---

## 📚 **Background**

Piotr Wozniak (the creator of SuperMemo) kept improving his algorithms as he learned more about how humans forget — each version is an attempt to get closer to *optimal intervals* for long-term retention.

* **SM2** → early, simple, stable (used in Anki)
* **SM5** → better modeling of forgetting, more parameters
* **SM15** → modern, used in SuperMemo today, very sophisticated

---

## 🔢 **SM5 — What’s New vs SM2**

SM5 came out in the early 90s. Its main improvements were:

* Adds more precise control for *difficulty* of items.
* Tracks *individual forgetting curves* for each item.
* Uses a *matrix* of intervals and recall grades instead of just E-Factor.
* Introduces concepts like *priority* — not all items are equal.

Key difference: SM5 treats item difficulty as more dynamic — it learns how *each fact* behaves over time. SM2 only uses the E-Factor to generalize.

**Practical effect:** More accurate intervals, but more complicated to implement. This version was still mostly internal to SuperMemo and not widely cloned like SM2.

---

## 🔬 **SM15 — The Latest Generation**

SM15 is the basis for the *current SuperMemo* desktop app (SuperMemo 18 and up).

It’s very advanced:

* Uses a *neural-like* model of forgetting.
* Models your *long-term memory* with massive matrices for every possible combination of repetition count, interval, grade, and item difficulty.
* Continuously adjusts these models with *actual user performance*.
* Supports *priority-based learning*: you can have thousands of items, but the system always picks what’s most worth your time.
* Handles “item protection”: items that are too important to ever be forgotten can be forced to repeat more often.

SM15 is sometimes described as a **hybrid of spaced repetition + AI** — though it’s more a huge dynamic database than generative AI.

---

## 🧠 **How SM15 works in practice**

* When you review an item, SM15 logs the grade, time taken, and interval.
* The system updates its internal memory matrix.
* The next interval is predicted using this updated model.
* The system *optimizes* for maximum retention with minimum time — personalized for your brain.

---

## ⚙️ **Key differences SM2 → SM5 → SM15**

| Feature             | SM2             | SM5              | SM15                         |
| ------------------- | --------------- | ---------------- | ---------------------------- |
| E-Factor            | Single number   | Multi-parametric | Multi-dimensional matrix     |
| Personalization     | Basic           | Per-item curves  | Fully personalized matrix    |
| Difficulty tracking | Simple          | Item-specific    | Item-specific, time-adjusted |
| Priority            | None            | Limited          | Full priority queue          |
| Dynamic scheduling  | Fixed formula   | Smarter formula  | Continuously learning        |
| Practical usage     | Anki, Mnemosyne | SuperMemo        | SuperMemo only               |

---

## ✅ **Bottom line**

* **SM2**: Good enough for most people. Simple, robust, easy to implement.
* **SM5**: A bridge — more precision, but not very user-friendly to code.
* **SM15**: Most powerful, but proprietary and complex.

---

## 🔍 **Bonus**

Some modern SRS apps like **Anki** still mainly use SM2 with small tweaks.
There are community plugins that try to add “SM5-like” or “FSRS” (Free Spaced Repetition Scheduler) features — for example, FSRS is an open-source *machine-learned* replacement for SM2 that better fits personal forgetting curves.

---

**If you want**, I can:
✅ Show you an **SM2 Python code snippet**
✅ Explain **FSRS** (modern community alternative)
✅ Help you design your own algorithm inspired by SM15 logic

Excellent choice — let’s design a **custom Spaced Repetition Algorithm** inspired by **SM15** — but keep it *understandable* and *practical* so you could actually code or integrate it in your own app.

---

## 📌 **Goal**

Design an algorithm that:
✅ Adapts intervals *per user, per item*
✅ Learns from *actual performance*
✅ Supports *priority* so you study the most important things first
✅ Is more modern than SM2, but not a black box

---

## ⚙️ **Core Principles (SM15-inspired)**

**1️⃣. Each card has:**

* `interval` → days until next review
* `repetition` → how many times it’s been reviewed
* `difficulty` → an estimate of how hard it is for *you* (dynamic!)
* `priority` → how important it is to learn (set by user)

---

**2️⃣. After each review you log:**

* `grade` (0–5)
* `time taken` (optional, but cool)
* `lag` — how late/early you reviewed

---

**3️⃣. Update `difficulty` dynamically:**
Use an updated difficulty formula:

```
new_difficulty = old_difficulty + adjustment
```

Example:

```
adjustment = 0.1 - (grade - 3) * 0.1
```

So:

* Good grade → difficulty goes down.
* Bad grade → difficulty goes up.

Bound it:

```
if difficulty < 1.3: difficulty = 1.3
if difficulty > 3.0: difficulty = 3.0
```

---

**4️⃣. Predict next interval using dynamic matrix**

This is the core SM15 idea:
Instead of a single E-Factor, store a *matrix* or *table* like:

| Repetition | Difficulty | Interval Multiplier |
| ---------- | ---------- | ------------------- |
| 1          | 2.5        | 1.3                 |
| 2          | 2.0        | 2.0                 |
| 3          | 1.8        | 2.5                 |
| ...        | ...        | ...                 |

You update this table over time with actual results:

* If a card was easy → increase multiplier.
* If it was hard → decrease multiplier.

---

**5️⃣. Compute next interval:**

```
next_interval = last_interval * multiplier * priority_factor
```

Where:

* `multiplier` comes from your matrix.
* `priority_factor` might boost high-priority cards.

Example:

```
priority_factor = 1.0 for normal
priority_factor = 1.2 for very important items
```

---

**6️⃣. Keep stats to refine the matrix**

This is the “learning” part:

* Store `(repetition, difficulty, grade)` data.
* Over time, adjust multipliers to better match actual forgetting.

---

## 🗂️ **Optional bonus — Priority Queue**

Keep a daily queue:

* Pick `N` cards due *today*.
* If you have extra time, pick the next-highest priority items.
* If overloaded, drop low-priority cards to tomorrow.

---

## 🧩 **Putting it all together — Pseudo-code**

Here’s a **high-level flow**:

```python
# Example data per card
card = {
    'interval': 6,  # days
    'repetition': 3,
    'difficulty': 2.3,
    'priority': 1.2
}

# User reviews
grade = 4  # e.g., user pressed "4: pretty easy"

# Update difficulty
adjustment = 0.1 - (grade - 3) * 0.1
card['difficulty'] = max(1.3, min(3.0, card['difficulty'] + adjustment))

# Lookup multiplier (you could precompute or use formula)
multiplier = lookup_multiplier(card['repetition'], card['difficulty'])

# Compute new interval
next_interval = card['interval'] * multiplier * card['priority']

# Update repetition count
if grade < 3:
    card['repetition'] = 1
    next_interval = 1
else:
    card['repetition'] += 1

card['interval'] = next_interval
```

---

## 🧠 **Key differences vs SM2**

|                        | SM2 | SM15-inspired Custom |
| ---------------------- | --- | -------------------- |
| Single E-Factor        | ✅   | ❌                    |
| Per-item difficulty    | ❌   | ✅                    |
| Adaptive matrix        | ❌   | ✅                    |
| Priority               | ❌   | ✅                    |
| Data-driven refinement | ❌   | ✅                    |

---

## 📌 **How to refine**

* Start simple: fixed multipliers.
* Log results in a database.
* Periodically analyze performance.
* Tune multipliers with statistics (mean success rate).

---

## ✅ **Benefits**

* You *don’t* need heavy AI.
* It’s explainable.
* It personalizes per item.
* It works with tiny or big decks.
* You can code this in Python, JS, or your mobile app easily.

---

## 🚀 **Next step**

If you like, I can:

* Write a **full Python version** with data storage.
* Help you design a **schema** for the matrix.
* Show how to analyze user data to tune multipliers.
* Or wrap this in a *small API* you can call from your app.
