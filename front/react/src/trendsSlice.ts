import { createSlice, nanoid } from '@reduxjs/toolkit'
import { fetchTrends } from './fetchTrendsSlice'
import type { RootState } from './store'

export interface State {
  trends: {id: number, name: string, title: string | null, url: string | null}[]
  status: 'idle' | 'succeeded' | 'loading' | 'failed'
  error: undefined | string,
}
const initialState: State = {
  trends: [],
  status: 'idle',
  error: undefined,
}

const entitiesSlice = createSlice({
  name: 'trends',
  initialState,
  reducers: {
    entitiesFetched: {
      reducer(state, action) {
        state.trends = action.payload
      },
      prepare(data: any) { return { id: nanoid(), payload: data } as any },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTrends.pending, (state, action) => {
      state.status = 'loading'
    })
    builder.addCase(fetchTrends.fulfilled, (state, action) => {
      state.status = 'succeeded'
      state.trends = action.payload.trends
    })
    builder.addCase(fetchTrends.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    })
  },
})

export const { entitiesFetched } = entitiesSlice.actions
export const selectAllEntities = (state: RootState) => state.trends.trends

export default entitiesSlice.reducer


