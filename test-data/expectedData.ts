/**
 * Expected data for the Dream Portal website.
 * These values are used to validate the diary table and summary stats.
 */
export const EXPECTED = {
  /** Total number of dream entries in the diary table */
  totalDreams: 10,

  /** Count of Good dreams */
  goodDreams: 6,

  /** Count of Bad dreams */
  badDreams: 4,

  /** Count of recurring dreams (names appearing more than once) */
  recurringDreams: 2,

  /** Sorted list of recurring dream names */
  recurringDreamNames: ['Flying over mountains', 'Lost in maze'],

  /** Valid dream types */
  validDreamTypes: ['Good', 'Bad'] as const,
} as const;
