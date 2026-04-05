import { supabase } from './supabase'

// ─────────────────────────────────────────────────────────────
// Replace VITE_VAPID_PUBLIC_KEY in your .env file with the
// public VAPID key from your push notification server / Supabase Edge Function.
// Generate a keypair with: npx web-push generate-vapid-keys
// ─────────────────────────────────────────────────────────────
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

/**
 * Register the service worker and request push permission.
 * Stores the subscription endpoint in Supabase for server-side pushes.
 */
export async function registerPush(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
  if (!VAPID_PUBLIC_KEY) return

  const reg = await navigator.serviceWorker.ready

  // Check existing subscription first
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
  }

  const key = sub.getKey('p256dh')
  const auth = sub.getKey('auth')

  await supabase.from('push_subscriptions').upsert({
    user_id:   userId,
    endpoint:  sub.endpoint,
    p256dh_key: btoa(String.fromCharCode(...new Uint8Array(key))),
    auth_key:   btoa(String.fromCharCode(...new Uint8Array(auth))),
  }, { onConflict: 'user_id,endpoint' })
}

/**
 * Schedule a local notification reminder via the service worker.
 * (Falls back to a simple Notification if SW is unavailable.)
 */
export async function scheduleLocalReminder(title, body, delayMs = 0) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  if (delayMs > 0) {
    setTimeout(() => new Notification(title, { body, icon: '/icon-192.png' }), delayMs)
  } else {
    new Notification(title, { body, icon: '/icon-192.png' })
  }
}
