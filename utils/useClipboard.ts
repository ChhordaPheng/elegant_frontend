import { ref } from 'vue';

export function useClipboard() {
    const snackbar = ref(false);
    const snackbarText = ref('');

    const copyAccountNumber = (accountNumber: string) => {
        console.log("Account number:", accountNumber);

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(accountNumber)
                .then(() => {
                    snackbarText.value = accountNumber;
                    snackbar.value = true;
                })
                .catch((err: Error) => {
                    console.error('Failed to copy account number:', err);
                });
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = accountNumber;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                snackbarText.value = accountNumber;
                snackbar.value = true;
            } catch (err) {
                console.error('Fallback: Failed to copy account number:', err);
            }
            document.body.removeChild(textArea);
        }
    };

    return {
        snackbar,
        snackbarText,
        copyAccountNumber,
    };
}
