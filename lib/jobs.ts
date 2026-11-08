/**
 * Historical test / demo service requests purged from production admin views
 */
export const DEMO_JOB_IDS = [
  "99c64ab3-7eed-4815-9827-17a26139af34",
  "d6c0678a-d2d0-4c01-87fe-fbd45445ed89",
  "594ee002-7b66-4e81-8feb-dd4045365ed2",
  "c2f5f6df-8c0b-4760-b230-f12460e5c409",
  "b863ee24-09ea-41e6-8600-c5dfa42f1673",
] as const;

export const DEMO_JOB_FILTER = `("${DEMO_JOB_IDS.join('","')}")`;

