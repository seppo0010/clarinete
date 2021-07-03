import { configureStore } from '@reduxjs/toolkit'
import newsList from './newsSlice'
import singleNews from './singleNewsSlice'
import selected from './selectedSlice'

const store = configureStore({
  reducer: {
    newsList,
    singleNews,
    selected,
  },
})
export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
