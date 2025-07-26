// Utility for integration toggles

export function isICPEnabled() {
  return process.env.NEXT_PUBLIC_INTEGRATION_ICP === 'true';
}
