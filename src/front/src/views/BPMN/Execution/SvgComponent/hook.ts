import { useEffect, useState } from 'react'
import { retrieveBPMNInstance, retrieveBPMN } from '@/api/externalResource'
import api from '@/api/apiConfig';
import { getResourceSets, getFireflyList } from '@/api/resourceAPI';
import { useAppSelector } from '@/redux/hooks';

export const useBPMNIntanceDetailData = (BPMNInstanceId: string) => {
    const [BPMNInstanceData, setBPMNInstanceData] = useState<any>({})
    const [syncFlag, setSyncFlag] = useState(false)
    const [ready, setReady] = useState(false)
    useEffect(() => {
        let ignore = false
        const fetchData = async () => {
            setReady(false)
            const response = await retrieveBPMNInstance(BPMNInstanceId)
            if (ignore) return
            setBPMNInstanceData(response)
            setReady(true)
        }
        fetchData()
        return () => {
            ignore = true
        }
    }, [BPMNInstanceId, syncFlag])
    return [BPMNInstanceData, ready, () => setSyncFlag(!syncFlag)]
}

export const useBPMNDetailData = (BPMNId: string) => {
    const [BPMNData, setBPMNData] = useState<any>({})
    const [syncFlag, setSyncFlag] = useState(false)
    const [ready, setReady] = useState(false)
    useEffect(() => {
        let ignore = false
        if (!BPMNId) return
        const fetchData = async () => {
            setReady(false)
            const bpmn = await retrieveBPMN(BPMNId)
            if (ignore) return
            setBPMNData(bpmn)
            setReady(true)
        }
        fetchData()
        return () => {
            ignore = true
        }
    }, [BPMNId, syncFlag])
    return [BPMNData, ready, () => setSyncFlag(!syncFlag)]
}

export const useAvailableMembers = (envId: string): [
    any[],
    () => void
] => {
    const currenOrgId = useAppSelector((state) => state.org.currentOrgId)
    const [members, setMembers] = useState<any[]>([])
    const [syncFlag, setSyncFlag] = useState(false)
    useEffect(() => {
        let ignore = false
        const fetchData = async () => {
            const response = await getResourceSets(envId, currenOrgId)
            if (ignore) return [[], () => { }]
            const data = response.map((item: any) => {
                return {
                    "membershipName": item.membershipName,
                    "membershipId": item.membership,
                }
            })
            setMembers(data)
        }
        fetchData()
        return () => {
            ignore = true
        }
    }, [envId, syncFlag])
    return [members, () => setSyncFlag(!syncFlag)]
}

export const useFireflyData = (
    envId: string,
    membershipId: string
): [
        {
            coreUrl: string,
        },
        () => void
    ] => {

    const [firefly, setFirefly] = useState({
        coreUrl: ""
    });
    const [syncFlag, setSyncFlag] = useState(false);

    useEffect(() => {
        let ignore = false;
        const fetchData = async () => {
            try {
                if (!envId ||
                    !membershipId) return;

                const data = await getFireflyList(envId, null);
                if (ignore) return [[], () => { }];
                const filterData = data.filter((item: any) => item.membership === membershipId);
                setFirefly(filterData[0]);
            } catch (e) {
                console.log(e);
            }
        }
        fetchData();
        return () => { ignore = true; }
    }, [syncFlag, envId]);
    return [firefly, () => { setSyncFlag(!syncFlag) }];
}

// Firefly Hook

import {
    getAllEvents, getAllGateways, getAllMessages
} from '@/api/executionAPI'

export const useAllFireflyData = (
    coreUrl: string, contractName: string,
): [
        any[],
        any[],
        any[],
        boolean,
        () => void
    ] => {
    const [events, setEvents] = useState<any[]>([]);
    const [gateways, setGateways] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [syncFlag, setSyncFlag] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let ignore = false;
        const fetchData = async () => {
            setReady(false);
            if (!coreUrl || !contractName) return;
            const events = await getAllEvents(coreUrl, contractName);
            const gateways = await getAllGateways(coreUrl, contractName);
            const messages = await getAllMessages(coreUrl, contractName);
            if (ignore) return
            if (events) {
                setEvents(events.map((item: any) => {
                    return {
                        ...item,
                        type: "event",
                        state: item.eventState
                    }
                }));
            }
            if (gateways) {
                setGateways(gateways.map(
                    (item: any) => {
                        return {
                            ...item,
                            type: "gateway",
                            state: item.gatewayState
                        }
                    }
                ));
            }
            if (messages) {
                setMessages(messages.map(
                    (item: any) => {
                        return {
                            ...item,
                            type: "message",
                            state: item.msgState
                        }
                    }

                ));
            }
            setReady(true);
        }
        fetchData();
        return () => { ignore = true; }
    }, [syncFlag, coreUrl, contractName]);
    return [events, gateways, messages, ready, () => { setSyncFlag(syncFlag=>!syncFlag)}];
}