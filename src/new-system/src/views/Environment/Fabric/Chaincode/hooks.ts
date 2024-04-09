import {useState, useEffect} from 'react';
import {getChainCodeList} from '@/api/resourceAPI';


export const useChaincodeData = (envId:string):[
    any[],
    ()=>void
] => {
    const [chainCodeList, setChainCodeList] = useState([]);
    const [syncFlag, setSyncFlag] = useState(false);

    useEffect(() => {
        let ignore = false;
        const fetchData = async () => {
            const response = await getChainCodeList(envId);
            if (!ignore) {
                setChainCodeList(response);
            }
        };
        fetchData();
        return () => {
            ignore = true;
        };
    }, [envId, syncFlag]);
    return [chainCodeList,()=>setSyncFlag(!syncFlag)]
}