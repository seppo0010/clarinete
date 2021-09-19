import { createAsyncThunk } from '@reduxjs/toolkit'
export const fetchTrends = createAsyncThunk('news/fetchTrends', async () => {
  const req = await fetch('/api/trends')
  const res = await req.json()
  return {
    trends: res,
  }
})
