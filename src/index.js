/*eslint-disable */
// import "./styles.css";

import { manager, reload, codeGen } from "./render";

const App = () => {
  const excalidrawRef = React.useRef(null);
  const excalidrawWrapperRef = React.useRef(null);
  const [dimensions, setDimensions] = React.useState({
    width: undefined,
    height: undefined
  });
  const [edits, setEdits] = React.useState([]);
  const [layout, setLayout] = React.useState({
    slider: true,
    editor: true,
  });
  const [source, setSource] = React.useState(manager.getSource());

  const [viewModeEnabled, setViewModeEnabled] = React.useState(false);
  const [textModeEnabled, setTextModeEnabled] = React.useState(false);
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
    if (sourceText.current) {
      reload(sourceText.current.value, textModeEnabled);
      sceneData.elements = manager.getExDrawElements();
      excalidrawRef.current.updateScene(sceneData);
    }
  };

  const updateSource = (id, path, value) => {
    const block = manager.getBlockById(id);
    block.edit(path, value);
    sourceText.current.value = codeGen();
  }

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
      "div",
      { className: "body" },
      layout.editor ? React.createElement(
        "div",
        { className: "ui source-code" },
        React.createElement(
          "div",
          { className: "ui form" },
          React.createElement(
            "textarea",
            { className: "", ref: sourceText, defaultValue: source, cols: "80", rows: "10" },
          )
        ),

      ) : null,
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
            const block = manager.getBlockById(groupIds);
            // console.log("Elements :", elements, "GroupIds : ", groupIds, block);
            if (block && block.getEditData()) {
              setEdits(block.getEditData());
            } else {
              setEdits([]);
            }
          },
          // onPointerUpdate: (payload) => console.log(payload),
          // onCollabButtonClick: () => window.alert("You clicked on collab button"),
          viewModeEnabled: viewModeEnabled,
          zenModeEnabled: true,
          gridModeEnabled: gridModeEnabled
        })
      )
    ),
    layout.slider ?
    React.createElement(
      "div",
      { className: "ui right attached internal rail" },

      React.createElement(
        "div",
        { className: "button-wrapper" },
        React.createElement(
          "button",
          {
            className: "update-scene ui button tiny",
            onClick: updateScene
          },
          "Reload"
        ),
        React.createElement(
          "button",
          {
            className: "toggle-references ui button tiny",
            onClick: toggleReferences
          },
          "Toggle References"
        ),
        React.createElement(
          "button",
          {
            className: "toggle-assignments ui button tiny",
            onClick: toggleAssignments
          },
          "Toggle Assignments"
        ),
        React.createElement(
          "button",
          {
            className: "reset-scene ui button tiny",
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
            checked: textModeEnabled,
            onChange: () => setTextModeEnabled(!textModeEnabled)
          }),
          "Text mode"
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
        "form",
        { className: "ui form" },
        React.createElement(
          "div",
          { className: "field" },
          edits.map((edit, index) => {
            return React.createElement(
              "div",
              { key: edit.id + edit.name + index },
              React.createElement(
                "label",
                {},
                edit.name
              ),
              React.createElement(
                "input",
                {
                  placeholder: edit.name,
                  type: "text",
                  defaultValue: edit.value,
                  onBlur: (e) => {
                    updateSource(edit.id, edit.path, e.target.value);
                  }
                },
              ),
            )
          })
        ),
      ),

    ) : null,
    React.createElement(
      "div",
      { className: "layout" },
      React.createElement(
        "button",
        {className: "ui button tiny", onClick: () => setLayout({slider: !layout.slider, editor: layout.editor})},
        "Slider"
      ),
      React.createElement(
        "button",
        {className: "ui button tiny", onClick: () => setLayout({editor: !layout.editor, slider: layout.slider})},
        "Editor"
      ),
    ),

  );
};

const excalidrawWrapper = document.getElementById("app");

ReactDOM.render(React.createElement(App), excalidrawWrapper);
