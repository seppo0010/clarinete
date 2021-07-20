import { createSlice, nanoid } from '@reduxjs/toolkit'
import { fetchEntities } from './fetchEntitiesSlice'
import type { RootState } from './store'

export declare interface Entity {
  name: string
  q: number
}

export interface State {
  entities: Entity[]
  status: 'idle' | 'succeeded' | 'loading' | 'failed'
  error: undefined | string,
}
const initialState: State = {
  entities: [],
  status: 'idle',
  error: undefined,
}

const entitiesSlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    entitiesFetched: {
      reducer(state, action) {
        state.entities = action.payload
      },
      prepare(data: any) { return { id: nanoid(), payload: data } as any },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchEntities.pending, (state, action) => {
      state.status = 'loading'
    })
    builder.addCase(fetchEntities.fulfilled, (state, action) => {
      state.status = 'succeeded'
      state.entities = action.payload.entities
    })
    builder.addCase(fetchEntities.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    })
  },
})

export const { entitiesFetched } = entitiesSlice.actions
export const selectAllEntities = (state: RootState) => state.entities.entities

export default entitiesSlice.reducer

