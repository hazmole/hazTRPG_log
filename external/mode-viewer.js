function toggleNavMenu() {
  const drawer = document.getElementById('nav-menu');
  const overlay = document.getElementById('overlay');
  const isOpen = drawer.classList.toggle('open');
  overlay.style.display = isOpen ? 'block' : 'none';
}


function loadIframe(url) {
  BlockUtils.block();
  document.getElementById("viewer-content").src = url;
}

function cancelLoading() {
  BlockUtils.unblock();
}