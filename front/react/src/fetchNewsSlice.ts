import { createAsyncThunk } from '@reduxjs/toolkit'
export const fetchNews = createAsyncThunk('news/fetchNews', async (userEmail: string) => {
  const req = await fetch('/api/news?userEmail=' + userEmail)
  const res = await req.json()
  return {
    date: Date.now(),
    newsList: res.slice(0, 200),
  }
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
