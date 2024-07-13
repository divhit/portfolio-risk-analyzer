export class LlamaParse {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
  }

  async load_data(fileContent) {
    // This is a mock implementation
    console.log('Mock LlamaParse: load_data called');
    return [
      {
        text: "This is a mock parsed content of the PDF. It contains information about portfolio risk metrics.",
        metadata: {
          page: 1
        }
      }
    ];
  }
}