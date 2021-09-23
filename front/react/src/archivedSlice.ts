import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState, AppDispatch } from './store'

export const archive = createAsyncThunk('archive/singleNews', async ({
    url,
    userEmail
}: {url: string, userEmail: string}) => {
  if (userEmail) {
    const req = await fetch('/api/archive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        userEmail,
      })
    })
    await req.json()
  }
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

const addURL = (url: string, userEmail: string) => {
  return (dispatch: AppDispatch) => {
    dispatch(archivedSlice.actions.addURL(url))
    dispatch(archive({url, userEmail}))
  }
}
export { addURL }
export const archivedURLs = (state: RootState) => state.archived.urls
export default archivedSlice.reducer
