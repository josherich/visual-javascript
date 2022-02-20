/*eslint-disable */
import "./styles.css";
import "semantic-ui-css/semantic.min.css";

import { manager, reload, gen } from "./render";

const App = () => {
  const excalidrawRef = React.useRef(null);
  const excalidrawWrapperRef = React.useRef(null);
  const [dimensions, setDimensions] = React.useState({
    width: undefined,
    height: undefined
  });
  const [edits, setEdits] = React.useState([]);

  const [viewModeEnabled, setViewModeEnabled] = React.useState(false);
  const [zenModeEnabled, setZenModeEnabled] = React.useState(true);
  const [gridModeEnabled, setGridModeEnabled] = React.useState(false);
  const sourceText = React.createRef();

  React.useEffect(() => {
    setDimensions({
      width: excalidrawWrapperRef.current.getBoundingClientRect().width,
      height: excalidrawWrapperRef.current.getBoundingClientRect().height
    });
    const onResize = () => {
      setDimensions({
        width: excalidrawWrapperRef.current.getBoundingClientRect().width,
        height: excalidrawWrapperRef.current.getBoundingClientRect().height
      });
    };

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [excalidrawWrapperRef]);

  const updateScene = () => {
    const sceneData = {
      elements: [],
      appState: {
        viewBackgroundColor: "#edf2ff"
      }
    };
    reload(sourceText.current.value);
    gen();
    sceneData.elements = manager.getExDrawElements();
    excalidrawRef.current.updateScene(sceneData);
  };

  const toggleReferences = () => {
    const sceneData = {
      elements: [],
      appState: {
        viewBackgroundColor: "#edf2ff"
      }
    };
    manager.toggleReferences();
    sceneData.elements = manager.getExDrawElements();
    excalidrawRef.current.updateScene(sceneData);
  };

  const toggleAssignments = () => {
    const sceneData = {
      elements: [],
      appState: {
        viewBackgroundColor: "#edf2ff"
      }
    };
    manager.toggleMutations();
    sceneData.elements = manager.getExDrawElements();
    excalidrawRef.current.updateScene(sceneData);
  };

  const exampleScene = () => {
    const sceneData = {
      elements: [],
      appState: {
        viewBackgroundColor: "#edf2ff"
      }
    };
    sceneData.elements = manager.getExDrawElements();
    return sceneData;
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "textarea",
      { className: "source-code", ref: sourceText, defaultValue: manager.getSource(), cols: "25", rows: "10" },
    ),
    React.createElement(
      "div",
      { className: "ui right attached internal rail" },
      React.createElement(
        "div",
        { className: "ui segment" },
        React.createElement(
          "form",
          { className: "ui form" },
          React.createElement(
            "div",
            { className: "field" },
            edits.map(edit => {
              return React.createElement(
                "div",
                { key: edit.name },
                React.createElement(
                  "label",
                  {},
                  edit.name
                ),
                React.createElement(
                  "input",
                  { placeholder: edit.name, type: "text", value: edit.value },
                ),
              )
            })
          ),
        ),
      ),
    ),
    React.createElement(
      "div",
      { className: "button-wrapper" },
      React.createElement(
        "button",
        {
          className: "update-scene",
          onClick: updateScene
        },
        "Reload"
      ),
      React.createElement(
        "button",
        {
          className: "toggle-references",
          onClick: toggleReferences
        },
        "Toggle References"
      ),
      React.createElement(
        "button",
        {
          className: "toggle-assignments",
          onClick: toggleAssignments
        },
        "Toggle Assignments"
      ),
      React.createElement(
        "button",
        {
          className: "reset-scene",
          onClick: () => excalidrawRef.current.resetScene()
        },
        "Reset Scene"
      ),
      React.createElement(
        "label",
        null,
        React.createElement("input", {
          type: "checkbox",
          checked: viewModeEnabled,
          onChange: () => setViewModeEnabled(!viewModeEnabled)
        }),
        "View mode"
      ),
      React.createElement(
        "label",
        null,
        React.createElement("input", {
          type: "checkbox",
          checked: zenModeEnabled,
          onChange: () => setZenModeEnabled(!zenModeEnabled)
        }),
        "Zen mode"
      ),
      React.createElement(
        "label",
        null,
        React.createElement("input", {
          type: "checkbox",
          checked: gridModeEnabled,
          onChange: () => setGridModeEnabled(!gridModeEnabled)
        }),
        "Grid mode"
      )
    ),
    React.createElement(
      "div",
      {
        className: "excalidraw-wrapper",
        ref: excalidrawWrapperRef
      },
      React.createElement(Excalidraw.default, {
        ref: excalidrawRef,
        width: dimensions.width,
        height: dimensions.height,
        initialData: exampleScene(),
        // onChange: (elements, state) =>
          // console.log("Elements :", elements, "State : ", state),
        onSelect: (elements, groupIds) => {
          console.log("Elements :", elements, "GroupIds : ", groupIds);
          const block = manager.getBlockById(groupIds[0]);
          if (block && block.getEditData()) {
            console.log(block.getEditData())
            setEdits(block.getEditData());
          }
        },
        // onPointerUpdate: (payload) => console.log(payload),
        // onCollabButtonClick: () => window.alert("You clicked on collab button"),
        viewModeEnabled: viewModeEnabled,
        zenModeEnabled: zenModeEnabled,
        gridModeEnabled: gridModeEnabled
      })
    )
  );
};

const excalidrawWrapper = document.getElementById("app");

ReactDOM.render(React.createElement(App), excalidrawWrapper);
