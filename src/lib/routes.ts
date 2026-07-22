// T3 RED stub — intentionally-wrong defaults so route tests fail on
// assertions (behavior), not on module-not-found. Replaced in GREEN.

export const ROUTES: string[] = [];

export const isHtmlRoute = (_path: string): boolean => false;
export const isFileEndpoint = (_path: string): boolean => false;

export const canonicalHref = (_path: string, _site: string): string => "";
