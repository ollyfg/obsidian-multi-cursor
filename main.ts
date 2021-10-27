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
import { Binding, PluginSettings } from "./types";

const DEFAULT_SETTINGS: PluginSettings = {
  mode: "NONE",
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
    });

    // Listen for click events that might be multi-cursor clicks (Alt-click)
    this.registerDomEvent(
      document,
      "click",
      (evt: MouseEvent & { path?: HTMLElement[] }) => {
        const activeEditor = this.codeMirrors.find((cm) => cm.state.focused);
        const isMultiClick = evt.altKey && activeEditor;
        if (isMultiClick) {
          console.log("Multi click!", evt, activeEditor);
        }
      }
    );
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
