import { createSlice, nanoid } from '@reduxjs/toolkit'
import { fetchNews } from './fetchNewsSlice'
import type { RootState } from './store'

export declare interface NewsItem {
  "date": string
  "section": string
  "source": string
  "title": string
  "url": string
  "volanta": string
  summary: string
}

const initialState: {
  news: NewsItem[]
  status: 'idle' | 'succeeded' | 'loading' | 'failed'
  error: string | undefined | null
} = {
  news: [],
  status: 'idle',
  error: null
}

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    newsFetched: {
      reducer(state, action) {
        state.news = action.payload
      },
      prepare(data: any) { return { id: nanoid(), payload: data } as any },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNews.pending, (state, action) => {
      state.status = 'loading'
    })
    builder.addCase(fetchNews.fulfilled, (state, action) => {
      state.status = 'succeeded'
      state.news = state.news.concat(action.payload)
    })
    builder.addCase(fetchNews.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    })
  },
})

export const { newsFetched } = newsSlice.actions
export const selectAllNews = (state: RootState) => state.newsList.news

export default newsSlice.reducer
