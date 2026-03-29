export const BASE_POSITION = 16384;

export function computeInitialPosition(index: number) {
  return BASE_POSITION * (index + 1);
}

export function nextAppendPosition(lastPosition?: number | null) {
  return lastPosition ? lastPosition + BASE_POSITION : BASE_POSITION;
}

export function positionBetween(prev?: number | null, next?: number | null) {
  if (prev == null && next == null) return BASE_POSITION;
  if (prev == null && next != null) return next / 2;
  if (prev != null && next == null) return prev + BASE_POSITION;
  return ((prev as number) + (next as number)) / 2;
}
