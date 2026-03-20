class CoreRouter {
  constructor() {
    this.tabs = ["setup", "viewer"];
    this.currentTab = "setup";
    this.gConfig = null;
  }

  async run() {
    // Listen URL change
    window.addEventListener('popstate',     () => this.loadSite());
    window.addEventListener('route-change', () => this.loadSite());
    
    // First loading
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.loadSite());
    } else {
      this.loadSite();
    }
  }

  async loadSite() {
    const urlParams = new URLSearchParams(window.location.search);
    const sheetID = urlParams.get('sheet');
    const pageID = urlParams.get('p');
    const isDarkMode = urlParams.get('dark')? true: false;
    const isWideMode = urlParams.get('wide')? true: false;

    if (sheetID == null) {
      // :: Setup-Tab
      this.showTab("setup");
      
      this.gConfig = null;
    } else {
      // :: Viewer-Tab
      this.showTab("viewer");
      ViewerTab.setMode({
        'dark': isDarkMode,
        'wide': isWideMode,
      });
      // loading
      if (!this.gConfig || this.gConfig.ID != sheetID) {
        try {
          BlockUtils.block();
          const gData = await GSheetHandler.getData(atob(sheetID));
          this.gConfig = new RPConfig(sheetID, gData);
        } catch (error) {
          console.error(error);
        } finally {
          BlockUtils.unblock();
        }
        ViewerTab.renderBaseTitle(this.gConfig);
        ViewerTab.renderMenu(this.gConfig);
      }
      // rendering
      ViewerTab.renderContent(this.gConfig, pageID);
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

  static updateParams(newParams) {
    const siteUrl = new URL(window.location.href);
    const params = siteUrl.searchParams;

    Object.keys(newParams).forEach(key => {
      const value = newParams[key];
      if (!value) params.delete(key);
      else        params.set(key, value);
    });

    window.history.pushState(
      { additionalInformation: 'Updated the URL with JS' }, '',
      siteUrl.pathname + '?' + params.toString());
  }
}

class RPConfig {
  constructor(ID, csvData) {
    this.ID = ID;
    this.title = csvData[0][1];
    this.pages = csvData.slice(3).map(row => {
      return {
        name: row[0],
        url:  row[1],
      };
    });
  }
}