import { createSlice } from '@reduxjs/toolkit'
import type { RootStateType } from '../store'

interface UIState {
    orgSelectOpenRequest: boolean,
    consortiumSelectOpenRequest: boolean,
    envSelectOpenRequest: boolean,
}

const initialState: UIState = {
    orgSelectOpenRequest: false,
    consortiumSelectOpenRequest: false,
    envSelectOpenRequest: false,
}

export const UISlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openOrgSelectRequest: (state) => {
            state.orgSelectOpenRequest = true;
        },
        openConsortiumSelectRequest: (state) => {
            state.consortiumSelectOpenRequest = true;
        },
        openEnvSelectRequest: (state) => {
            state.envSelectOpenRequest = true;
        },
        consumeOrgSelectRequest: (state) => {
            state.orgSelectOpenRequest = false;
        },
        consumeConsortiumSelectRequest: (state) => {
            state.consortiumSelectOpenRequest = false;
        },
        consumeEnvSelectRequest: (state) => {
            state.envSelectOpenRequest = false;
        },
    },
});

export const { openOrgSelectRequest, openConsortiumSelectRequest, openEnvSelectRequest, consumeOrgSelectRequest, consumeConsortiumSelectRequest, consumeEnvSelectRequest } = UISlice.actions;

export const selectUI = (state: RootStateType) => state.ui;

export default UISlice.reducer;
