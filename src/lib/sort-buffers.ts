// biome-ignore lint/suspicious/noExplicitAny: Any array like structure is fine
export function sortBuffers<TBuffer extends ArrayLike<any>>(buffers: TBuffer[]): TBuffer[] {
  return buffers.toSorted((a, b) => {
    const minLength = Math.min(a.length, b.length);
    for (let i = 0; i < minLength; i++) {
      if (a[i] !== b[i]) {
        return a[i] - b[i];
      }
    }
    return a.length - b.length;
  });
}
