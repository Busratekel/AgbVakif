/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID?: string
  /** Yönetim paneli UI yolu (varsayılan /yonetim-agb7k2m) */
  readonly VITE_ADMIN_BASE_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
