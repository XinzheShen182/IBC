import { useState, useEffect } from 'react';

import { useAppSelector } from '@/redux/hooks.ts';
import { getFireflyDetail } from '@/api/resourceAPI.ts';
export const useFireflyDetail = (
    envId: string,
    fireflyId: string
): [
        any,
        boolean,
        () => void
    ] => {

    const [firefly, setFirefly] = useState({});
    const [syncFlag, setSyncFlag] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let ignore = false;
        const fetchData = async () => {
            setReady(false);
            const data = await getFireflyDetail(envId, fireflyId);
            if (ignore) return
            setFirefly(data);
            setReady(true);
        }
        fetchData();
        return () => { ignore = true; }
    }, [syncFlag, envId, fireflyId]);
    return [firefly, ready, () => { setSyncFlag(!syncFlag) }];
}