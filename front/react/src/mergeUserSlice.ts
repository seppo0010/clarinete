import { createAsyncThunk } from '@reduxjs/toolkit'
export const mergeUser = createAsyncThunk('user/merge', async ({newUserId, oldUserId}: {newUserId: string, oldUserId: string}) => {
  const req = await fetch('/api/merge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      newUserId,
      oldUserId,
    })
  })
  await req.json()
})
