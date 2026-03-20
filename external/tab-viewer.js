const ViewerTab = {};


ViewerTab.toggleNavMenu = function() {
  const navMenuElem = document.getElementById('nav-menu');
  const overlayElem = document.getElementById('overlay');
  const isOpen = navMenuElem.classList.toggle('open');
  overlayElem.style.display = isOpen ? 'block' : 'none';
}

ViewerTab.gotoPage = function(cfg, pageID) {
  // Modify URL Params
  CoreRouter.updateParams({ p: pageID });

  // Render
  ViewerTab.renderContent(cfg, pageID);
}

ViewerTab.loadIframe = function(url) {
  BlockUtils.block();
  document.getElementById("viewer-content").src = url;
}

ViewerTab.cancelLoading = function() {
  BlockUtils.unblock();
}

ViewerTab.renderBaseTitle = function(cfg) {
  // Render Site-Title
  document.title = cfg.title;
  document.getElementById("site-title").innerText = cfg.title;
}

ViewerTab.renderMenu = function(cfg) {
  // Render Menu-List
  const menuElem = document.getElementById("viewer-menu-list");
  menuElem.innerHTML = "";
  cfg.pages.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerText = item.name || `頁面 ${index + 1}`;
    div.onclick = () => {
      ViewerTab.gotoPage(cfg, index);
      ViewerTab.toggleNavMenu();
    };
    menuElem.appendChild(div);
  });
}

ViewerTab.renderContent = function(cfg, pageID) {
  // assert pageID
  if (typeof pageID == "string") {
    pageID = parseInt(pageID);
  }
  if (pageID == null || pageID == NaN) {
    pageID = 0;
  }
  const item = cfg.pages[pageID];

  // Render Title
  const titleText = cfg.title + '-' + item.name;
  document.title = titleText;
  document.getElementById("site-title").innerText = titleText;

  // Load Iframe Content
  ViewerTab.loadIframe(item.url);
}

ViewerTab.setMode = function(modeCfg) {
  Object.keys(modeCfg).forEach(key => {
    const value = modeCfg[key];

    const elem = document.getElementById(`${key}-mode-btn`);
    if (value) {
      elem.classList.add('active');
      document.getElementById("Root").classList.add(`${key}-mode`);
    }
    else {
      elem.classList.remove('active');
    }
  });
}

ViewerTab.toggleWideMode = function(elem) {
  const val = elem.classList.toggle("active");
  CoreRouter.updateParams({ wide: val? 1: 0 });
  document.getElementById("Root").classList.toggle("wide-mode");
}

ViewerTab.toggleDarkMode = function(elem) {
  const val = elem.classList.toggle("active");
  CoreRouter.updateParams({ dark: val? 1: 0 });
  document.getElementById("Root").classList.toggle("dark-mode");
}