import { useId } from "react";
import { useReducer } from "react";

const contentStyles = { marginBottom: 8 };

const getHideWhenVisibleStyles = (visible) => ({ display: visible ? "none" : undefined });
const getShowWhenVisibleStyles = (visible) => ({ display: visible ? undefined : "none" });

export function Togglable({ openButtonLabel = "Open", closeButtonLabel = "Close", children }) {
  const [visible, toggleVisibility] = useReducer((state) => !state, false);

  const contentId = useId();

  return (
    <div>
      <div style={getHideWhenVisibleStyles(visible)}>
        <button
          type="button"
          onClick={toggleVisibility}
          aria-expanded="false"
          aria-controls={contentId}
        >
          {openButtonLabel}
        </button>
      </div>
      <div id={contentId} style={getShowWhenVisibleStyles(visible)}>
        <div style={contentStyles}>{children}</div>
        <button
          type="button"
          onClick={toggleVisibility}
          aria-expanded="true"
          aria-controls={contentId}
        >
          {closeButtonLabel}
        </button>
      </div>
    </div>
  );
}
