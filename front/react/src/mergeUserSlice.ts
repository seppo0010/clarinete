import { createAsyncThunk } from '@reduxjs/toolkit'
export const mergeUser = createAsyncThunk('user/merge', async (userIds: string[]) => {
  const req = await fetch('/api/merge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userIds,
    })
  })
  await req.json()
})
