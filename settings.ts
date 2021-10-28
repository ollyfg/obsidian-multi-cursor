import { PluginSettingTab, Setting, App } from "obsidian";
import { PluginSettings } from "./types";
import MyPlugin from "./main";
import * as Commands from "./commands";

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

    // The click enhancer setting
    const clickSetting = new Setting(containerEl)
      .setName("Enhanced Alt-Click")
      .setDesc("Lets you Alt-Click on existing selections to de-select them.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.clickEnhance)
          .onChange(async (value) => {
            this.plugin.settings.clickEnhance = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
