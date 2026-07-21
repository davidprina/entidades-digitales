import type { EntityType, PublicEntity } from "../../types";
import { SportsTeamView } from "./SportsTeamView";
import { TournamentView } from "./TournamentView";
import { SportsPlayerView } from "./SportsPlayerView";
import { MenuView } from "./MenuView";
import { CatalogView } from "./CatalogView";
import { VCardView } from "./VCardView";
import { EmergencyIdView } from "./EmergencyIdView";

const VIEW_BY_TYPE: Record<EntityType, React.ComponentType<{ title: string; payload: never }>> = {
  sports_team: SportsTeamView,
  tournament: TournamentView,
  sports_player: SportsPlayerView,
  menu: MenuView,
  catalog: CatalogView,
  vcard: VCardView,
  emergency_id: EmergencyIdView,
};

export function EntityView({ entity }: { entity: PublicEntity }) {
  const View = VIEW_BY_TYPE[entity.entityType];
  return <View title={entity.title} payload={entity.payload as never} />;
}
