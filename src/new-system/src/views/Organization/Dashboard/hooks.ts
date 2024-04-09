import {useQuery} from 'react-query';
import {getOrg} from '@/api/platformAPI';
export const useOrgInfo = (orgId: string) => {
    const {data: orgInfo = {}, isLoading, isError, isSuccess} = useQuery(['orgInfo', orgId], async () => {
        return await getOrg(orgId);
    });
    return [orgInfo, {
        isLoading, isError, isSuccess
    }];
    }