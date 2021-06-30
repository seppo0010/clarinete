import { configureStore } from '@reduxjs/toolkit'
import newsList from './newsSlice'
import singleNews from './singleNewsSlice'

const store = configureStore({
  reducer: {
    newsList,
    singleNews,
  },
})
export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
