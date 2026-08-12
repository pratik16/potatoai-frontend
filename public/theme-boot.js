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
    // Potato is temporarily hidden from the appearance picker pending a redesign;
    // force Claude even for accounts with an old stored ui_theme of 'potato'.
    var uiTheme = 'claude';
    var auth = JSON.parse(localStorage.getItem('auth') || 'null');
    var mode = (auth && auth.user && auth.user.theme) || 'dark';
    apply(uiTheme, mode);
  } catch (e) {
    apply('claude', 'dark');
  }
})();
