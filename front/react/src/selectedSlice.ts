import { createSlice } from '@reduxjs/toolkit'
import { fetchNews } from './fetchNewsSlice'
import type { RootState } from './store'

interface SelectedState {
  value: number
  max: number
}

const initialState = { value: 0 } as SelectedState

const selectedSlice = createSlice({
  name: 'selected',
  initialState,
  reducers: {
    increment(state) {
      state.value = Math.min(Math.max(state.value + 1, 0), state.max)
    },
    decrement(state) {
      state.value = Math.max(state.value - 1, 0)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNews.fulfilled, (state, action) => {
      state.max = action.payload.length - 1
    })
  }
})

export const { increment, decrement } = selectedSlice.actions
export const selectedValue = (state: RootState) => state.selected.value
export default selectedSlice.reducer
