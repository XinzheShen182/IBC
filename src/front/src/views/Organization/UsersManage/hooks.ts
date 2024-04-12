import { useQuery, useMutation } from 'react-query';
import { getUserList, inviteUserJoinOrg } from '@/api/platformAPI.ts';

export const useUserListData = (orgId: string) => {
    const { data: userList = [], isLoading, isError, isSuccess, refetch } = useQuery(['userListData', orgId], async () => {
        return await getUserList(orgId);
    });
    return [userList, {
        isLoading, isError, isSuccess
    }, refetch];
}

export const useInviteUser = () => {
    const { mutate, isLoading, isError, isSuccess } = useMutation(({
        email, orgId
    }) => {
        return inviteUserJoinOrg(orgId, email);
    });
    return [mutate, {
        isLoading, isError, isSuccess
    }];
}