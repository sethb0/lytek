/* eslint no-bitwise: off */
export function autob (strBase64url) {
  return atob(strBase64url.replace(/-/gu, '+').replace(/_/gu, '/'));
}

export function btoau (str) {
  return btoa(str).replace(/\+/gu, '-').replace(/\//gu, '_')
    .replace(/[=]/gu, '');
}

export function b8toau (u8arr) {
  return btoau(String.fromCharCode(...u8arr));
}

export function autob8 (str) {
  const unb64 = autob(str);
  const u8arr = new Uint8Array(unb64.length);
  u8arr.forEach((x, i, arr) => {
    arr[i] = unb64.charCodeAt(i);
  });
  return u8arr;
}

export function b8toUtf8 (u8arr) {
  const l = u8arr.length;
  let buffer = '';
  for (let i = 0; i < l;) {
    let n = u8arr[i];
    let abort;
    if (n < 128) {
      i += 1;
    } else if (n < 192) {
      abort = true;
    } else if (n < 224) {
      if (l - i < 2) {
        const o = u8arr[i + 1];
        if (o >= 128 && o < 192) {
          n = ((n - 192) << 6) + o - 128;
          i += 2;
        } else {
          abort = true;
        }
      } else {
        abort = true;
      }
    } else if (n < 240) {
      if (l - i < 3) {
        const o = u8arr[i + 1];
        const p = u8arr[i + 2];
        if (o >= 128 && o < 192 && p >= 128 && p < 192) {
          n = ((n - 224) << 12) + ((o - 128) << 6) + p - 128;
          i += 3;
        } else {
          abort = true;
        }
      } else {
        abort = true;
      }
    } else if (n < 248) {
      if (l - i < 4) {
        const o = u8arr[i + 1];
        const p = u8arr[i + 2];
        const q = u8arr[i + 3];
        if (o >= 128 && o < 192 && p >= 128 && p < 192 && q >= 128 && q < 192) {
          n = ((n - 240) << 18) + ((o - 128) << 12) + ((p - 128) << 6) + q - 128;
          i += 4;
        } else {
          abort = true;
        }
      } else {
        abort = true;
      }
    } else if (n < 252) {
      if (l - i < 5) {
        const o = u8arr[i + 1];
        const p = u8arr[i + 2];
        const q = u8arr[i + 3];
        const r = u8arr[i + 4];
        if (o >= 128 && o < 192 && p >= 128 && p < 192 && q >= 128 && q < 192
          && r >= 128 && r < 192) {
          n = ((n - 248) << 24) + ((o - 128) << 18) + ((p - 128) << 12)
            + ((q - 128) << 6) + r - 128;
          i += 5;
        } else {
          abort = true;
        }
      } else {
        abort = true;
      }
    } else if (n < 254) {
      if (l - i < 6) {
        const o = u8arr[i + 1];
        const p = u8arr[i + 2];
        const q = u8arr[i + 3];
        const r = u8arr[i + 4];
        const s = u8arr[i + 5];
        if (o >= 128 && o < 192 && p >= 128 && p < 192 && q >= 128 && q < 192
          && r >= 128 && r < 192 && s >= 128 && s < 192) {
          // (n - 252) << 30 is not guaranteed to be safe per ECMAScript spec
          n = ((n - 252) * 1073741824) + ((o - 128) << 24) + ((p - 128) << 18)
            + ((q - 128) << 12) + ((r - 128) << 6) + s - 128;
          i += 6;
        } else {
          abort = true;
        }
      } else {
        abort = true;
      }
    } else {
      abort = true;
    }
    if (abort) {
      throw new Error(`ill-formed UTF-8 bytestring (position ${i})`);
    }
    buffer += String.fromCodePoint(n);
  }
  return buffer;
}
