import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";

import { SettingsTab } from "./settings";
import { PluginSettings } from "./types";
import * as Commands from "./commands";

const DEFAULT_SETTINGS: PluginSettings = {
  clickEnhance: false,
};

export default class MyPlugin extends Plugin {
  settings: PluginSettings;
  codeMirrors: CodeMirror.Editor[] = [];

  async onload() {
    await this.loadSettings();

    // This adds a settings tab so the user can configure key bindings
    this.addSettingTab(new SettingsTab(this.app, this));

    // Get an instance of the underlying editors (CodeMirror objects)
    this.registerCodeMirror((cm) => {
      this.codeMirrors.push(cm);

      // Listen for click events that might be multi-cursor clicks (Alt-click)
      cm.on("mousedown", this.onClick.bind(this));
    });

    // Add the keyboard commands
    this.addCommand({
      id: "select-next-occurance",
      name: "Select next occurance",
      editorCallback: (editor: any) => {
        const cm = editor.cm ? editor.cm : editor;
        Commands.selectNextOccurrence(cm);
      },
      hotkeys: [
        {
          modifiers: ["Ctrl"],
          key: "d",
        },
      ],
    });
    this.addCommand({
      id: "add-cursor-to-prev-line",
      name: "Add New Cursor to Previous Line",
      editorCallback: (editor: any) => {
        const cm = editor.cm ? editor.cm : editor;
        Commands.addCursorToPrevLine(cm);
      },
      hotkeys: [
        {
          modifiers: ["Ctrl", "Alt"],
          key: "ArrowUp",
        },
      ],
    });
    this.addCommand({
      id: "add-cursor-to-next-line",
      name: "Add New Cursor to Next Line",
      editorCallback: (editor: any) => {
        const cm = editor.cm ? editor.cm : editor;
        Commands.addCursorToNextLine(cm);
      },
      hotkeys: [
        {
          modifiers: ["Ctrl", "Alt"],
          key: "ArrowDown",
        },
      ],
    });
  }

  // Handle multi-cursor clicks
  onClick(cm: CodeMirror.Editor, evt: MouseEvent) {
    const enabled = this.settings.clickEnhance;
    const isMultiClick = evt.altKey;
    if (isMultiClick && enabled) {
      Commands.toggleCursorAtClick(cm, evt);
    }
  }

  onunload() {
    this.codeMirrors.forEach((cm) => {
      cm.off("mousedown", this.onClick);
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
