export const onFileChange = async(event: Event, storeAction: (fieldName: string, file: File) => Promise<void>, fieldName: string) => {
    const target = event.target as HTMLInputElement;
    const file = target.files ? target.files[0] : null;
  
    if (file) {
      await storeAction(fieldName, file);
    }
  }
  