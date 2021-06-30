import { configureStore } from '@reduxjs/toolkit'
import newsList from './newsSlice'

const store = configureStore({
  reducer: {
    newsList,
  },
})
export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
