import { supabase } from './supabase'

// VAPID public key - Supabase Edge Function üçün lazımdır
// Bu key-i öz serverinizdə yaradın: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Push bildiriş icazəsi al və token-i Supabase-ə saxla
export async function registerPushNotifications(userId) {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push bildirişləri bu brauzerdə dəstəklənmir')
      return false
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Bildiriş icazəsi verilmədi')
      return false
    }

    const registration = await navigator.serviceWorker.ready

    // Mövcud abunəliyi yoxla
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription && VAPID_PUBLIC_KEY) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }

    if (!subscription) {
      // VAPID key olmadan sadə token saxla (FCM alternativ kimi)
      const token = JSON.stringify({ endpoint: 'web-push-' + userId + '-' + Date.now() })
      await savePushToken(userId, token, 'web')
      return true
    }

    const tokenStr = JSON.stringify(subscription)
    await savePushToken(userId, tokenStr, 'web')
    return true
  } catch (err) {
    console.error('Push qeydiyyat xətası:', err)
    return false
  }
}

async function savePushToken(userId, token, platform = 'web') {
  try {
    // Mövcud token-i yoxla
    const { data: existing } = await supabase
      .from('push_tokens')
      .select('id')
      .eq('user_id', userId)
      .eq('token', token)
      .maybeSingle()

    if (existing) return // Artıq mövcuddur

    // Köhnə web token-ləri sil (yeni cihaz/brauzer)
    await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('platform', platform)

    // Yeni token əlavə et
    await supabase.from('push_tokens').insert({
      user_id: userId,
      token,
      platform,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Token saxlama xətası:', err)
  }
}

// Bildiriş göndər (Supabase Edge Function vasitəsilə)
// Bu funksiya server tərəfindən çağırılır - birbaşa istifadəçilərə göndərmək üçün
export async function sendPushToUser(toUserId, title, body, data = {}) {
  try {
    await supabase.functions.invoke('send-push', {
      body: { toUserId, title, body, data },
    })
  } catch (err) {
    // Edge function yoxdursa sessizce keç
    console.warn('Push göndərmə xətası (Edge function lazımdır):', err)
  }
}

// Bildiriş icazəsi verilib-verilmədiyini yoxla
export function isPushEnabled() {
  if (!('Notification' in window)) return false
  return Notification.permission === 'granted'
}

// Bildiriş icazəsi soruşulub-soruşulmadığını yoxla
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}
