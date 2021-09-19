import { createSlice } from '@reduxjs/toolkit'
import type { RootState, AppDispatch } from './store'

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
  }
}
export { addURL }
export const archivedURLs = (state: RootState) => state.archived.urls
export default archivedSlice.reducer
