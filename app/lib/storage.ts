import type { CalendarEvent, NotificationSettings, UserProfile } from "./types";

const PROFILE_KEY = "notice-calendar:profile";
// 목업 공지(n1~n9) 시절에 저장된 캘린더 일정은 이제 존재하지 않는 noticeId를 가리키므로,
// 키를 새로 버전업해서 그 데이터를 그냥 무시한다 (analysisCache.ts의 -v2 패턴과 동일).
const EVENTS_KEY = "notice-calendar:events-v2";
const NOTIFICATIONS_KEY = "notice-calendar:notifications";

const DEFAULT_NOTIFICATIONS: NotificationSettings = { deadlineAlerts: true };

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getProfile(): UserProfile | null {
  return readJSON<UserProfile>(PROFILE_KEY);
}

export function saveProfile(profile: UserProfile) {
  writeJSON(PROFILE_KEY, profile);
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
}

export function getEvents(): CalendarEvent[] {
  return readJSON<CalendarEvent[]>(EVENTS_KEY) ?? [];
}

export function addEvent(event: CalendarEvent) {
  const events = getEvents();
  if (events.some((e) => e.id === event.id)) return;
  writeJSON(EVENTS_KEY, [...events, event]);
}

export function addEvents(newEvents: CalendarEvent[]) {
  const events = getEvents();
  const existingIds = new Set(events.map((e) => e.id));
  const merged = [...events, ...newEvents.filter((e) => !existingIds.has(e.id))];
  writeJSON(EVENTS_KEY, merged);
}

export function removeEvent(eventId: string) {
  const events = getEvents().filter((e) => e.id !== eventId);
  writeJSON(EVENTS_KEY, events);
}

export function getEventsByNotice(noticeId: string): CalendarEvent[] {
  return getEvents().filter((e) => e.noticeId === noticeId);
}

export function getNotificationSettings(): NotificationSettings {
  return readJSON<NotificationSettings>(NOTIFICATIONS_KEY) ?? DEFAULT_NOTIFICATIONS;
}

export function saveNotificationSettings(settings: NotificationSettings) {
  writeJSON(NOTIFICATIONS_KEY, settings);
}
