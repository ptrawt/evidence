import { supabase } from '../supabase'

export interface ProgressPhoto {
  id: string
  date: string
  storagePath: string
  signedUrl: string
  note: string
  createdAt: string
}

const BUCKET = 'progress-photos'

export async function compressImage(file: File, maxWidth = 1280): Promise<File> {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => {
        resolve(new File([blob!], 'photo.jpg', { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.82)
    }
    img.src = url
  })
}

async function sign(path: string): Promise<string> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 6)
  return data?.signedUrl ?? ''
}

export async function fetchProgressPhotos(userId: string): Promise<ProgressPhoto[]> {
  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error || !data) return []

  return Promise.all(data.map(async r => ({
    id: r.id, date: r.date, storagePath: r.storage_path,
    signedUrl: await sign(r.storage_path),
    note: r.note, createdAt: r.created_at,
  })))
}

export async function uploadProgressPhoto(
  userId: string,
  file: File,
  id: string,
  date: string,
  note: string,
): Promise<ProgressPhoto> {
  const path = `${userId}/${date}-${id}.jpg`
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: 'image/jpeg', upsert: false,
  })
  if (upErr) throw upErr

  const { error: dbErr } = await supabase.from('progress_photos').insert({
    id, user_id: userId, date, storage_path: path, note, created_at: new Date().toISOString(),
  })
  if (dbErr) throw dbErr

  return { id, date, storagePath: path, signedUrl: await sign(path), note, createdAt: new Date().toISOString() }
}

export async function deleteProgressPhoto(id: string, storagePath: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([storagePath])
  await supabase.from('progress_photos').delete().eq('id', id)
}
