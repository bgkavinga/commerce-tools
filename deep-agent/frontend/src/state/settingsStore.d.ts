import { ProvidersResponse } from '../api/types.js';
export interface Settings {
    activeProviderKey: string;
    overridesByProvider: Record<string, Record<string, string>>;
}
export declare function useSettingsStore(): {
    providers: ProvidersResponse;
    setProviders: import("react").Dispatch<import("react").SetStateAction<ProvidersResponse>>;
    settings: Settings;
    setActiveProvider: (key: string) => void;
    setOverride: (providerKey: string, field: string, value: string) => void;
    getOverrides: (providerKey: string) => Record<string, string>;
};
