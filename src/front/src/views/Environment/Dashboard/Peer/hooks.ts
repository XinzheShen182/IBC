
import { getResourceSets, getPeerList, queryInstalledChaincode } from '@/api/resourceAPI';

import { useQuery } from 'react-query';

export const usePeerData = (envId: string) => {

    const { data, isLoading, refetch } = useQuery(['peerList', envId], async () => {
        const response = await getResourceSets(envId);
        await Promise.all(response.map(async (item: any) => {
            const nodeList = await getPeerList(item.id);
            item.nodeList = nodeList;
            return item;
        }))
        const data = response.reduce((acc: any, cur: any) => {
            return acc.concat(cur.nodeList);
        }, [])
        return data;
    })
    return [data, isLoading, refetch]
}