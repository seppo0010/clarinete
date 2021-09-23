import { createSlice, nanoid } from '@reduxjs/toolkit'

import type { RootState } from './store'

export declare interface User {
  email: string
}

export interface State {
  user: User
}
const initialState: State = {
  user: {email: ''},
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserEmail: {
      reducer(state, action) {
        state.user = {email: action.payload}
      },
      prepare(data: any) { return { email: nanoid(), payload: data } as any },
    },
  },
})

export const getUserEmail = (state: RootState) => state.user.user.email

export default userSlice.reducer
export const {
  setUserEmail,
} = userSlice.actions
