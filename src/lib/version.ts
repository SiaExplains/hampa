import pkg from "../../package.json";

// Single source for the app version shown in the footer and /api/health (09 §Versioning).
export const APP_VERSION: string = pkg.version;
