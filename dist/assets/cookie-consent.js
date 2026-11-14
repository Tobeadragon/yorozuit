(function () {
    const currentLanguage =
        document.documentElement.lang || "de";

    window.klaroConfig = {
        version: 1,

        elementID: "klaro",

        storageMethod: "cookie",

        storageName: "yorozu-cookie-consent",

        cookieExpiresAfterDays: 180,

        default: false,

        mustConsent: true,

        acceptAll: true,

        hideDeclineAll: false,

        hideLearnMore: false,

        noticeAsModal: false,

        lang: currentLanguage,

        translations: {

            zz: {
                privacyPolicyUrl: "/datenschutz/"
            },

            ja: {
                privacyPolicyUrl: "/datenschutz/",

                consentNotice: {
                    description:
                        "当サイトでは、サイトの基本機能に必要な技術と、今後導入する可能性のある追加サービスについて管理しています。任意のサービスについては、ご自身で選択できます。"
                },

                consentModal: {
                    title: "プライバシー設定",

                    description:
                        "当サイトで使用するサービスについて設定できます。必須機能は常に有効です。任意のサービスはいつでも変更できます。"
                },

                acceptAll: "すべて許可",

                acceptSelected: "選択した項目を許可",

                decline: "すべて拒否",

                close: "閉じる",

                save: "設定を保存",

                purposes: {
                    necessary: { title: "必須" },
                    analytics: { title: "アクセス解析" },
                    marketing: { title: "マーケティング" }
                },

                privacyPolicy: {
                    name: "プライバシーポリシー（ドイツ語のみ）",
                    text: "詳しくは{privacyPolicy}をご覧ください。"
                },

                purposeItem: {
                    service: "サービス",
                    services: "サービス"
                },

                service: {
                    disableAll: {
                        title: "すべてのサービスを有効・無効にする",
                        description: "このスイッチですべてのサービスを切り替えられます。"
                    },

                    required: {
                        title: "（常に必須）",
                        description: "このサービスは常に必要です。"
                    },

                    optOut: {
                        title: "（オプトアウト可能）",
                        description: "このサービスは初期状態で有効ですが、無効にできます。"
                    },

                    purpose: "目的",
                    purposes: "利用目的"
                },

                poweredBy: "KlaroによるCookie管理"
            },

            de: {
                privacyPolicyUrl: "/datenschutz/",

                consentNotice: {
                    description:
                        "Diese Website verwendet technisch notwendige Funktionen. Optionale Dienste können Sie selbst auswählen."
                },

                consentModal: {
                    title: "Datenschutzeinstellungen",

                    description:
                        "Hier können Sie festlegen, welche optionalen Dienste Sie zulassen möchten. Technisch notwendige Funktionen bleiben immer aktiv."
                },

                acceptAll: "Alle akzeptieren",

                acceptSelected: "Auswahl akzeptieren",

                decline: "Alle ablehnen",

                close: "Schließen",

                save: "Einstellungen speichern",

                purposes: {
                    necessary: { title: "Notwendig" },
                    analytics: { title: "Statistik" },
                    marketing: { title: "Marketing" }
                },

                privacyPolicy: {
                    name: "Datenschutzerklärung",
                    text: "Weitere Informationen finden Sie in unserer {privacyPolicy}."
                },

                purposeItem: {
                    service: "Dienst",
                    services: "Dienste"
                },

                service: {
                    disableAll: {
                        title: "Alle Dienste aktivieren oder deaktivieren",
                        description: "Mit diesem Schalter können Sie alle Dienste aktivieren oder deaktivieren."
                    },

                    required: {
                        title: "(immer erforderlich)",
                        description: "Dieser Dienst ist immer erforderlich."
                    },

                    optOut: {
                        title: "(Opt-out möglich)",
                        description: "Dieser Dienst ist standardmäßig aktiviert, kann aber deaktiviert werden."
                    },

                    purpose: "Zweck",
                    purposes: "Zwecke"
                },

                poweredBy: "Cookie-Verwaltung mit Klaro"
            },

            en: {
                privacyPolicyUrl: "/datenschutz/",

                consentNotice: {
                    description:
                        "This website uses technically necessary functions. You can choose whether to allow optional services."
                },

                consentModal: {
                    title: "Privacy Settings",

                    description:
                        "You can manage the optional services used on this website. Technically necessary functions are always enabled."
                },

                acceptAll: "Accept all",

                acceptSelected: "Accept selected",

                decline: "Reject all",

                close: "Close",

                save: "Save settings",

                purposes: {
                    necessary: { title: "Necessary" },
                    analytics: { title: "Analytics" },
                    marketing: { title: "Marketing" }
                },

                privacyPolicy: {
                    name: "Privacy Policy (German only)",
                    text: "For more information, please read our {privacyPolicy}."
                },

                purposeItem: {
                    service: "service",
                    services: "services"
                },

                service: {
                    disableAll: {
                        title: "Enable or disable all services",
                        description: "Use this switch to enable or disable all services."
                    },

                    required: {
                        title: "(always required)",
                        description: "This service is always required."
                    },

                    optOut: {
                        title: "(opt-out available)",
                        description: "This service is enabled by default but can be disabled."
                    },

                    purpose: "Purpose",
                    purposes: "Purposes"
                },

                poweredBy: "Cookie management powered by Klaro"
            }
        },

        services: [

            {
                name: "necessary",

                translations: {

                    ja: {

                        title: "必須機能",

                        description: "ウェブサイトの基本機能や安全な動作に必要な機能です。"

                    },

                    de: {

                        title: "Notwendige Funktionen",

                        description: "Diese Funktionen sind für den grundlegenden Betrieb und die Sicherheit der Website erforderlich."

                    },

                    en: {

                        title: "Necessary Functions",

                        description: "These functions are required for the basic operation and security of the website."

                    }

                },

                purposes: ["necessary"],

                required: true,

                default: true
            },

            {

                name: "analytics",

                translations: {
                    ja: {
                        title: "アクセス解析",
                        description: "ウェブサイトの利用状況を分析するサービスです。"
                    },
                    de: {
                        title: "Besucherstatistik",
                        description: "Dienste zur Analyse der Website-Nutzung."
                    },
                    en: {
                        title: "Analytics",
                        description: "Services used to analyze website usage."
                    }
                },

                purposes: ["analytics"],
                required: false,
                default: false
            },

            {
                name: "marketing",

                translations: {

                    ja: {

                        title: "マーケティング",

                        description: "広告やマーケティング活動に関連するサービスです。"

                    },

                    de: {

                        title: "Marketing",

                        description: "Dienste im Zusammenhang mit Werbung und Marketingaktivitäten."

                    },

                    en: {

                        title: "Marketing",

                        description: "Services related to advertising and marketing activities."

                    }

                },

                purposes: ["marketing"],

                required: false,

                default: false
            }
        ]
    };
    // Add language switcher to Klaro modal
    function addKlaroLanguageSwitcher() {
        const header = document.querySelector(
            ".klaro .cookie-modal .cm-modal .cm-header"
        );

        if (!header) return;

        // Prevent duplicate insertion
        if (header.querySelector(".yorozu-klaro-language-switch")) {
            return;
        }

        const switcher = document.createElement("div");

        switcher.className = "yorozu-klaro-language-switch";

        switcher.setAttribute(
            "aria-label",
            "Select language"
        );

        const languages = [
            { code: "ja", label: "日本語" },
            { code: "de", label: "DE" },
            { code: "en", label: "EN" }
        ];

        languages.forEach((language) => {
            // Reuse existing language URLs from the page
            const existingLink = document.querySelector(
                `.language-switch a[lang="${language.code}"]`
            );

            if (!existingLink) return;

            const link = document.createElement("a");

            link.href = existingLink.href;
            link.textContent = language.label;
            link.lang = language.code;
            link.hreflang = language.code;

            if (language.code === currentLanguage) {
                link.classList.add("is-active");
                link.setAttribute("aria-current", "page");
            }

            switcher.appendChild(link);
        });

        header.appendChild(switcher);
    }

    // Observe Klaro's dynamically generated modal
    const klaroObserver = new MutationObserver(() => {
        addKlaroLanguageSwitcher();
    });

    klaroObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Check once immediately
    addKlaroLanguageSwitcher();
})();