import { createAsyncThunk } from '@reduxjs/toolkit'
export const fetchEntities = createAsyncThunk('news/fetchEntities', async () => {
  const req = await fetch('/api/entities')
  const res = await req.json()
  return {
    entities: res,
  }
})
