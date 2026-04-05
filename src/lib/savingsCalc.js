/**
 * Savings calculation utilities.
 *
 * All calculations are derived from actual logged session data
 * and the user's configured price-per-gram and baseline.
 */

/**
 * Returns total grams consumed across all sessions within [from, to].
 */
export function gramsInRange(sessions, from, to) {
  const SIZE_GRAMS = { small: 0.15, medium: 0.30, large: 0.50, massive: 0.80 }
  return sessions
    .filter(s => {
      const d = Date.parse(s.logged_at)
      return d >= from && d <= to
    })
    .reduce((acc, s) => {
      return acc + (s.amount ?? SIZE_GRAMS[s.size_category] ?? 0.25)
    }, 0)
}

/**
 * Computes spending, baseline spending, and savings over several periods.
 *
 * @param {Array}  sessions      – all sessions (full history)
 * @param {number} pricePerGram  – e.g. 10
 * @param {number} baselineGrams – grams/day before tracking (e.g. 1.0)
 */
export function calcSavings(sessions, pricePerGram, baselineGrams) {
  const now = Date.now()

  const periods = {
    week:  { from: now - 7  * 86_400_000, to: now, label: 'this week',   baseline: baselineGrams * 7  },
    month: { from: now - 30 * 86_400_000, to: now, label: 'this month',  baseline: baselineGrams * 30 },
    year:  { from: now - 365* 86_400_000, to: now, label: 'this year',   baseline: baselineGrams * 365 },
    all:   { from: 0,                      to: now, label: 'all time',    baseline: null },
  }

  const results = {}
  for (const [key, p] of Object.entries(periods)) {
    const actual       = gramsInRange(sessions, p.from, p.to)
    const actualSpend  = actual * pricePerGram
    const baselineSpend = p.baseline != null ? p.baseline * pricePerGram : null
    const saved        = baselineSpend != null ? Math.max(0, baselineSpend - actualSpend) : null

    results[key] = { actual, actualSpend, baselineSpend, saved, label: p.label }
  }

  return results
}

/**
 * Builds a 12-month spend chart (current calendar year, Jan–Dec).
 * Returns array of 12 values representing spend per month.
 */
export function monthlySpend(sessions, pricePerGram) {
  const SIZE_GRAMS = { small: 0.15, medium: 0.30, large: 0.50, massive: 0.80 }
  const year = new Date().getFullYear()
  const totals = Array(12).fill(0)
  for (const s of sessions) {
    const d = new Date(s.logged_at)
    if (d.getFullYear() !== year) continue
    const m = d.getMonth()
    totals[m] += (s.amount ?? SIZE_GRAMS[s.size_category] ?? 0.25) * pricePerGram
  }
  return totals
}

/**
 * Average spend per session in the last 30 days.
 */
export function avgCostPerSession(sessions, pricePerGram) {
  const SIZE_GRAMS = { small: 0.15, medium: 0.30, large: 0.50, massive: 0.80 }
  const cutoff = Date.now() - 30 * 86_400_000
  const recent = sessions.filter(s => Date.parse(s.logged_at) >= cutoff)
  if (!recent.length) return 0
  const total = recent.reduce((acc, s) =>
    acc + (s.amount ?? SIZE_GRAMS[s.size_category] ?? 0.25) * pricePerGram, 0)
  return total / recent.length
}
