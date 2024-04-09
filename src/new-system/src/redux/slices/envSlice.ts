import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootStateType, DispatchType } from '../store'


interface envState {
    currentEnvId: string,
    currentEnvName: string,
}

const initialState: envState = {
    currentEnvId: "",
    currentEnvName: "",
}

/**
 * Represents the user slice of the Redux store.
 */
export const envSlice = createSlice({
    name: 'env',
    initialState,
    reducers: {
        activateEnv: (state, action: PayloadAction<
            {
                currentEnvId: string,
                currentEnvName: string,
            }>) => {
            return {
                currentEnvId: action.payload.currentEnvId,
                currentEnvName: action.payload.currentEnvName,
            }
        },
        deactivateEnv: (state) => {
            return initialState;
        },
    }
})

export const {
    activateEnv, deactivateEnv
} = envSlice.actions;


export const selectEnv = (state: RootStateType) => state.env;
export default envSlice.reducer