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
  country: string
  summary: string
}

export interface State {
  news: NewsItem[]
  status: 'idle' | 'succeeded' | 'loading' | 'failed'
  error: string | undefined | null
  hiddenSections: string[]
  updateDate: number
}
const initialState: State = {
  news: [],
  status: 'idle',
  error: null,
  hiddenSections: [],
  updateDate: 0,
}

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    addHiddenSection: {
      reducer(state, action) {
        state.hiddenSections.push(action.payload)
      },
      prepare(data: any) { return { id: nanoid(), payload: data } as any },
    },
    removeHiddenSection: {
      reducer(state, action) {
        state.hiddenSections.splice(state.hiddenSections.indexOf(action.payload), 1)
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
    builder.addCase(fetchNews.pending, (state, action) => {
      state.status = 'loading'
    })
    builder.addCase(fetchNews.fulfilled, (state, action) => {
      state.status = 'succeeded'
      state.news = state.news.concat(action.payload.newsList)
      state.updateDate = action.payload.date
    })
    builder.addCase(fetchNews.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    })
  },
})

export const { newsFetched, addHiddenSection, removeHiddenSection } = newsSlice.actions
export const selectAllNews = (state: RootState) => state.newsList.news
export const hiddenSections  = (state: RootState) => state.newsList.hiddenSections


export default newsSlice.reducer
