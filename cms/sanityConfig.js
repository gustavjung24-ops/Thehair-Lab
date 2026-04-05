export const SANITY_PUBLIC_CONFIG = {
  projectId: 'yourProjectId',
  dataset: 'production',
  apiVersion: '2026-04-01',
  useCdn: true,
}

export function hasValidSanityConfig() {
  const {projectId, dataset} = SANITY_PUBLIC_CONFIG

  return Boolean(projectId && projectId !== 'yourProjectId' && dataset)
}
