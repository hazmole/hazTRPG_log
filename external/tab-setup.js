const SetupTab = {};

SetupTab.connect = async function() {
  // Get googleSheet URL
  const csvUrl = document.getElementById('csv-url').value;
  if (!csvUrl.includes('output=csv')) {
    alert('請輸入有效的 CSV 發佈網址！');
    return;
  }

  // Try Loading URL
  try {
    BlockUtils.block();
    await GSheetHandler.getData(csvUrl);
  } catch (error) {
    alert('無法取得資料', error);
  } finally {
    BlockUtils.unblock();
  }

  const encodedUrl = btoa(csvUrl);

  CoreRouter.updateParams({
    sheet: encodedUrl,
    p: 0,
  });
  window.dispatchEvent(new CustomEvent('route-change'));
}

