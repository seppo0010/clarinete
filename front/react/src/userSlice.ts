import { createSlice, nanoid } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'

import type { RootState } from './store'

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

export default userSlice.reducer
export const {
  setUserId,
} = userSlice.actions
