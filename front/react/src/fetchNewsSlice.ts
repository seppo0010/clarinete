import { createAsyncThunk } from '@reduxjs/toolkit'
export const fetchNews = createAsyncThunk('news/fetchNews', async () => {
  const req = await fetch('/api/news')
  const res = await req.json()
  return {
    date: Date.now(),
    newsList: res.slice(0, 200),
  }
})

export const fetchSearchNews = createAsyncThunk('news/fetchSearchNews', async (criteria: string) => {
  const req = await fetch('/api/search?criteria=' + encodeURIComponent(criteria))
  const res = await req.json()
  return {
    date: Date.now(),
    newsList: res.slice(0, 200),
  }
})
