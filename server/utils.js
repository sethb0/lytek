export function unKebab (str) {
  if (str === 'dragon-blooded') {
    return 'Dragon-Blooded';
  }
  return str.split(/\W+/gu)
    .map((x) => x.slice(0, 1).toUpperCase() + x.slice(1))
    .join(' ');
}
