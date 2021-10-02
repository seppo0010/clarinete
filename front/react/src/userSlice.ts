import { createSlice, nanoid } from '@reduxjs/toolkit'

import type { RootState } from './store'

export declare interface User {
  email: string
  token: string
}

export interface State {
  user: User | null
}
const initialState: State = {
  user: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: {
      reducer(state, action) {
        state.user = action.payload
      },
      prepare(data: any) { return { email: nanoid(), payload: data } as any },
    },
  },
})

export const getUserEmail = (state: RootState) => state.user.user?.email
export const getUserToken = (state: RootState) => state.user.user?.token

export default userSlice.reducer
export const {
  setUser,
} = userSlice.actions

const getApiKey = async () => {
  const req = await fetch('/api/googleTokens')
  const {apiKey, clientId} = await req.json()
  return {apiKey, clientId}
}

const getUser = async () => {
  return {
    email: gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail(),
    token: gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token,
  }
}

export const login = () => async (dispatch: any) => {
  const {apiKey, clientId} = await getApiKey()
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey,
          clientId,
          scope: 'https://www.googleapis.com/auth/userinfo.email',
          'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        })

        const status = gapi.auth2.getAuthInstance().isSignedIn.get()
        if (!status) {
          gapi.auth2.getAuthInstance().isSignedIn.listen(async (status: boolean) => {
            resolve(dispatch(setUser(await getUser())))
          })
          await gapi.auth2.getAuthInstance().signIn()
        } else {
          resolve(dispatch(setUser(await getUser())))
        }
      } catch (e) {
        console.error(e)
        reject(e)
      }
    })
  })
}

export const logout = () => async (dispatch: any) => {
  const {apiKey, clientId} = await getApiKey()
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey,
          clientId,
          scope: 'https://www.googleapis.com/auth/userinfo.email',
          'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        })

        await gapi.auth2.getAuthInstance().signOut()
        dispatch(setUser(null))
      } catch (e) {
        console.error(e)
        reject(e)
      }
    })
  })
}
