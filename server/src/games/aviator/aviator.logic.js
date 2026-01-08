/**
 * Aviator Game Logic
 * Handles multiplier calculation and crash determination
 * No provably-fair logic - admin controlled
 */

/**
 * Calculate current multiplier based on elapsed time
 * Formula: 1 + 0.06t + (0.06t)^2 - (0.04t)^3 + (0.04t)^4
 * @param {number} elapsedSeconds - Time elapsed since round started
 * @returns {number} Current multiplier
 */
function calculateMultiplier(elapsedSeconds) {
  const t = elapsedSeconds;
  const multiplier = 1 +
    0.06 * t +
    Math.pow(0.06 * t, 2) -
    Math.pow(0.04 * t, 3) +
    Math.pow(0.04 * t, 4);

  return Math.max(1.0, multiplier);
}

/**
 * Generate random crash multiplier (admin controlled)
 * For demo: returns random value between 1.01 and 1000
 * In production, admin can set specific crash points
 * @param {number} minMultiplier - Minimum crash multiplier (default: 1.01)
 * @param {number} maxMultiplier - Maximum crash multiplier (default: 1000)
 * @returns {number} Crash multiplier
 */
function generateCrashMultiplier(minMultiplier = 1.01, maxMultiplier = 1000) {
  // Simple random generation (not provably fair)
  // Admin can override this with scheduled crashes
  const random = Math.random();

  // Bias towards lower multipliers (more realistic)
  // 60% chance of crashing below 2x
  if (random < 0.6) {
    return 1.01 + Math.random() * 0.99; // 1.01 to 2.0
  }
  // 30% chance of crashing between 2x and 3x
  else if (random < 0.9) {
    return 2.0 + Math.random() * 1.0; // 2.0 to 3.0
  }
  // 10% chance of crashing between 3x and 5x
  else {
    return 3.0 + Math.random() * 2.0; // 3.0 to 5.0
  }
}

/**
 * Check if round should crash based on current multiplier and crash point
 * @param {number} currentMultiplier - Current multiplier
 * @param {number} crashMultiplier - Target crash multiplier
 * @returns {boolean} True if should crash
 */
function shouldCrash(currentMultiplier, crashMultiplier) {
  return currentMultiplier >= crashMultiplier;
}

module.exports = {
  calculateMultiplier,
  generateCrashMultiplier,
  shouldCrash,
};


