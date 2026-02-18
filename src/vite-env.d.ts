/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_SHEETS_CSV_URL?: string
    readonly GEMINI_API_KEY?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq: any;
}
