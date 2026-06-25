const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dqotxw0sc"
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "Carapp"

export async function uploadImage(file, folder = 'posts') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', `carsnap/${folder}`)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Şəkil yüklənmədi')
  }
  const data = await response.json()
  return data.secure_url
}

export function optimizeUrl(url, { width = 800, quality = 'auto' } = {}) {
  if (!url || !url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`)
}

export function avatarUrl(url, size = 150) {
  if (!url || !url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/w_${size},h_${size},c_fill,g_face,q_auto,f_auto/`)
}
