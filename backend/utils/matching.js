function calculateCompatibility(user1, user2) {
  let score = 0;
  let maxScore = 0;

  // Interests overlap (weight: 35)
  const interestsWeight = 35;
  maxScore += interestsWeight;
  if (user1.interests && user2.interests && user1.interests.length > 0 && user2.interests.length > 0) {
    const overlap = user1.interests.filter(i => user2.interests.includes(i));
    const union = new Set([...user1.interests, ...user2.interests]);
    // Jaccard similarity with bonus for having many shared interests
    const jaccard = overlap.length / union.size;
    const coverageBonus = Math.min(overlap.length / 5, 1); // bonus up to 5 shared interests
    score += (jaccard * 0.7 + coverageBonus * 0.3) * interestsWeight;
  }

  // Travel style match (weight: 20)
  const styleWeight = 20;
  maxScore += styleWeight;
  if (user1.travelStyle && user2.travelStyle) {
    if (user1.travelStyle === user2.travelStyle) {
      score += styleWeight;
    } else {
      // Partial match for compatible styles
      const compatible = {
        'budget': ['backpacker'],
        'backpacker': ['budget'],
        'mid-range': ['family-friendly'],
        'family-friendly': ['mid-range'],
      };
      if (compatible[user1.travelStyle]?.includes(user2.travelStyle)) {
        score += styleWeight * 0.5;
      }
    }
  }

  // Languages overlap (weight: 15)
  const langWeight = 15;
  maxScore += langWeight;
  if (user1.languages && user2.languages && user1.languages.length > 0 && user2.languages.length > 0) {
    const overlap = user1.languages.filter(l => user2.languages.includes(l));
    if (overlap.length > 0) {
      // More shared languages = higher score
      const langScore = Math.min(overlap.length / 2, 1);
      score += langScore * langWeight;
    }
  }

  // Age proximity (weight: 10)
  const ageWeight = 10;
  maxScore += ageWeight;
  if (user1.age && user2.age) {
    const ageDiff = Math.abs(user1.age - user2.age);
    if (ageDiff <= 2) score += ageWeight;
    else if (ageDiff <= 5) score += ageWeight * 0.75;
    else if (ageDiff <= 10) score += ageWeight * 0.5;
    else if (ageDiff <= 15) score += ageWeight * 0.25;
  }

  // Nationality bonus (weight: 5)
  const natWeight = 5;
  maxScore += natWeight;
  if (user1.nationality && user2.nationality && user1.nationality === user2.nationality) {
    score += natWeight;
  }

  // Visited places overlap (weight: 8)
  const visitedWeight = 8;
  maxScore += visitedWeight;
  if (user1.visitedPlaces && user2.visitedPlaces && user1.visitedPlaces.length > 0 && user2.visitedPlaces.length > 0) {
    const overlap = user1.visitedPlaces.filter(p => user2.visitedPlaces.includes(p));
    if (overlap.length > 0) {
      const visitedScore = Math.min(overlap.length / 3, 1);
      score += visitedScore * visitedWeight;
    }
  }

  // Wishlist overlap (weight: 7)
  const wishWeight = 7;
  maxScore += wishWeight;
  if (user1.wishlist && user2.wishlist && user1.wishlist.length > 0 && user2.wishlist.length > 0) {
    const overlap = user1.wishlist.filter(p => user2.wishlist.includes(p));
    if (overlap.length > 0) {
      const wishScore = Math.min(overlap.length / 3, 1);
      score += wishScore * wishWeight;
    }
  }

  return Math.round((score / maxScore) * 100);
}

// Add a small base score so profiles never show 0%
function getCompatibilityScore(user1, user2) {
  const calculated = calculateCompatibility(user1, user2);
  // Minimum 5% so it never looks broken
  return Math.max(calculated, 5);
}

module.exports = { calculateCompatibility, getCompatibilityScore };
