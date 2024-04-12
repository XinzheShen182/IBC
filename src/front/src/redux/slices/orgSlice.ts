import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootStateType, DispatchType } from '../store'

interface OrgState {
    currentOrgId: string,
    currentOrgName: string
}

const initialState: OrgState = {
    currentOrgId: '',
    currentOrgName: ''
}

/**
 * Represents the user slice of the Redux store.
 */
export const orgSlice = createSlice({
    name: 'org',
    initialState,
    reducers: {
        activateOrg: (state, action: PayloadAction<{
            currentOrgId: string,
            currentOrgName: string
        }>) => {
            return {
                currentOrgId: action.payload.currentOrgId,
                currentOrgName: action.payload.currentOrgName
            }
        },
        deactivateOrg: (state) => {
            return initialState;
        }
    }
})

export const { 
    activateOrg, deactivateOrg
 } = orgSlice.actions;

export const selectOrg = (state: RootStateType) => state.org;
export default orgSlice.reducer