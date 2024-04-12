import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootStateType, DispatchType } from './store'
export const useAppDispatch: () => DispatchType = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootStateType> = useSelector