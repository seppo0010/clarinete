import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from './store'

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

export const { addURL } = archivedSlice.actions
export const archivedURLs = (state: RootState) => state.archived.urls
export default archivedSlice.reducer
