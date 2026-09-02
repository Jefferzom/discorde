export const USERNAME_STORAGE_KEY = "discorde_username";
export const USER_PROFILE_STORAGE_KEY = "discorde_user_profile";
export const USER_PROFILE_EVENT = "discorde-user-profile";

export const DEFAULT_USERNAME = "Convidado";

export interface UserProfile {
  username: string;
  avatarUrl: string;
}

export function generateDicebearAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
}

let cachedProfile: UserProfile | null = null;
let cachedStorageValue: string | null | undefined = undefined;
let migrationDone = false;

function parseProfileFromRaw(raw: string | null): UserProfile | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as UserProfile;
    if (!parsed.username?.trim()) return null;

    const username = parsed.username.trim();
    return {
      username,
      avatarUrl: parsed.avatarUrl?.trim() || generateDicebearAvatar(username),
    };
  } catch {
    return null;
  }
}

function ensureLegacyMigration(): void {
  if (typeof window === "undefined" || migrationDone) return;
  migrationDone = true;

  if (localStorage.getItem(USER_PROFILE_STORAGE_KEY)) return;

  const legacy = localStorage.getItem(USERNAME_STORAGE_KEY)?.trim();
  if (!legacy || legacy === DEFAULT_USERNAME) return;

  setUserProfile({
    username: legacy,
    avatarUrl: generateDicebearAvatar(legacy),
  });
}

export function getUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;

  ensureLegacyMigration();

  const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
  if (raw === cachedStorageValue) {
    return cachedProfile;
  }

  cachedStorageValue = raw;
  cachedProfile = parseProfileFromRaw(raw);
  return cachedProfile;
}

export function hasUserProfile(): boolean {
  return getUserProfile() !== null;
}

/** Usuário concluiu onboarding e pode entrar em salas de voz. */
export function canJoinVoiceRoom(): boolean {
  if (typeof window === "undefined") return false;
  const profile = getUserProfile();
  const username = localStorage.getItem(USERNAME_STORAGE_KEY)?.trim();
  return (
    profile !== null &&
    !!username &&
    username !== DEFAULT_USERNAME &&
    !!localStorage.getItem(USER_PROFILE_STORAGE_KEY)
  );
}

/** ID da sala LiveKit para um canal de voz fixo do servidor. */
export function getVoiceChannelRoomId(channelId: string): string {
  return channelId;
}

export function setUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;

  const normalized: UserProfile = {
    username: profile.username.trim(),
    avatarUrl:
      profile.avatarUrl.trim() || generateDicebearAvatar(profile.username.trim()),
  };

  const serialized = JSON.stringify(normalized);
  localStorage.setItem(USER_PROFILE_STORAGE_KEY, serialized);
  localStorage.setItem(USERNAME_STORAGE_KEY, normalized.username);

  cachedStorageValue = serialized;
  cachedProfile = normalized;

  window.dispatchEvent(new Event(USER_PROFILE_EVENT));
}

export function subscribeUserProfile(onStoreChange: () => void): () => void {
  ensureLegacyMigration();

  const handler = () => {
    cachedStorageValue = undefined;
    onStoreChange();
  };

  window.addEventListener(USER_PROFILE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(USER_PROFILE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getStoredUsername(): string {
  return getUserProfile()?.username ?? DEFAULT_USERNAME;
}

export function setStoredUsername(username: string): void {
  setUserProfile({
    username,
    avatarUrl: generateDicebearAvatar(username),
  });
}
