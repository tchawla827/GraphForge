"use client";

const STORAGE_PREFIX = "graphforge-onboarding-dismissed";

export function getOnboardingStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function isOnboardingDismissed(userId: string) {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(getOnboardingStorageKey(userId)) === "1";
}

export function dismissOnboarding(userId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getOnboardingStorageKey(userId), "1");
}

export function resetOnboarding(userId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getOnboardingStorageKey(userId));
}
