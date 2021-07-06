import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from './store'

export declare interface SingleNewsItem {
  "url": string
  "content": string
  title: string
  source: string
  summary: string
}

export const fetchSingleNews = createAsyncThunk('news/fetchSingleNews', async (url: string) => {
  const req = await fetch('/api/news/details?url=' + encodeURIComponent(url))
  const res = await req.json()
  return res
})

const initialState: {
  news: SingleNewsItem[] | undefined
  status: 'idle' | 'succeeded' | 'loading' | 'failed'
  error: string | undefined | null
  deduplicatedIndex: number
} = {
  news: [],
  status: 'idle',
  error: null,
  deduplicatedIndex: 0
}

const singleNewsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    deduplicatedIndex: {
      reducer(state, action) {
        state.deduplicatedIndex = action.payload
      },
      prepare(data: any) { return { id: nanoid(), payload: data } as any },
    },
    newsFetched: {
      reducer(state, action) {
        state.news = action.payload
      },
      prepare(data: any) { return { id: nanoid(), payload: data } as any },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSingleNews.pending, (state, action) => {
      state.status = 'loading'
    })
    builder.addCase(fetchSingleNews.fulfilled, (state, action) => {
      state.status = 'succeeded'
      state.news = action.payload
    })
    builder.addCase(fetchSingleNews.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    })
  },
})

export const { newsFetched } = singleNewsSlice.actions
export const { deduplicatedIndex } = singleNewsSlice.actions
export const selectNews = (state: RootState) => state.singleNews

export default singleNewsSlice.reducer
