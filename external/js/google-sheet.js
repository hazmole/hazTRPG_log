class GSheetHandler {

  constructor() {}

  static getData(url) {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.text();
        })
        .then(csvText => {
          const rows = csvText.split('\n')
            .map(row => row.trim())
            .filter(row => row !== '')
            .map(row => row.split(','));

          resolve(rows);
        })
        .catch(error => {
          reject(`無法取得試算表資料: ${error.message}`);
        });
    });
  }
}