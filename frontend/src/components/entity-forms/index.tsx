import type { EntityType } from "../../types";
import { SportsTeamForm } from "./SportsTeamForm";
import { TournamentForm } from "./TournamentForm";
import { SportsPlayerForm } from "./SportsPlayerForm";
import { MenuForm } from "./MenuForm";
import { CatalogForm } from "./CatalogForm";
import { VCardForm } from "./VCardForm";
import { EmergencyIdForm } from "./EmergencyIdForm";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FORM_BY_TYPE: Record<EntityType, React.ComponentType<any>> = {
  sports_team: SportsTeamForm,
  tournament: TournamentForm,
  sports_player: SportsPlayerForm,
  menu: MenuForm,
  catalog: CatalogForm,
  vcard: VCardForm,
  emergency_id: EmergencyIdForm,
};
