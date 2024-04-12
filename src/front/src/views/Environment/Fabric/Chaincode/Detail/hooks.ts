import { useState, useEffect } from 'react';
import { getResourceSets, getPeerList, queryInstalledChaincode } from '@/api/resourceAPI';


export const usePeerData = (envId: string, chainCodeId: string): [
    any[],
    boolean,
    () => void
] => {
    const [peerList, setPeerList] = useState([]);
    const [syncFlag, setSyncFlag] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let ignore = false;
        const fetchData = async () => {
            setReady(false);
            const response = await getResourceSets(envId);
            await Promise.all(response.map(async (item: any) => {
                const nodeList = await getPeerList(item.id);
                item.nodeList = nodeList;
                return item;
            }))
            const data = response.reduce((acc: any, cur: any) => {
                return acc.concat(cur.nodeList);
            }, [])


            await Promise.all(data.map(async (item: any) => {
                const res = await queryInstalledChaincode(envId, item.id);
                const installed = res.data;
                for (let i = 0; i < installed.length; i++) {
                    if (installed[i].id === chainCodeId) {
                        item.installed = true;
                        break;
                    }
                }
                if (!item.installed) {
                    item.installed = false;
                }
            }))
            if (ignore) return;
            setPeerList(data);
            setReady(true);
        };
        fetchData();
        return () => {
            ignore = true;
        };
    }, [envId, syncFlag]);
    return [peerList, ready, () => setSyncFlag(!syncFlag)]
}

import { retriveChaincode, queryChaincodeApprove, approveChaincode, getChannelList, queryCommitChaincode } from '@/api/resourceAPI'

export const useChannelData = (envId: string, chainCodeId: string): [
    any[],
    () => void
] => {
    const [channelList, setChannelList] = useState([]);
    const [syncFlag, setSyncFlag] = useState(false);
    // interface elementOfApprovals {
    //     name: string;
    //     status: string;
    //   }


    //   interface DataType {
    //     key: string;
    //     name: string;
    //     membershipApprovals: elementOfApprovals[];
    //     chaincodeCommitted: string;
    //   }

    useEffect(() => {
        let ignore = false;
        const fetchData = async () => {
            const chaincode = await retriveChaincode(envId, chainCodeId);
            const channels = await getChannelList(envId);
            const resourceSets = await getResourceSets(envId);

            const data = await Promise.all(channels.map(async (item) => {
                const approves = await Promise.all(resourceSets.filter((item) => item.org_type === "user_type").map(async (resourceSet) => {
                    const isApproved = await queryChaincodeApprove(item.name, chaincode.name, resourceSet.id, envId);
                    return {
                        resourceSetId: resourceSet.id,
                        resourceSetName: resourceSet.name,
                        membership: resourceSet.membership,
                        membershipName: resourceSet.membershipName,
                        orgId: resourceSet.orgId,
                        isApproved: isApproved,
                    };
                }))
                const isCommit = await queryCommitChaincode(item.name, chaincode.name, envId);
                return {
                    key: item.id,
                    name: item.name,
                    membershipApprovals: approves,
                    chaincodeCommitted: isCommit,
                }
            })
            )
            if (!ignore) {
                setChannelList(data);
            }
        }
        fetchData();
        return () => {
            ignore = true;
        }
    }, [syncFlag, envId, chainCodeId]);
    return [channelList, () => setSyncFlag(!syncFlag)]
}
