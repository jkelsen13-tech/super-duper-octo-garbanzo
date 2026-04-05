/**
 * Tolerance Algorithm
 * ───────────────────
 * Produces a 0–100 index from a user's session history.
 *
 * Key design decisions:
 *  • Recent sessions count more (exponential time-decay, half-life = 10 days)
 *  • Method matters: dabs build tolerance faster than edibles
 *  • Amount matters: more grams = higher contribution
 *  • Subjective feel matters: if it barely hit (feel=1), lower contribution
 *  • T-break adds additional on-top decay based on sober days elapsed
 */

// Method potency multiplier — reflects how quickly each method builds tolerance
const METHOD_WEIGHT = {
  dab:          3.0,
  concentrate:  2.5,
  flower:       1.5,
  'pre-roll':   1.5,
  vape:         1.2,
  edible:       1.0,
  capsule:      0.8,
}

// Approximate grams-equivalent for size categories (for non-weight methods)
const SIZE_GRAMS = {
  small:   0.15,
  medium:  0.30,
  large:   0.50,
  massive: 0.80,
}

// Half-life in days: session contribution halves every N days
const HALF_LIFE_DAYS = 10

// Max theoretical raw score (used to normalise to 0–100)
// Worst case: 3g dab (weight 3.0), feel=5, every day for 30 days, all at decay=1
// ≈ 3 * 3.0 * (5/3) * sum(exp(-ln2/10 * d) for d in 0..29) ≈ 15 * 11.1 ≈ 166
const NORMALISE_MAX = 180

/**
 * Calculate tolerance index for a user.
 *
 * @param {Array}       sessions     – array of session rows from Supabase
 * @param {object|null} activeTBreak – the active t-break row (or null)
 * @returns {number} integer 0–100
 */
export function calcTolerance(sessions, activeTBreak) {
  if (!sessions || sessions.length === 0) return 0

  const now = Date.now()
  const decayRate = Math.LN2 / HALF_LIFE_DAYS  // λ = ln2 / half-life

  let raw = 0

  for (const s of sessions) {
    // Days since this session
    const daysAgo = (now - Date.parse(s.logged_at)) / 86_400_000

    // Exponential time-decay
    const decay = Math.exp(-decayRate * daysAgo)

    // Effective amount in grams
    const grams = s.amount
      ?? SIZE_GRAMS[s.size_category]
      ?? 0.25

    // Method potency
    const potency = METHOD_WEIGHT[s.method] ?? 1.0

    // Subjective feel normalised around 1.0 (feel=3 is neutral)
    const feelFactor = s.feel ? s.feel / 3 : 1.0

    raw += grams * potency * feelFactor * decay
  }

  // Normalise to 0–100
  let score = Math.min(100, Math.round((raw / NORMALISE_MAX) * 100))

  // Additional decay if actively on a t-break
  if (activeTBreak?.started_at) {
    const breakDays = (now - Date.parse(activeTBreak.started_at)) / 86_400_000
    // Each clean day on t-break sheds 3 extra points
    score = Math.max(0, Math.round(score - breakDays * 3))
  }

  return score
}

/**
 * Returns a human-readable tier for a tolerance score.
 */
export function toleranceTier(score) {
  if (score <= 15) return { label: 'fresh',    cssClass: 'lo',       color: '#0a4a38' }
  if (score <= 35) return { label: 'light',    cssClass: 'lo',       color: '#16755c' }
  if (score <= 55) return { label: 'building', cssClass: 'md',       color: '#5e2d99' }
  if (score <= 75) return { label: 'elevated', cssClass: 'hi',       color: '#b07218' }
  return                   { label: 'peak',    cssClass: 'hi',       color: '#c0392b' }
}

/**
 * Projects future tolerance score N days from now given a use schedule.
 *
 * @param {Array}   sessions       – existing session history
 * @param {object}  activeTBreak   – active t-break (or null)
 * @param {Array}   targetDaysMask – e.g. [0,2,4] = Mon/Wed/Fri (day-of-week 0=Mon)
 * @param {number}  daysAhead
 * @returns {number[]} array of length daysAhead, each entry 0–100
 */
export function projectTolerance(sessions, activeTBreak, targetDaysMask, daysAhead = 14) {
  const projections = []
  for (let d = 1; d <= daysAhead; d++) {
    // Synthesise a future date
    const futureDate = new Date(Date.now() + d * 86_400_000)
    const dow = (futureDate.getDay() + 6) % 7  // 0=Mon

    // Build a projected session list: existing + assumed future sessions on target days
    const projected = [...sessions]
    if (targetDaysMask.includes(dow) && !activeTBreak) {
      projected.push({
        logged_at: futureDate.toISOString(),
        method: 'flower',
        amount: 0.3,
        feel: 3,
      })
    }

    // Mock future state: no t-break for projection
    projections.push(calcTolerance(projected, null))
  }
  return projections
}
