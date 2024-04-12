import { useQuery } from 'react-query';
import { getFireflyList } from '@/api/resourceAPI.ts';
export const useFireflyListData = (envId: string, orgId: string) => {
    const { data: fireflyList = [], isLoading, isError, isSuccess, refetch } = useQuery(['fireflyListData', envId, orgId], async () => {
        return await getFireflyList(envId, orgId);
    });
    return [fireflyList, {
        isLoading, isError, isSuccess
    }, refetch];
};