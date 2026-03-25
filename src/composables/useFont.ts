interface Config {
  kitId: string;
  scriptTimeout?: number;
  async: boolean;
  loading?: () => void;
  active?: () => void;
  inactive?: () => void;
}
declare global {
  interface Window {
    Typekit: {
      load: (config: Config) => void;
    };
  }
}

export function useFont() {
  const loadFont = function(d: Document, config: Config) {
    const h = d.documentElement,
      t = setTimeout(function() {
        h.className = h.className.replace(/\bwf-loading\b/g, "")
          + " wf-inactive";
      }, config.scriptTimeout),
      tk = d.createElement("script"),
      s = d.getElementsByTagName("script")[0];
    h.className += " wf-loading";
    tk.src = "https://use.typekit.net/" + config.kitId + ".js";
    tk.async = true;
    tk.onload = () => {
      clearTimeout(t);
      try {
        (window as Window).Typekit.load(config);
      } catch (e: unknown) {
        console.log("Typekit load error:", e);
      }
    };
    s.parentNode?.insertBefore(tk, s);
  };

  return {
    loadFont,
  };
}
