import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState, AppDispatch } from './store'

export const archive = createAsyncThunk('archive/singleNews', async ({
    url,
    userId
}: {url: string, userId: string}) => {
  const req = await fetch('/api/archive', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url,
      userId,
    })
  })
  await req.json()
})

interface ArchivedState {
  urls: string[]
}

const initialState = { urls: [] } as ArchivedState

const archivedSlice = createSlice({
  name: 'archived',
  initialState,
  reducers: {
    addURL(state, action) {
      state.urls.push(action.payload)
    },
  },
})

const addURL = (url: string, userId: string) => {
  return (dispatch: AppDispatch) => {
    dispatch(archivedSlice.actions.addURL(url))
    dispatch(archive({url, userId}))
  }
}
export { addURL }
export const archivedURLs = (state: RootState) => state.archived.urls
export default archivedSlice.reducer
