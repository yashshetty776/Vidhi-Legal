import { useEffect } from "react";

const CHATBASE_SCRIPT_ID = "V0X8gNmXAWSUjGJ-yRlyz";
const CHATBASE_SCRIPT_URL = "https://www.chatbase.co/embed.min.js";

const removeChatbaseElements = () => {
  document
    .querySelectorAll(
      `#${CHATBASE_SCRIPT_ID}, script[src="${CHATBASE_SCRIPT_URL}"], iframe[src*="chatbase"], [id*="chatbase"]`
    )
    .forEach((element) => element.remove());

  delete window.chatbase;
};

const Nyayadut = () => {
  useEffect(() => {
    if (document.getElementById(CHATBASE_SCRIPT_ID)) {
      return undefined;
    }

    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args) => {
        window.chatbase.q = window.chatbase.q || [];
        window.chatbase.q.push(args);
      };
      window.chatbase = new Proxy(window.chatbase, {
        get(target, property) {
          if (property === "q") {
            return target.q;
          }
          return (...args) => target(property, ...args);
        },
      });
    }

    const script = document.createElement("script");
    script.id = CHATBASE_SCRIPT_ID;
    script.src = CHATBASE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.domain = "www.chatbase.co";
    script.onerror = () => {
      console.error("Nyayadut chatbot failed to load.");
      script.remove();
    };

    document.body.appendChild(script);

    return () => {
      removeChatbaseElements();
    };
  }, []);

  return null;
};

export default Nyayadut;
