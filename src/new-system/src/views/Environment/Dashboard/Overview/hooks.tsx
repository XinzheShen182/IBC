import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks'

import { getEnvironment } from '@/api/platformAPI'

export const useEnvInfo = () => {
    const currentConsortiumId = useAppSelector(state => state.consortium.currentConsortiumId)
    const currentEnvId = useAppSelector(state => state.env.currentEnvId)

    const [EnvInfo, setEnvInfo] = useState<any>({})
    const [syncFlag, setSyncFlag] = useState(false)

    useEffect(() => {
        let ignore = false
        const fetchData = async () => {
            try {
                const res = await getEnvironment(currentEnvId, currentConsortiumId);
                if (ignore) return;
                setEnvInfo(res);
            } catch (err) {
                console.error("导航栏获取OrgList报错", err);
            }
        };
        fetchData();
        return () => { ignore = true; };
    }, [currentConsortiumId, currentEnvId, syncFlag])

    return [EnvInfo, () => setSyncFlag(!syncFlag)]

}

import { getMembershipList } from '@/api/platformAPI'

export const useMembershipListData = () => {
    const currentConsortiumId = useAppSelector(state => state.consortium.currentConsortiumId)
    const currentOrgId = useAppSelector(state => state.org.currentOrgId)
    const [membershipList, setMembershipList] = useState<any>([])
    const [syncFlag, setSyncFlag] = useState(false)

    useEffect(() => {
        let ignore = false
        const fetchData = async () => {
            try {
                const res = await getMembershipList(currentConsortiumId);
                if (ignore) return;
                setMembershipList(res.filter((item: any) => item.loleido_organization === currentOrgId));
            } catch (err) {
                console.error("导航栏获取OrgList报错", err);
            }
        };
        fetchData();
        return () => { ignore = true; };
    }, [currentConsortiumId, syncFlag])

    return [membershipList, () => setSyncFlag(!syncFlag)]
}
