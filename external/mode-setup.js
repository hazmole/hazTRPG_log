async function setup() {
  // Get googleSheet URL
  const csvUrl = document.getElementById('csv-url').value;
  // const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQvJ6BSaq9M6zhvW_kPOsdaCbBtdJhkZuJCiD5zUj8qIfWDOpuOM_7P4mB_434BrVBPgI9oB_SFzZx/pub?gid=0&single=true&output=csv"
  if (!csvUrl.includes('output=csv')) {
    alert('請輸入有效的 CSV 發佈網址！');
    return;
  }

  // Try Loading URL
  try {
    BlockUtils.block();
    const data = await GSheetHandler.getData(csvUrl);
    const cfg = new RPConfig(data)

    const encodedUrl = btoa(csvUrl);


    const path = window.location.pathname;
    window.history.pushState({ additionalInformation: 'Updated the URL with JS' }, this.SITE_TITLE, path+`?sheet=${encodedUrl}`);
    window.dispatchEvent(new CustomEvent('route-change'));
  } catch (error) {
    alert('無法取得資料', error);
  } finally {
    BlockUtils.unblock();
  }
}

class RPConfig {
  constructor(csvData) {
    this.title = csvData[0][1];
    this.pages = csvData.slice(3).map(row => {
      return {
        name: row[0],
        url:  row[1],
      };
    });
  }
}