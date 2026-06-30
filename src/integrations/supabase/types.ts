// Database types are owned by the central hip-db repo (git submodule at supabase/db).
// Do NOT edit by hand — regenerate in hip-db via `npm run db:gen-types`, then bump
// the submodule pointer here. This file only re-exports the canonical types so that
// existing imports of "@/integrations/supabase/types" keep working unchanged.
export type {
  Json,
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from "../../../supabase/db/types/database";

export { Constants } from "../../../supabase/db/types/database";
