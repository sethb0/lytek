export function formatDescription (charm, { variant, group, dict }) {
  const name = variant?.name ? getVariantName(charm.name, variant.name) : charm.name;
  let description = reformatLineBreaks(charm.description);
  if (variant?.description) {
    description = `${description}
### ${variant.name}
${reformatLineBreaks(variant.description)}`;
  }
  const p = charm.prerequisites || {};
  const q = variant?.prerequisites;
  const prereqs = q ? mergePrerequisites(p, q) : p;
  const minEssence = prereqs.essence || 0;
  const minTraits = prereqs.traits || {};
  const minima = [];
  for (const [k, v] of Object.entries(minTraits)) {
    minima.push(`${k === '_' ? group : k} ${v}`);
  }
  if (minEssence) {
    minima.push(`Essence ${minEssence}`);
  }
  let details = [];
  if (charm.type !== 'knack') {
    const keywords = Object.entries(charm.keywords || {}).map(([k, v]) => {
      if (v === true) {
        return k;
      }
      return `${k} ${v}`;
    });
    if (charm.martial) {
      keywords.push(`Martial (${Object.keys(charm.martial).sort().join(', ')})`);
    }
    if (charm['martial-ready']) {
      keywords.push('Martial-Ready');
    }
    if (charm.virtue) {
      const keys = Object.keys(charm.virtue);
      keys.sort();
      keywords.push(...keys.map((v) => `Virtue (${v})`));
    }
    keywords.sort();
    details = [
      `\n**Keywords:** ${keywords.length ? keywords.join(', ') : '\u2014'}`,
      `\n**Cost:** ${charm.cost || '\u2014'}`,
      `\n**Action:** ${charm.action}`,
    ];
    if (charm.duration) {
      details.push(`\n**Duration:** ${charm.duration}`);
    }
  }
  const term = charm.type === 'knack' ? 'Knacks' : 'Charms';
  details.push(
    `\n**Prerequisite ${term}:** ${formatPrerequisiteCharms(prereqs, { dict, group })}`
  );
  return `## ${name}
**Minima:** ${minima.length ? minima.join(', ') : '(see below)'}${details.join('')}

${description}`;
}

export function getVariantName (charmName, variantName) {
  if (variantName && !charmName) {
    return variantName;
  }
  if (charmName.includes('{')) {
    return charmName.replace(/\{.*\}/u, variantName);
  }
  return `${charmName}: ${variantName}`;
}

function reformatLineBreaks (description) {
  description = (description || '')
    .replace(/\n([^-|])/gu, '\n\n$1')
    .replace(/(\n- [^\n]+)\n\n([^-])/gu, '$1\n$2')
    .replace(/\n+$/u, '');
  return description;
}

function mergePrerequisites (...prereqs) {
  const essence = Math.max(0, ...prereqs.map((p) => p.essence || 0));
  const excellencies = Math.max(0, ...prereqs.map((p) => p.excellencies || 0));
  const oxMerger = {};
  for (const { variant, threshold } of [].concat(
    ...prereqs.map((p) => p['other excellencies'] || [])
  )) {
    oxMerger[variant] = Math.max(oxMerger[variant] || 0, threshold);
  }
  const otherExcellencies = Object.entries(oxMerger)
    .map(([k, v]) => ({ variant: k, threshold: v }));
  const traits = {};
  for (const [trait, minimum] of [].concat(
    ...prereqs.map((p) => (p.traits && Object.entries(p.traits)) || [])
  )) {
    traits[trait] = Math.max(traits[trait] || 0, minimum);
  }
  const charmsMerger = Object.fromEntries(
    [].concat(...prereqs.map((p) => p.charms || []))
      .map((charm) => [spliceVariant(charm.id, charm.variant), charm.count])
  );
  const groups = mergeGroups([].concat(...prereqs.map((p) => p.groups || [])), charmsMerger);
  const charms = Object.entries(charmsMerger).map(([k, v]) => {
    const u = unspliceVariant(k);
    if (v) {
      u.count = v;
    }
    return u;
  });
  const out = {};
  if (essence) {
    out.essence = essence;
  }
  if (excellencies) {
    out.excellencies = excellencies;
  }
  if (otherExcellencies.length) {
    out['other excellencies'] = otherExcellencies;
  }
  if (Object.keys(traits).length) {
    out.traits = traits;
  }
  if (charms.length) {
    out.charms = charms;
  }
  if (groups.length) {
    out.groups = groups;
  }
  return out;
}

function mergeGroups (groups, charmsMerger) {
  for (const g of groups) {
    g.charms = g.charms
      .map((charm) => {
        if (charm in charmsMerger) {
          g.threshold -= 1;
          return null;
        }
        return charm;
      })
      .filter((x) => x);
  }
  return groups.filter((g) => g.threshold > 1);
}

function formatPrerequisiteCharms (
  { charms, groups, excellencies, 'other excellencies': otherExcellencies },
  { group: trait, dict },
) {
  const items = [];
  if (excellencies) {
    const x = excellencies === 1 ? '' : `${cardinal(excellencies)} `;
    const y = excellencies === 1 ? 'y' : 'ies';
    items.push(`any ${x}${trait === 'Heretical' ? 'Infernal First' : trait} Excellenc${y}`);
  }
  if (otherExcellencies) {
    items.push(...otherExcellencies.map(({ variant, threshold }) => {
      const x = threshold === 1 ? '' : `${cardinal(threshold)} `;
      const y = threshold === 1 ? 'y' : 'ies';
      return `any ${x}${variant} Excellenc${y}`;
    }));
  }
  if (charms) {
    items.push(...charms.map(
      (x) => countedCharms(dict[spliceVariant(x.id, x.variant)], x.count)
    ));
  }
  if (groups) {
    for (const { charms: cc, threshold } of groups) {
      const x = threshold === 1 && cc.length === 2
        ? 'either'
        : `any ${cardinal(threshold)} of`;
      const names = cc.map(
        ({ id, variant, count }) => countedCharms(dict[spliceVariant(id, variant)], count)
      );
      const last = names.pop();
      items.push(`${x} ${names.join(', ')} or ${last}`);
    }
  }
  return items.length ? items.join(', ') : 'none';
}

function countedCharms (name, count) {
  if (!count || count < 2) {
    return name;
  }
  return `${cardinal(count)} purchases of ${name}`;
}

export function spliceVariant (charmId, variantId) {
  if (variantId) {
    return `${charmId}.${variantId}`;
  }
  return charmId;
}

function unspliceVariant (id) {
  const m = /^([^.]+\.[^.]+)\.(.*)$/u.exec(id);
  if (m) {
    return { id: m[1], variant: m[2] };
  }
  return { id };
}

const CARDINALS
  = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

function cardinal (n) {
  if (n < 0 || n > 10) {
    return n;
  }
  return CARDINALS[n];
}
