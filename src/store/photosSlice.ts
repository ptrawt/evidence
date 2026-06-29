import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { nanoid } from '@reduxjs/toolkit'
import type { ProgressPhoto } from '../lib/db/photos'
import {
  fetchProgressPhotos, uploadProgressPhoto,
  deleteProgressPhoto, compressImage,
} from '../lib/db/photos'

export const loadPhotos = createAsyncThunk('photos/load', async (userId: string) => {
  return fetchProgressPhotos(userId)
})

export const uploadPhotoAsync = createAsyncThunk(
  'photos/upload',
  async ({ userId, file, date, note }: { userId: string; file: File; date: string; note: string }) => {
    const compressed = await compressImage(file)
    const id = nanoid()
    return uploadProgressPhoto(userId, compressed, id, date, note)
  },
)

export const deletePhotoAsync = createAsyncThunk(
  'photos/delete',
  async ({ id, storagePath }: { id: string; storagePath: string }) => {
    await deleteProgressPhoto(id, storagePath)
    return id
  },
)

interface PhotosState {
  photos: ProgressPhoto[]
  status: 'idle' | 'loading' | 'ready'
  uploading: boolean
}

const photosSlice = createSlice({
  name: 'photos',
  initialState: { photos: [], status: 'idle', uploading: false } as PhotosState,
  reducers: {
    clearPhotos(state) { state.photos = []; state.status = 'idle' },
  },
  extraReducers: builder => {
    builder
      .addCase(loadPhotos.pending, state => { state.status = 'loading' })
      .addCase(loadPhotos.fulfilled, (state, action) => {
        state.photos = action.payload; state.status = 'ready'
      })
      .addCase(uploadPhotoAsync.pending, state => { state.uploading = true })
      .addCase(uploadPhotoAsync.fulfilled, (state, action) => {
        state.photos.unshift(action.payload); state.uploading = false
      })
      .addCase(uploadPhotoAsync.rejected, state => { state.uploading = false })
      .addCase(deletePhotoAsync.fulfilled, (state, action) => {
        state.photos = state.photos.filter(p => p.id !== action.payload)
      })
  },
})

export const { clearPhotos } = photosSlice.actions
export default photosSlice.reducer
