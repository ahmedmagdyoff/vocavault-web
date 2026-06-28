/**
 * Convert a snake_case form_type string to Title Case display text.
 * e.g. "past_simple" → "Past Simple", "third_person_singular" → "Third Person Singular"
 */
export function formatFormType(formType: string): string {
  return formType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
