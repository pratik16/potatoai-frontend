(function () {
  function resolveMode(mode) {
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode === 'light' ? 'light' : 'dark';
  }

  function apply(uiTheme, mode) {
    var root = document.documentElement;
    root.dataset.colorScheme = uiTheme;

    var resolved = resolveMode(mode);
    root.dataset.theme = resolved;
    root.classList.toggle('dark', resolved === 'dark');
  }

  try {
    var auth = JSON.parse(localStorage.getItem('auth') || 'null');
    var uiTheme = (auth && auth.user && auth.user.ui_theme) || localStorage.getItem('potatochat_ui_theme') || 'potato';
    var mode = (auth && auth.user && auth.user.theme) || 'dark';
    if (uiTheme !== 'potato' && uiTheme !== 'claude') uiTheme = 'potato';
    apply(uiTheme, mode);
  } catch (e) {
    apply('potato', 'dark');
  }
})();
