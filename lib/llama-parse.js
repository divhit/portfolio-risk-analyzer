import axios from 'axios';
import FormData from 'form-data';

export class LlamaParse {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
  }

  async load_data(fileContent) {
    const formData = new FormData();
    formData.append('file', fileContent, {
      filename: 'document.pdf',
      contentType: 'application/pdf',
    });

    try {
      const response = await axios.post(
        'https://api.cloud.llamaindex.ai/api/parsing/upload',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.apiKey}`,
            'accept': 'application/json',
          },
        }
      );

      // Assuming the API returns parsed content in the expected format
      return response.data;
    } catch (error) {
      console.error('Error parsing document:', error);
      throw error;
    }
  }
}