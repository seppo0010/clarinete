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


import newsList from './newsSlice'
import singleNews from './singleNewsSlice'
import selected from './selectedSlice'
import archived from './archivedSlice'
import entities from './entitiesSlice'

const reducer = combineReducers({
  newsList: persistReducer({
    key: 'newsList',
    storage
  }, newsList),
  singleNews,
  selected,
  entities,
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
