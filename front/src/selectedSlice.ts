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
      state.value++
    },
    decrement(state) {
      state.value--
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNews.fulfilled, (state, action) => {
      state.max = action.payload.length
    })
  }
})

export const { increment, decrement } = selectedSlice.actions
export const selectedValue = (state: RootState) => state.selected.value
export default selectedSlice.reducer
