export interface GrammaticalField {
  key: string;
  label: string;
}

/**
 * Maps category names to the grammatical form fields that are relevant.
 * Centralizes the business rule so UI components don't hardcode it.
 */
const GRAMMATICAL_FIELDS: Record<string, GrammaticalField[]> = {
  Verb: [
    { key: 'past_simple', label: 'Past Simple' },
    { key: 'past_participle', label: 'Past Participle' },
    { key: 'present_participle', label: 'Present Participle' },
    { key: 'third_person_singular', label: 'Third Person Singular' },
  ],
  Noun: [
    { key: 'plural', label: 'Plural' },
  ],
  Adjective: [
    { key: 'comparative', label: 'Comparative' },
    { key: 'superlative', label: 'Superlative' },
  ],
};

/**
 * Returns the grammatical form fields for a given category name,
 * or an empty array if the category has no defined forms.
 */
export function getGrammaticalFields(categoryName: string | null | undefined): GrammaticalField[] {
  if (!categoryName) return [];
  return GRAMMATICAL_FIELDS[categoryName] ?? [];
}
