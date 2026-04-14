function normalizeText(value = '') {
  return value.toString().trim().toLowerCase();
}

function normalizeFiberList(fiberContent = '') {
  return normalizeText(fiberContent)
    .split(/[\/,&+]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function fiberOverlapScore(stashFiber, patternFiber) {
  const stashList = normalizeFiberList(stashFiber);
  const patternList = normalizeFiberList(patternFiber);

  if (patternList.length === 0 || stashList.length === 0) return 0;

  const overlap = patternList.filter((fiber) => stashList.includes(fiber));
  return overlap.length / patternList.length;
}

function scoreStashAgainstMaterial(stashItem, material) {
  let score = 0;
  const reasons = [];

  const stashWeight = normalizeText(stashItem.weight);
  const materialWeight = normalizeText(material.yarnWeight);

  if (stashWeight && materialWeight && stashWeight === materialWeight) {
    score += 50;
    reasons.push('weight match');
  }

  const fiberScore = fiberOverlapScore(stashItem.fiberContent, material.fiberContent);
  if (fiberScore > 0) {
    score += Math.round(fiberScore * 25);
    reasons.push('fiber overlap');
  }

  const stashYardageTotal =
    (Number(stashItem.yardage) || 0) * (Number(stashItem.quantity) || 1);

  const requiredYardage =
    (Number(material.yardage) || 0) * (Number(material.quantity) || 1 || 1);

  if (requiredYardage > 0) {
    if (stashYardageTotal >= requiredYardage) {
      score += 25;
      reasons.push('enough yardage');
    } else if (stashYardageTotal > 0) {
      score += 10;
      reasons.push('some yardage available');
    }
  }

  return {
    stashId: stashItem._id,
    brand: stashItem.brand,
    color: stashItem.color,
    weight: stashItem.weight,
    fiberContent: stashItem.fiberContent,
    quantity: stashItem.quantity,
    yardage: stashItem.yardage,
    grams: stashItem.grams,
    score,
    reasons,
    stashYardageTotal,
    requiredYardage,
  };
}

function getMatchLabel(score) {
  if (score >= 80) return 'full match';
  if (score >= 45) return 'partial match';
  return 'weak match';
}

function buildPatternMatches(pattern, stashItems) {
  const materials = Array.isArray(pattern.materials) ? pattern.materials : [];

  const materialMatches = materials.map((material, index) => {
    const ranked = stashItems
      .map((stashItem) => scoreStashAgainstMaterial(stashItem, material))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      materialIndex: index,
      material,
      status: ranked.length ? getMatchLabel(ranked[0].score) : 'no match',
      matches: ranked.slice(0, 5),
    };
  });

  const statuses = materialMatches.map((m) => m.status);

  let overallStatus = 'no match';
  if (statuses.length && statuses.every((s) => s === 'full match')) {
    overallStatus = 'full match';
  } else if (statuses.some((s) => s === 'full match' || s === 'partial match')) {
    overallStatus = 'partial match';
  }

  return {
    patternId: pattern._id,
    patternName: pattern.name,
    overallStatus,
    materialMatches,
  };
}

module.exports = {
  buildPatternMatches,
};