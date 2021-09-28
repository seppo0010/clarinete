import { configureStore, getDefaultMiddleware  } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from "redux"; 
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from "redux-persist";


import user from './userSlice'
import newsList from './newsSlice'
import singleNews from './singleNewsSlice'
import selected from './selectedSlice'
import archived from './archivedSlice'
import entities from './entitiesSlice'
import trends from './trendsSlice'

const reducer = combineReducers({
  user: persistReducer({
    key: 'user',
    storage
  }, user),
  newsList,
  singleNews,
  selected,
  entities,
  trends,
  archived: persistReducer({
    key: 'archived',
    storage
  }, archived),
});

export const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
    }
  })
});

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
