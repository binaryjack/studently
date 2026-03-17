/**
 * UserProfile
 * Extended user information (avatar, bio, contact, preferences)
 * FK: User.id
 */

import { BaseEntity } from "../common/BaseEntity";

export interface UserProfile extends BaseEntity {
  /** FK: Reference to User (same ID) */
  userId: string;

  /** Avatar image URL */
  avatarUrl: string | null;

  /** User biography / about me */
  bio: string | null;

  /** Phone number */
  phone: string | null;

  /** Street address */
  address: string | null;

  /** City */
  city: string | null;

  /** State/Province */
  state: string | null;

  /** Country code (ISO 3166-1 alpha-2) */
  country: string | null;

  /** Postal/ZIP code */
  postalCode: string | null;

  /** Timezone (IANA timezone identifier) */
  timezone: string; // Default: "Europe/Zurich"

  /** Preferred language */
  preferredLanguage: "de-CH" | "fr-CH" | "it-CH" | "en";

  /** Dark mode enabled */
  darkModeEnabled: boolean; // Default: true

  /** Push/email notifications enabled */
  notificationsEnabled: boolean;

  /** Email address verified */
  emailVerified: boolean;

  /** Phone number verified */
  phoneVerified: boolean;
}
