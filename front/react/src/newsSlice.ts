import { createSlice, nanoid } from '@reduxjs/toolkit'
import { fetchNews, fetchSearchNews } from './fetchNewsSlice'
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
  searchNews: NewsItem[]
  searchHistoryCount: {count: number, created_at: string}[]
  userEmail: string
  status: 'idle' | 'succeeded' | 'loading' | 'failed'
  searchStatus: 'idle' | 'succeeded' | 'loading' | 'failed'
  error: string | undefined | null
  hiddenSources: string[]
  hiddenSections: string[]
  updateDate: number
  searchCriteria: string
}
const initialState: State = {
  news: [],
  searchNews: [],
  searchHistoryCount: [],
  userEmail: '',
  status: 'idle',
  searchStatus: 'idle',
  error: null,
  hiddenSections: [],
  hiddenSources: [],
  updateDate: 0,
  searchCriteria: '',
}

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    addHiddenSource: {
      reducer(state, action) {
        state.hiddenSources.push(action.payload)
      },
      prepare(data: any) { return { id: nanoid(), payload: data } as any },
    },
    removeHiddenSource: {
      reducer(state, action) {
        state.hiddenSources.splice(state.hiddenSources.indexOf(action.payload), 1)
      },
      prepare(data: any) { return { id: nanoid(), payload: data } as any },
    },
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
    search: {
      reducer(state, action) {
        state.searchCriteria = action.payload
        state.searchNews = []
        state.searchHistoryCount = []
      },
      prepare(data: any) { return { id: nanoid(), payload: data } as any },
    },
    flush: {
      reducer(state, action) {
        state.news = []
      },
      prepare(data: any) { return { id: nanoid(), payload: data } as any },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNews.pending, (state, action) => {
      state.userEmail = action.meta.arg
      state.status = 'loading'
    })
    builder.addCase(fetchNews.fulfilled, (state, action) => {
      state.status = 'succeeded'
      if (state.userEmail === action.meta.arg) {
        state.news = action.payload.newsList
      }
      state.updateDate = action.payload.date
    })
    builder.addCase(fetchNews.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    })
    builder.addCase(fetchSearchNews.pending, (state, action) => {
      state.searchStatus = 'loading'
    })
    builder.addCase(fetchSearchNews.fulfilled, (state, action) => {
      state.searchStatus = 'succeeded'
      state.searchNews = action.payload.newsList
      state.searchHistoryCount = action.payload.historyResults
    })
    builder.addCase(fetchSearchNews.rejected, (state, action) => {
      state.searchStatus = 'failed'
      state.error = action.error.message
    })
  },
})

export const {
  newsFetched,
  addHiddenSection,
  removeHiddenSection,
  addHiddenSource,
  removeHiddenSource,
  search,
  flush,
} = newsSlice.actions
export const selectAllNews = (state: RootState) => state.newsList.news
export const selectSearchNews = (state: RootState) => state.newsList.searchNews
export const hiddenSections  = (state: RootState) => state.newsList.hiddenSections
export const hiddenSources  = (state: RootState) => state.newsList.hiddenSources

export default newsSlice.reducer
