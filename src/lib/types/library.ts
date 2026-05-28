// Shared client-side types for curriculum library UI.
//
// The server returns CurriculumResource rows from the database; these types
// describe the subset of fields the UI consumes. Keep in sync with the
// Prisma schema (prisma/schema.prisma) — if a column is added that the UI
// needs, extend `ResourceSummary` and/or `ResourceFull`, not the API route.

export type TierActivity = {
  instructions: string;
  materials: string[];
  minutes: number;
};

export type ResourceActivities = {
  tier7?: TierActivity;
  tier4?: TierActivity;
};

// Card-level view. Returned by GET /api/library list endpoint.
export type ResourceSummary = {
  id: string;
  title: string;
  description: string | null;
  framework: string | null;
  subject: string;
  ageRange: string | null;
  season: string | null;
  weekHint: number | null;
  type: string;
  materials: string[];
  bookList: string[];
  fieldTripLocation: string | null;
};

// Full detail view. Returned by GET /api/library/[id].
// Extends ResourceSummary with the activity tiers, links, and tags.
export type ResourceFull = ResourceSummary & {
  url: string | null;
  sourceUrl: string | null;
  videoUrl: string | null;
  activities: ResourceActivities | null;
  notes: string | null;
  tags: string[];
};
