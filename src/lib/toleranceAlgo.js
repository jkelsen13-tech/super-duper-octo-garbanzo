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

// Method potency multiplier
const METHOD_WEIGHT = {
  dab:          3.0,
  concentrate:  2.5,
  flower:       1.5,
  'pre-roll':   1.5,
  vape:         1.2,
  edible:       1.0,
  capsule:      0.8,
}

// Approximate grams-equivalent for size categories
const SIZE_GRAMS = {
  small:   0.15,
  medium:  0.30,
  large:   0.50,
  massive: 0.80,
}

// Half-life in days: contribution halves every N days
const HALF_LIFE_DAYS = 10
const DECAY_RATE = Math.LN2 / HALF_LIFE_DAYS  // λ

// Calibrated so that 0.5g flower every other day for 30 days ≈ 70/100.
// Derived: sum = 0.75 * geometric_series ≈ 5.13; NORMALISE_MAX = 5.13/0.70 ≈ 7.3
const NORMALISE_MAX = 8

function sessionContribution(s, daysAgo) {
  const decay      = Math.exp(-DECAY_RATE * daysAgo)
  const grams      = s.amount ?? SIZE_GRAMS[s.size_category] ?? 0.25
  const potency    = METHOD_WEIGHT[s.method] ?? 1.0
  const feelFactor = s.feel ? s.feel / 3 : 1.0
  return grams * potency * feelFactor * decay
}

/**
 * Calculate current tolerance index (0–100) from session history.
 */
export function calcTolerance(sessions, activeTBreak) {
  if (!sessions || sessions.length === 0) return 0

  const now = Date.now()
  let raw = 0
  for (const s of sessions) {
    const daysAgo = (now - Date.parse(s.logged_at)) / 86_400_000
    raw += sessionContribution(s, daysAgo)
  }

  let score = Math.min(100, Math.round((raw / NORMALISE_MAX) * 100))

  if (activeTBreak?.started_at) {
    const breakDays = (now - Date.parse(activeTBreak.started_at)) / 86_400_000
    score = Math.max(0, Math.round(score - breakDays * 3))
  }

  return score
}

/**
 * Returns a human-readable tier for a tolerance score.
 */
export function toleranceTier(score) {
  if (score <= 15) return { label: 'fresh',    cssClass: 'lo', color: '#0a4a38' }
  if (score <= 35) return { label: 'light',    cssClass: 'lo', color: '#16755c' }
  if (score <= 55) return { label: 'building', cssClass: 'md', color: '#5e2d99' }
  if (score <= 75) return { label: 'elevated', cssClass: 'hi', color: '#b07218' }
  return                   { label: 'peak',    cssClass: 'hi', color: '#c0392b' }
}

/**
 * Calculate the long-run plateau tolerance for a given schedule.
 *
 * Uses the infinite geometric series: C / (1 - exp(-λT))
 * where T = days between sessions and C = per-session contribution.
 *
 * @param {number} sessionsPerWeek  – e.g. 3
 * @param {number} avgGrams         – average grams per session (default 0.35)
 * @param {string} method           – dominant method (default 'flower')
 * @param {number} avgFeel          – average feel 1–5 (default 3)
 * @returns {number} plateau score 0–100
 */
export function calcSchedulePlateau(sessionsPerWeek, avgGrams = 0.35, method = 'flower', avgFeel = 3) {
  if (sessionsPerWeek <= 0) return 0
  const T          = 7 / sessionsPerWeek                  // days between sessions
  const C          = avgGrams * (METHOD_WEIGHT[method] ?? 1.5) * (avgFeel / 3)
  const r          = Math.exp(-DECAY_RATE * T)
  const plateauRaw = C / (1 - r)
  return Math.min(100, Math.round((plateauRaw / NORMALISE_MAX) * 100))
}

/**
 * Projects tolerance over the next N days given a target weekly schedule.
 * Simulates future sessions on the target days and runs calcTolerance.
 *
 * @param {Array}   sessions       – actual session history
 * @param {object}  activeTBreak   – active t-break or null
 * @param {number[]} targetDaysMask – day-of-week indices 0=Mon…6=Sun
 * @param {number}  daysAhead
 * @param {object}  sessionDefaults – { method, amount, feel } for simulated sessions
 * @returns {number[]} array of length daysAhead, each 0–100
 */
export function projectTolerance(
  sessions,
  activeTBreak,
  targetDaysMask,
  daysAhead = 30,
  sessionDefaults = { method: 'flower', amount: 0.35, feel: 3 }
) {
  const projections = []
  // Build cumulative simulated future sessions
  const simulated = [...sessions]

  for (let d = 1; d <= daysAhead; d++) {
    const futureMs  = Date.now() + d * 86_400_000
    const futureDate = new Date(futureMs)
    const dow        = (futureDate.getDay() + 6) % 7  // 0=Mon

    if (targetDaysMask.includes(dow) && !activeTBreak) {
      simulated.push({
        logged_at: futureDate.toISOString(),
        ...sessionDefaults,
      })
    }

    projections.push(calcTolerance(simulated, activeTBreak))
  }
  return projections
}

/**
 * Estimate the average method/amount/feel from recent sessions.
 * Falls back to sensible defaults if no history.
 */
export function estimateSessionDefaults(sessions) {
  const recent = sessions.slice(0, 20)
  if (!recent.length) return { method: 'flower', amount: 0.35, feel: 3 }

  const methods = {}
  let totalGrams = 0, totalFeel = 0, gramCount = 0, feelCount = 0
  for (const s of recent) {
    methods[s.method] = (methods[s.method] || 0) + 1
    if (s.amount) { totalGrams += s.amount; gramCount++ }
    if (s.feel)   { totalFeel  += s.feel;   feelCount++ }
  }
  const method = Object.entries(methods).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'flower'
  const amount = gramCount ? totalGrams / gramCount : 0.35
  const feel   = feelCount ? totalFeel  / feelCount : 3
  return { method, amount: Math.round(amount * 10) / 10, feel: Math.round(feel) }
}
