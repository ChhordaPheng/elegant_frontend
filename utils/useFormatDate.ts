// src/utils/useFormatDate.ts
export function useFormatDate() {
    function formatDate(dateString: string, includeHour: boolean = false): string {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...(includeHour && { hour: '2-digit', minute: '2-digit' })
        }).format(date);
    }

    return { formatDate };
}
