class CoreRouter {
  constructor() {
    this.tabs = ["setup", "viewer"];
    this.currentTab = "setup";
  }

  async run() {
    // Listen URL change
    window.addEventListener('popstate', () => this.loadPage());
    window.addEventListener('route-change', () => this.loadPage());
    
    // First loading
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.loadPage());
    } else {
      this.loadPage();
    }
  }

  async loadPage() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sheetID = urlParams.get('sheet');
      const pageID = urlParams.get('p');

      if (sheetID) {
        // Mode: viewer
        this.gotoViewerTab(sheetID, pageID);
      } else {
        // Mode: setup
        this.gotoSetupTab();
      }


      BlockUtils.block();
    } catch (err) {
      console.error(err);
    } finally {
      BlockUtils.unblock();
    }
  }

  gotoSetupTab() {
    this.showTab("setup");
  }
  async gotoViewerTab(sheetID, pageID) {
    this.showTab("viewer");

    try {
      BlockUtils.block();

      const csvUrl = atob(sheetID);
      const data = await GSheetHandler.getData(csvUrl);
      const cfg = new RPConfig(data)

      // 設定 Site-Title
      document.getElementById("site-title").innerText = cfg.title;

      // 建立 Nav-Menu
      const menuElem = document.getElementById("viewer-menu-list");
      cfg.pages.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerText = item.name || `頁面 ${index + 1}`;
        div.onclick = () => {
          loadIframe(item.url);
          toggleNavMenu(); // 點擊後自動收合
        };
        menuElem.appendChild(div);
      });

      // 讀取 iframe
      if (pageID == null) pageID = "0";
      const item = cfg.pages[pageID];
      loadIframe(item.url);

    } catch (error) {
      alert('無法取得資料', error);
    } finally {
      BlockUtils.unblock();
    }
  }


  showTab(activeTabID) {
    this.tabs.forEach(tabID => {
      const elem = document.getElementById(`${tabID}-section`);
      if (tabID === activeTabID)
        elem.classList.remove('hidden');
      else 
        elem.classList.add('hidden');
    });
  }
}