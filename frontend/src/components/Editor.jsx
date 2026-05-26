import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import MonacoEditor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const getRandomColor = () => {
  const colors = ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA", "#F472B6"];
  return colors[Math.floor(Math.random() * colors.length)];
};

function Editor({ roomId, language, username, onCodeChange, initialCode }) {
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const ytextRef = useRef(null);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const decorationsRef = useRef([]);
  const widgetsRef = useRef({});
  const userColor = useRef(getRandomColor()).current;
const YJS_URL = 'wss://tender-enthusiasm-production-4bc3.up.railway.app'
  
  // Track client window state for real-time mobile responsive layout sizes
  const [editorFontSize, setEditorFontSize] = useState(14);

  useEffect(() => {
    const handleResize = () => {
      setEditorFontSize(window.innerWidth < 640 ? 12 : 14);
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };
    
    // Set initial size
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamic language key sanitizer logic to safely parse string tokens inside Monaco context engine structures
  const getEditorLanguage = (lang) => {
    const mapping = {
      javascript: "javascript",
      python: "python",
      cpp: "cpp"
    };
    return mapping[lang] || "javascript";
  };

  const injectCursorStyle = (clientId, color) => {
    const styleId = `cursor-style-${clientId}`;
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      .remote-cursor-${clientId} {
        border-left: 2px solid ${color} !important;
      }
    `;
    document.head.appendChild(style);
  };

  useEffect(() => {
    ydocRef.current = new Y.Doc();

    providerRef.current = new WebsocketProvider(
  YJS_URL,
  roomId,
  ydocRef.current
)

    // Set local user awareness
    const awareness = providerRef.current.awareness;
    awareness.setLocalStateField("user", {
      name: username,
      color: userColor
    });

    // Listen for other users' cursor changes
    awareness.on("change", () => {
      if (!editorRef.current) return;

      const states = Array.from(awareness.getStates().entries());
      const activeClientIds = new Set();
      const newDecorations = []

      states.forEach(([clientId, state]) => {
        if (clientId === ydocRef.current.clientID) return;
        if (!state.user || !state.cursor) return;

        const { lineNumber, column } = state.cursor;
        const { name, color } = state.user;
        activeClientIds.add(clientId);

        // Cursor line decoration
        newDecorations.push({
          range: {
            startLineNumber: lineNumber,
            startColumn: column,
            endLineNumber: lineNumber,
            endColumn: column
          },
          options: {
            className: `remote-cursor-${clientId}`,
            stickiness: 1
          }
        });

        injectCursorStyle(clientId, color);

        // Remove old widget if exists
        if (widgetsRef.current[clientId]) {
          editorRef.current.removeContentWidget(widgetsRef.current[clientId]);
        }

        // Create label widget
        const widget = {
          getId: () => `cursor-widget-${clientId}`,
          getDomNode: () => {
            const node = document.createElement("div");
            node.textContent = name;
            node.style.cssText = `
              background: ${color};
              color: white;
              font-size: 10px;
              font-weight: 600;
              padding: 2px 6px;
              border-radius: 4px;
              pointer-events: none;
              white-space: nowrap;
              font-family: sans-serif;
              margin-top: -20px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            return node;
          },
          getPosition: () => ({
            position: { lineNumber, column },
            preference: [0]
          })
        };

        editorRef.current.addContentWidget(widget);
        widgetsRef.current[clientId] = widget;
      });

      // Remove widgets for users who left
      Object.keys(widgetsRef.current).forEach(clientId => {
        if (!activeClientIds.has(Number(clientId))) {
          editorRef.current.removeContentWidget(widgetsRef.current[clientId]);
          delete widgetsRef.current[clientId];
        }
      });

      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        newDecorations
      );
    });

    ytextRef.current = ydocRef.current.getText("code");

    setTimeout(() => {
  if (editorRef.current && initialCode) {
    const currentYjsText = ytextRef.current.toString()
    
    if (currentYjsText === '') {
      ydocRef.current.transact(() => {
        ytextRef.current.insert(0, initialCode)
      })
    }
    
    // Always set Monaco value regardless of Yjs state
    editorRef.current.setValue(
      ytextRef.current.toString() || initialCode
    )
  }
}, 1500)

    ytextRef.current.observe(() => {
      if (!editorRef.current) return

      isRemoteChange.current = true
      const newValue = ytextRef.current.toString()
      const currentValue = editorRef.current.getValue()

      if (currentValue !== newValue) {
        const position = editorRef.current.getPosition()
        editorRef.current.setValue(newValue)
        editorRef.current.setPosition(position)
      }

      // setTimeout ensures Monaco's async onChange fires BEFORE we reset the flag
      setTimeout(() => {
        isRemoteChange.current = false
      }, 0)
    })

    return () => {
      if (editorRef.current) {
        Object.values(widgetsRef.current).forEach(widget => {
          editorRef.current.removeContentWidget(widget);
        });
      }
      widgetsRef.current = {};
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
    };
  }, [roomId, initialCode, username, userColor]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    if (initialCode && !ytextRef.current.toString()) {
      editor.setValue(initialCode);
    }

    // Track cursor position and broadcast via awareness
    editor.onDidChangeCursorPosition((e) => {
      if (!providerRef.current) return;
      providerRef.current.awareness.setLocalStateField("cursor", {
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });
  };

  const handleEditorChange = (value) => {
    if (onCodeChange) onCodeChange(value);
    if (isRemoteChange.current) return;

    const ytext = ytextRef.current;
    if (!ytext) return;
    const currentText = ytext.toString();

    if (value !== currentText) {
      ydocRef.current.transact(() => {
        ytext.delete(0, currentText.length);
        ytext.insert(0, value || "");
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-[55vh] sm:h-full w-full min-h-0 bg-[#0c0c0c] flex flex-col border border-zinc-900/60 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
    >
      {/* MAC-STYLE IDE WINDOW HEADER BAR - Optimized size layouts across viewports */}
      <div className="bg-[#080808] px-3.5 py-2 sm:px-4 sm:py-3 flex items-center justify-between border-b border-zinc-900/80 select-none shrink-0">
        {/* Left window control nodes */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex gap-1 shrink-0">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500/60 border border-red-600/30" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500/60 border border-amber-600/30" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500/60 border border-emerald-600/30" />
          </div>
          <span className="text-zinc-500 text-[10px] sm:text-[11px] font-mono font-medium ml-1.5 sm:ml-2 tracking-wide truncate max-w-[110px] xs:max-w-[160px] sm:max-w-[220px]">
            {username || "Guest"}'s workspace
          </span>
        </div>

        {/* Right Active Language Indicator Status badge */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md flex items-center gap-1 sm:gap-1.5 shrink-0">
          <Code2 size={10} className="text-[#F48C06] sm:hidden" />
          <Code2 size={11} className="text-[#F48C06] hidden sm:block" />
          <span className="text-zinc-400 font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">
            {language}
          </span>
        </div>
      </div>

      {/* CORE IDE EDITING AREA PANEL CONTAINER - Enforced explicit constraint boundaries */}
      <div className="flex-1 w-full bg-[#0c0c0c] relative pt-1 sm:pt-2 min-h-0 overflow-hidden">
        <MonacoEditor
          height="100%"
          width="100%"
          language={getEditorLanguage(language)}
          theme="vs-dark"
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          loading={
            <div className="absolute inset-0 bg-[#0c0c0c] flex flex-col items-center justify-center gap-2.5 text-zinc-500 font-mono text-[11px] sm:text-xs px-4 text-center">
              <div className="w-4 h-4 rounded-full border border-orange-500/30 border-t-orange-500 animate-spin" />
              <span>Mounting Synchronization Sandbox Matrix...</span>
            </div>
          }
          options={{
            fontSize: editorFontSize,
            fontFamily: "Fira Code, JetBrains Mono, source-code-pro, Menlo, Monaco, Consolas, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            wordWrap: "on",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            padding: { top: window.innerWidth < 640 ? 6 : 12, bottom: window.innerWidth < 640 ? 6 : 12 },
            renderLineHighlight: "all",
            lineNumbersMinChars: window.innerWidth < 640 ? 3 : 4,
            glyphMargin: false,
            folding: window.innerWidth >= 640, // Disable code folding on mobile to clean line margins
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              verticalScrollbarSize: window.innerWidth < 640 ? 6 : 10,
              horizontalScrollbarSize: window.innerWidth < 640 ? 6 : 10,
              useShadows: false
            }
          }}
          beforeMount={(monaco) => {
            // Inject customizable compiler theme properties matched perfectly into the layout profile
            monaco.editor.defineTheme("vs-dark", {
              base: "vs-dark",
              inherit: true,
              rules: [
                { token: "comment", foreground: "6a737d", fontStyle: "italic" },
                { token: "keyword", foreground: "f48c06", fontStyle: "bold" }, 
                { token: "string", foreground: "34d399" },
                { token: "number", foreground: "60a5fa" }
              ],
              colors: {
                "editor.background": "#0c0c0c", 
                "editor.foreground": "#e4e4e7",
                "editor.lineHighlightBackground": "#17171760",
                "editorCursor.foreground": "#f48c06",
                "editorLineNumber.foreground": "#3f3f46",
                "editorLineNumber.activeForeground": "#f48c06",
                "editor.selectionBackground": "#f48c0625",
                "editorScrollbar.slider.background": "#27272a40",
                "editorScrollbar.slider.hoverBackground": "#27272a80",
                "editorScrollbar.slider.activeBackground": "#f48c0640"
              }
            });
          }}
        />
      </div>
    </motion.div>
  );
}

export default Editor;