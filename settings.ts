import { PluginSettingTab, Setting, App } from "obsidian";
import { Binding, PluginSettings } from "./types";
import MyPlugin from "./main";
import * as Commands from "./commands";

/*
	This is where we define the binding definitions.

	Bindings look like:
	"Key": {
		name: "commandName",
		fn: () => { console.log("doing command") }
	}
*/
const BINDINGS: Record<
  Binding,
  { [x: string]: { name: string; fn: (cm: CodeMirror.Editor) => void } }
> = {
  NONE: {},
  SUBLIME: {
    "Ctrl-D": {
      name: "selectNextOccurrence",
      fn: Commands.selectNextOccurrence,
    },
    "Ctrl-Alt-Up": {
      name: "addCursorToPrevLine",
      fn: Commands.addCursorToPrevLine,
    },
    "Ctrl-Alt-Down": {
      name: "addCursorToNextLine",
      fn: Commands.addCursorToNextLine,
    },
  },
};

export class SettingsTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Settings for Extended Multi Cursor." });

    // The binding setting
    const modeSetting = new Setting(containerEl)
      .setName("Keybindings")
      .setDesc(
        "Which keybindings to use, when it comes to multi-cursor selection"
      )
      .addDropdown((input) => {
        // Add the options
        Object.keys(BINDINGS).forEach((value) => {
          // The name is just a title cased version of the value
          const name = value
            .split(" ")
            .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          input.addOption(value, name);
        });

        // Handle changes
        input.onChange(() => {
          const mode = input.getValue() as Binding;
          this.plugin.settings.mode = mode;
          this.display(); // Re-render
          // Apply the keybindings
          const keyMap = Object.fromEntries(
            Object.entries(BINDINGS[mode]).map(([key, command]) => {
              return [key, command.fn];
            })
          );
          this.plugin.codeMirrors.forEach((cm) => {
            cm.setOption("extraKeys", keyMap);
          });
        });

        // Select active value
        input.setValue(this.plugin.settings.mode);
      });

    const currentMode = this.plugin.settings.mode;
    const currentBindings = Object.entries(BINDINGS[currentMode]);
    if (currentBindings.length) {
      // List the current bindings
      containerEl.createEl("h2", { text: "Key Bindings" });
      containerEl.createEl("pre", {
        text: currentBindings
          .map(([key, command]) => `${key}: ${command.name}`)
          .join("\n"),
      });
    }
  }
}
