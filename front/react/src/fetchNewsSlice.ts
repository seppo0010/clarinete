import { createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from './store'

export const fetchNews = createAsyncThunk('news/fetchNews', async ({userEmail, userToken}: {userEmail?: string, userToken?: string}) => {
  const req = await fetch(`/api/news?userEmail=${encodeURIComponent(userEmail || '')}&userToken=${encodeURIComponent(userToken || '')}`)
  const res = await req.json()
  return {
    date: Date.now(),
    newsList: res.slice(0, 200),
  }
}, {
  condition: ({userEmail, userToken}: {userEmail?: string, userToken?: string}, { getState, extra }: { getState: () => RootState, extra: any }) => {
    const state = getState().newsList
    return state.userEmail !== userEmail || state.status === 'idle' || (state.updateDate < Date.now() - 60 * 1000)
  },
})

export const fetchSearchNews = createAsyncThunk('news/fetchSearchNews', async (criteria: string) => {
  const [searchResults, historyResults] = await Promise.all([
    fetch('/api/search?criteria=' + encodeURIComponent(criteria)).then((res) => res.json()),
    fetch('/api/history?entity=' + encodeURIComponent(criteria)).then((res) => res.json()),
  ]);
  return {
    date: Date.now(),
    newsList: searchResults.slice(0, 200),
    historyResults,
  }
})
