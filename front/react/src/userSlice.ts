import { createSlice, nanoid } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'

import { mergeUser } from './mergeUserSlice'
import { flush } from './newsSlice'
import type { RootState, AppDispatch } from './store'

export declare interface User {
  id: string
}

export interface State {
  user: User
}
const initialState: State = {
  user: {id: ''},
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserId: {
      reducer(state, action) {
        state.user = {id: action.payload}
      },
      prepare(data: any) { return { id: nanoid(), payload: data } as any },
    },
    merge: {
      reducer(state, action) {
        state.user = {id: action.payload}
      },
      prepare(data: any) { return { id: nanoid(), payload: data } as any },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: any) => {
      if (action?.key === 'user' && !action?.payload?.user?.id) {
        state.user.id = nanoid()
      }
    })
  },
})

export const getUserId = (state: RootState) => state.user.user.id

export const merge = (newUserId: string, oldUserId: string) => {
  return async (dispatch: AppDispatch) => {
    await dispatch(mergeUser({newUserId, oldUserId}))
    await dispatch(userSlice.actions.merge(newUserId))
    await dispatch(flush(null))
  }
}

export default userSlice.reducer
export const {
  setUserId,
} = userSlice.actions
