import { getBusinessRulesByContent } from '@/api/translator';
import { retrieveBPMN } from '@/api/externalResource'
import { useQuery } from 'react-query';

export const useBusinessRulesDataByBpmn = (bpmnId: string) => {
    const { data: dmns = [], isLoading, isError, isSuccess, refetch } = useQuery(['dmns', bpmnId], async () => {
        const response = await retrieveBPMN(bpmnId)
        const bpmnContent = response.bpmnContent
        return await getBusinessRulesByContent(
            bpmnContent
        );
    });
    return [dmns, { isLoading, isError, isSuccess }, refetch]
}

export const useBpmnSvg = (bpmnId: string) => {
    const { data: bpmnSvg = '', isLoading, isError, isSuccess, refetch } = useQuery(['bpmnSvg', bpmnId], async () => {
        const response = await retrieveBPMN(bpmnId)
        return response.svgContent
    });
    return [bpmnSvg, { isLoading, isError, isSuccess }, refetch]
}