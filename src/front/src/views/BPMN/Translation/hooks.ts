import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks'

import { getBPMNList, getBPMNInstanceList } from '@/api/externalResource'


export const useBPMNListData = (): [
    any[],
    () => void
] => {
    // BPMN is a consortium resource
    const [BPMNList, setBPMNList] = useState<any[]>([])
    const [syncFlag, setSyncFlag] = useState(false)
    const currentConsortiumId = useAppSelector((state) => state.consortium.currentConsortiumId)
    useEffect(() => {
        let ignore = false
        const fetchData = async () => {
            const res = await getBPMNList(currentConsortiumId)
            if (ignore) return [[], () => { }]
            setBPMNList(res)
        }
        fetchData()
        return () => {
            ignore = true
        }
    }, [syncFlag, currentConsortiumId])
    return [BPMNList, () => setSyncFlag(!syncFlag)]
}

export const useEnvironmentData = () => {

}

export const useChannelData = (envId: string, chaincodeId: string) => {

}

export const useBPMNInstanceListData = (
    BPMNId: string
): [
        any[],
        () => void
    ] => {
    const [BPMNInstanceList, setBPMNInstanceList] = useState<any[]>([])
    const [syncFlag, setSyncFlag] = useState(false)
    useEffect(() => {
        let ignore = false
        const fetchData = async () => {
            const res = await getBPMNInstanceList(BPMNId)
            if (ignore) return [[], () => { }]
            setBPMNInstanceList(res)
        }
        fetchData()
    }, [syncFlag, BPMNId])

    return [BPMNInstanceList, () => setSyncFlag(!syncFlag)]
}

export const useBPMNInstanceDetailData = () => {

}

