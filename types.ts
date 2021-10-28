// The bindings supported by this plugin
export type Binding = "SUBLIME" | "NONE";

export interface PluginSettings {
  mode: Binding;
  clickEnhance: boolean;
}
