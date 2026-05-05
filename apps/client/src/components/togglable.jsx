import { useReducer, useId, useImperativeHandle } from "react";

const getHideWhenVisibleStyles = (visible) => ({ display: visible ? "none" : undefined });
const getShowWhenVisibleStyles = (visible) => ({ display: visible ? undefined : "none" });

export function Togglable({ ref, openButtonLabel = "Open", closeButtonLabel = "Close", children }) {
  const [visible, toggleVisibility] = useReducer((state) => !state, false);

  const contentId = useId();

  useImperativeHandle(ref, () => ({ toggleVisibility }));

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
        <div style={{ marginBottom: 8 }}>{children}</div>
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
