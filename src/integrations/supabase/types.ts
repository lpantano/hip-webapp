// Database types are owned by the central hip-db repo (git submodule at supabase/db).
// Do NOT edit by hand — regenerate in hip-db via `npm run db:gen-types`, then bump
// the submodule pointer here. This file only re-exports the canonical types so that
// existing imports of "@/integrations/supabase/types" keep working unchanged.
//
// Type-only re-export: with `import type`/`export type` the bundler erases this
// module at build time and never needs the submodule files on disk. (The
// generated `Constants` value export is intentionally omitted — it is unused in
// app code, and exporting it would force every bundler/deploy to resolve the
// submodule at build.)
export type {
  Json,
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from "../../../supabase/db/types/database";
