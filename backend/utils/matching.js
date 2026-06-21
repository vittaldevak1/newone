// ================= TRIP COMPATIBILITY =================
// Used when both users have active trips
function calculateTripCompatibility(myTrip, theirTrip, me, them) {
  let score = 0;

  // Destination (30%) — exact match only
  const destMatch = myTrip.destination && theirTrip.destination &&
    myTrip.destination.trim().toLowerCase() === theirTrip.destination.trim().toLowerCase();
  score += destMatch ? 30 : 0;

  // Date overlap (25%)
  if (myTrip.startDate && myTrip.endDate && theirTrip.startDate && theirTrip.endDate) {
    const myStart = new Date(myTrip.startDate).getTime();
    const myEnd = new Date(myTrip.endDate).getTime();
    const theirStart = new Date(theirTrip.startDate).getTime();
    const theirEnd = new Date(theirTrip.endDate).getTime();
    const overlapStart = Math.max(myStart, theirStart);
    const overlapEnd = Math.min(myEnd, theirEnd);
    if (overlapEnd >= overlapStart) {
      const overlapDays = (overlapEnd - overlapStart) / 86400000 + 1;
      const totalDays = (Math.max(myEnd, theirEnd) - Math.min(myStart, theirStart)) / 86400000 + 1;
      score += (overlapDays / totalDays) * 25;
    }
  }

  // Budget (15%) — exact = 100, flexible on either = 75
  score += scoreBudget(me.budget, them.budget) * 0.15;

  // Travel style (10%) — exact match only
  score += scoreTravelStyle(me.travelStyle, them.travelStyle) * 0.10;

  // Activities on trips (10%) — Jaccard overlap
  if (myTrip.activities?.length > 0 && theirTrip.activities?.length > 0) {
    const overlap = myTrip.activities.filter(a => theirTrip.activities.includes(a));
    const union = new Set([...myTrip.activities, ...theirTrip.activities]);
    score += (overlap.length / union.size) * 10;
  }

  // Languages (5%) — at least one shared = 100
  score += scoreLanguages(me.languages, them.languages) * 0.05;

  // Travel pace (5%) — exact = 100, adjacent = 50
  score += scoreTravelPace(me.travelPace, them.travelPace) * 0.05;

  return Math.round(score);
}

// ================= PROFILE COMPATIBILITY =================
// Used when no trips exist
function calculateProfileCompatibility(me, them) {
  let score = 0;

  // Travel style (25%) — exact match only
  score += scoreTravelStyle(me.travelStyle, them.travelStyle) * 0.25;

  // Budget (20%) — exact = 100, flexible on either = 75
  score += scoreBudget(me.budget, them.budget) * 0.20;

  // Languages (20%) — at least one shared = 100
  score += scoreLanguages(me.languages, them.languages) * 0.20;

  // Travel pace (15%) — exact = 100, adjacent = 50
  score += scoreTravelPace(me.travelPace, them.travelPace) * 0.15;

  // Interests (20%) — Jaccard similarity
  if (me.interests?.length > 0 && them.interests?.length > 0) {
    const overlap = me.interests.filter(i => them.interests.includes(i));
    const union = new Set([...me.interests, ...them.interests]);
    score += (overlap.length / union.size) * 20;
  }

  return Math.round(score);
}

// ================= SCORING HELPERS =================

function scoreBudget(budget1, budget2) {
  if (!budget1 || !budget2) return 0;
  if (budget1 === budget2) return 100;
  if (budget1 === "flexible" || budget2 === "flexible") return 75;
  return 0;
}

function scoreTravelStyle(style1, style2) {
  if (!style1 || !style2) return 0;
  return style1 === style2 ? 100 : 0;
}

function scoreLanguages(langs1, langs2) {
  if (!langs1?.length || !langs2?.length) return 0;
  const shared = langs1.filter(l => langs2.includes(l));
  return shared.length > 0 ? 100 : 0;
}

function scoreTravelPace(pace1, pace2) {
  if (!pace1 || !pace2) return 0;
  if (pace1 === pace2) return 100;
  const adjacent = {
    "relaxed": "balanced",
    "balanced": "relaxed",
    "balanced": "fast-paced",
    "fast-paced": "balanced",
  };
  return adjacent[pace1] === pace2 ? 50 : 0;
}

// ================= MAIN FUNCTION =================

function getCompatibilityScore(me, them, myTrip, theirTrip) {
  let compatibility;
  let scoreType;
  let breakdown = [];

  const hasTrips = myTrip && theirTrip;

  if (hasTrips) {
    const tripScore = calculateTripCompatibility(myTrip, theirTrip, me, them);
    const profileScore = calculateProfileCompatibility(me, them);
    compatibility = Math.round(tripScore * 0.7 + profileScore * 0.3);
    scoreType = "trip";

    // Build breakdown for display
    if (myTrip.destination && theirTrip.destination &&
        myTrip.destination.trim().toLowerCase() === theirTrip.destination.trim().toLowerCase()) {
      breakdown.push(`${myTrip.destination} destination`);
    }
    if (myTrip.startDate && myTrip.endDate && theirTrip.startDate && theirTrip.endDate) {
      const myStart = new Date(myTrip.startDate).getTime();
      const myEnd = new Date(myTrip.endDate).getTime();
      const theirStart = new Date(theirTrip.startDate).getTime();
      const theirEnd = new Date(theirTrip.endDate).getTime();
      const overlapStart = Math.max(myStart, theirStart);
      const overlapEnd = Math.min(myEnd, theirEnd);
      if (overlapEnd >= overlapStart) {
        const overlapDays = Math.round((overlapEnd - overlapStart) / 86400000 + 1);
        breakdown.push(`${overlapDays}-day date overlap`);
      }
    }
    if (scoreBudget(me.budget, them.budget) >= 75) {
      breakdown.push("Similar budget");
    }
    if (me.travelStyle && them.travelStyle && me.travelStyle === them.travelStyle) {
      breakdown.push("Same travel style");
    }
    if (me.travelPace && them.travelPace) {
      const paceScore = scoreTravelPace(me.travelPace, them.travelPace);
      if (paceScore === 100) breakdown.push("Same travel pace");
      else if (paceScore === 50) breakdown.push("Compatible travel pace");
    }
  } else {
    compatibility = calculateProfileCompatibility(me, them);
    scoreType = "profile";

    if (me.travelStyle && them.travelStyle && me.travelStyle === them.travelStyle) {
      breakdown.push("Same travel style");
    }
    if (scoreBudget(me.budget, them.budget) >= 75) {
      breakdown.push("Similar budget");
    }
    if (scoreLanguages(me.languages, them.languages) === 100) {
      breakdown.push("Shared language");
    }
    if (me.travelPace && them.travelPace) {
      const paceScore = scoreTravelPace(me.travelPace, them.travelPace);
      if (paceScore === 100) breakdown.push("Same travel pace");
      else if (paceScore === 50) breakdown.push("Compatible travel pace");
    }
    if (me.interests?.length > 0 && them.interests?.length > 0) {
      const overlap = me.interests.filter(i => them.interests.includes(i));
      if (overlap.length > 0) breakdown.push("Shared interests");
    }
  }

  // Minimum 5% so it never shows 0%
  compatibility = Math.max(compatibility, 5);

  return { compatibility, scoreType, breakdown };
}

// ================= RANKING SCORE =================
// For sorting only, NOT displayed to users
function getRankingScore(compatibility, user) {
  let bonus = 0;
  const hasPhoto = !!user.avatar;
  const hasBudget = !!user.budget;
  const hasTravelStyle = !!user.travelStyle;
  const hasLanguages = user.languages?.length > 0;
  const hasPrompts = user.prompts?.idealTrip || user.prompts?.travelHabits || user.prompts?.lookingFor;
  const hasInterests = user.interests?.length > 0;
  const hasBio = !!user.bio;

  // +5 bonus for completing profile
  if (hasPhoto && hasBudget && hasTravelStyle && hasLanguages && (hasPrompts || hasInterests || hasBio)) {
    bonus = 5;
  }

  return compatibility + bonus;
}

// ================= LEGACY COMPAT =================
// Keep for backward compatibility during transition
function getLegacyCompatibilityScore(user1, user2) {
  const result = getCompatibilityScore(user1, user2);
  return result.compatibility;
}

module.exports = {
  getCompatibilityScore,
  getRankingScore,
  getLegacyCompatibilityScore,
  calculateTripCompatibility,
  calculateProfileCompatibility,
};
