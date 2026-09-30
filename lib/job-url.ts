import type { JobItem } from './data'

/** Shared recipient for job applications sent through WhatsApp. */
export const JOB_APPLICATION_WHATSAPP = '923345636230'

/**
 * Short public aliases for selected long legacy job slugs. Existing URLs remain
 * valid and are redirected by the detail route to the shorter canonical path.
 */
export const SHORT_JOB_SLUGS: Record<string, string> = {
  'online-teachers-required-for-o-igcse-a-levels-for-all-subjects-zohaib-asad-academies': 'online-teachers-igcse-a-level',
}

export const JOB_SLUG_ALIASES: Record<string, string> = Object.fromEntries(
  Object.entries(SHORT_JOB_SLUGS).map(([legacy, short]) => [short, legacy])
)

export function getPublicJobSlug(job: Pick<JobItem, 'id' | 'slug'>): string {
  const source = (job.slug || job.id).toLowerCase()
  return SHORT_JOB_SLUGS[source] || job.slug || job.id
}

export function getPublicJobPath(job: Pick<JobItem, 'id' | 'slug'>): string {
  return `/jobs/${getPublicJobSlug(job)}`
}
