import type { LegacyCustomLine, LegacyVerse, RealmRow } from '../../banidb/sqlite-search';

/**
 * A line the navigator lists: a verse, or a bani / ceremony's custom (heading
 * or instruction) line, with the fields loadBani / loadCeremony add to it.
 */
export type LoadedLine = (RealmRow<LegacyVerse> | RealmRow<LegacyCustomLine>) & {
  /** The bani's token, or `ceremony-<token>`. */
  shabadID?: string;
  baniId?: number;
  baniName?: string;
  ceremonyId?: number;
  ceremonyName?: string;
  /** The Banis_Shabad / Ceremonies_Shabad row ID (what the bani controller syncs on). */
  crossPlatformID?: number;
  sessionKey?: string;
};

/** A ceremony's line, or a verse range's verses. */
export type CeremonyRow = LoadedLine | ((RealmRow<LegacyVerse> | null)[] & { sessionKey?: string });
