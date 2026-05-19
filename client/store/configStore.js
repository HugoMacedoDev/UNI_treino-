import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * @typedef {Object} AppConfig
 * @property {string} VERSAO
 * @property {string} URL_API_NODE_SIEWS
 * @property {string} CHECKIN_ONLINE
 * @property {string} URL_API_FNRH
 * @property {string} URL_OAUTH_GOOGLE_GESTAO
 * @property {string} URL_GESTAO
 */

/**
 * @typedef {Object} Usuario
 * @property {string} admini
 * @property {string | null} matric
 * @property {string} nivusr
 * @property {string} tipusr
 * @property {string} userid
 */

/**
 * @typedef {Object} UserData
 * @property {string} area
 * @property {string} porta_app
 * @property {string} api_key
 * @property {string} email_atd
 * @property {string} email_com
 * @property {string} type
 * @property {string} language
 * @property {string} layout
 * @property {string} codorg
 * @property {string} nomorg
 * @property {string} sigorg
 * @property {string} ambient_obj
 * @property {string} access_key_id
 * @property {string} secret_access_key
 * @property {string} region
 * @property {string} bucket
 * @property {string} nivel
 * @property {string} tela_chk
 * @property {string} crianca_chk
 * @property {number} qtd_adult_chk
 * @property {number} qtd_dias_chk
 * @property {string} ass_digital
 * @property {number} audit_5s_meta
 * @property {string} ambiente
 * @property {string} situacao
 */

/**
 * @typedef {Object} ConfigState
 * @property {boolean} hydrated
 * @property {(v: boolean) => void} setHydrated
 * @property {AppConfig | null} config
 * @property {(config: AppConfig) => void} setConfig
 * @property {string | null} token
 * @property {(token: string | null) => void} setToken
 * @property {Usuario | null} usuario
 * @property {(data: Usuario) => void} setUsuario
 * @property {UserData | null} user
 * @property {string | null} user_info
 * @property {string | null} user_info_seg
 * @property {(data: {user?: UserData, user_info?: string, user_info_seg?: string}) => void} setUserData
 * @property {() => void} clearAll
 */

/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<ConfigState>>} */
export const useConfigStore = create()(
  persist(
    (set) => ({
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),

      config: null,
      setConfig: (config) => set({ config }),

      token: null,
      setToken: (token) => set({ token }),

      usuario: null,
      setUsuario: (usuario) => set({ usuario }),

      user: null,
      user_info: null,
      user_info_seg: null,

      setUserData: (data) =>
        set({
          user: data.user ?? null,
          user_info: data.user_info ?? null,
          user_info_seg: data.user_info_seg ?? null,
        }),

      clearAll: () => {
        set({
          token: null,
          usuario: null,
          user: null,
          user_info: null,
          user_info_seg: null,
        });

        useConfigStore.persist.clearStorage();
      },
    }),
    {
      name: "gestao-config",

      partialize: (state) => ({
        token: state.token,
        user: state.user,
        usuario: state.usuario,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
