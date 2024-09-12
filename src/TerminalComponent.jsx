import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef, useState } from "react";
import "./TerminalComponent.css"; // Import the custom CSS file

const TerminalComponent = () => {
  const terminalRef = useRef(null);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const currentInputRef = useRef(""); // Ref to hold the current input value

  useEffect(() => {
    const terminal = new Terminal({
      cursorBlink: true,
      theme: {
        background: "#1e1e1e",
        foreground: "#ffffff",
        cursor: "#00ff00",
      },
    });

    terminal.open(terminalRef.current);
    terminal.focus();

    const handleKey = (e) => {
      const { key, domEvent } = e;

      if (domEvent.key === "Enter") {
        // Execute command on Enter key press
        const command = currentInputRef.current.trim();
        if (command) {
          executeCommand(command);
          setCommandHistory((prev) => [...prev, command]);
          setHistoryIndex(-1); // Reset history index
          terminal.writeln(""); // New line
          currentInputRef.current = ""; // Clear input after execution
        }
      } else if (domEvent.key === "Backspace") {
        // Handle backspace
        if (currentInputRef.current.length > 0) {
          terminal.write("\b \b"); // Remove last character from terminal
          currentInputRef.current = currentInputRef.current.slice(0, -1); // Update current input
        }
      } else if (domEvent.key === "ArrowUp") {
        // Navigate through command history
        if (historyIndex < commandHistory.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          const newCommand =
            commandHistory[commandHistory.length - 1 - newIndex];
          currentInputRef.current = newCommand;
          terminal.clear(); // Clear terminal
          terminal.write(newCommand); // Write the command to terminal
        }
      } else if (domEvent.key === "ArrowDown") {
        // Navigate through command history
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          const newCommand =
            commandHistory[commandHistory.length - 1 - newIndex];
          currentInputRef.current = newCommand;
          terminal.clear(); // Clear terminal
          terminal.write(newCommand); // Write the command to terminal
        } else if (historyIndex === 0) {
          setHistoryIndex(-1); // Reset to no command
          currentInputRef.current = "";
          terminal.clear(); // Clear terminal
        }
      } else {
        // Write typed key to terminal
        terminal.write(key);
        currentInputRef.current += key; // Update current input
      }
    };

    terminal.onKey(handleKey);

    // Cleanup function
    return () => {
      terminal.dispose();
    };
  }, [commandHistory, historyIndex]);

  const executeCommand = async (command) => {
    const response = await fetch("/api/terminal/execute/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command }),
    });

    const data = await response.json();
    terminalRef.current?.writeln(
      data.output || `Error: ${data.error || "Unknown error"}`
    );
  };

  return <div className="terminal-container" ref={terminalRef}></div>;
};

export default TerminalComponent;
