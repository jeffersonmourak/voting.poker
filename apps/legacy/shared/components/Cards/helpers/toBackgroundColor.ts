export const toBackgroundColor = (
  {background, isImage = false}: {background: string; isImage?: boolean},
  fallback: string
) => (isImage ? fallback : background);
