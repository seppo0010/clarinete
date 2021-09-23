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

const getApiKey = async () => {
  const req = await fetch('/api/googleTokens')
  const {apiKey, clientId} = await req.json()
  return {apiKey, clientId}
}

const getEmailAddress = async () => {
  const res = await gapi.client.people.people.get({
    'resourceName': 'people/me',
    'requestMask.includeField': 'person.emailAddresses'
  })
  const emailAddresses = res?.result?.emailAddresses
  if (emailAddresses) {
    return emailAddresses[0].value
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
          'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        })

        const status = gapi.auth2.getAuthInstance().isSignedIn.get()
        if (!status) {
          gapi.auth2.getAuthInstance().isSignedIn.listen(async (status: boolean) => {
            resolve(dispatch(setUserEmail(await getEmailAddress())))
          })
          await gapi.auth2.getAuthInstance().signIn()
        } else {
          resolve(dispatch(setUserEmail(await getEmailAddress())))
        }
      } catch (e) {
        console.error(e)
        reject(e)
      }
    })
  })
}
