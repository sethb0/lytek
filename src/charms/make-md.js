export function formatDescription (charm, variant, group) {
  let name = charm.name;
  if (variant?.name) {
    if (name.includes('{')) {
      name = name.replace(/\{.*\}/u, variant.name);
    } else {
      name = `${name}: ${variant.name}`;
    }
  }
  let description = reformatLineBreaks(charm.description);
  if (variant?.description) {
    description = `${description}
### ${variant.name}
${reformatLineBreaks(variant.description)}`;
  }
  const p = charm.prerequisites;
  const minEssence = Math.max(p?.essence || 0, variant?.prerequisites?.essence || 0);
  const minTraits = { ...p?.traits || {}, ...variant?.prerequisites?.traits || {} };
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
  return `## ${name}
**Minima:** ${minima.length ? minima.join(', ') : '(see below)'}${details.join('')}

${description}`;
}

function reformatLineBreaks (description) {
  description = (description || '')
    .replace(/\n([^-|])/gu, '\n\n$1')
    .replace(/(\n- [^\n]+)\n\n([^-])/gu, '$1\n$2')
    .replace(/\n+$/u, '');
  return description;
}
