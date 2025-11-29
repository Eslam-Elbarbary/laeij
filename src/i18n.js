import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

// قراءة اللغة المحفوظة من localStorage أو استخدام اللغة الافتراضية
const savedLanguage = localStorage.getItem("lang") || "ar";

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        ar: { translation: ar },
    },
    lng: savedLanguage, // استخدام اللغة المحفوظة
    fallbackLng: "ar",
    interpolation: { escapeValue: false },
});

// 🔥 إضافة الكود اللي يغيّر اتجاه الصفحة بناءً على اللغة
const handleDirection = (lng) => {
    if (lng === "ar") {
        document.documentElement.dir = "rtl"; // العربية من اليمين لليسار
        document.documentElement.lang = "ar";
    } else {
        document.documentElement.dir = "ltr"; // الإنجليزية من اليسار لليمين
        document.documentElement.lang = "en";
    }
};

// تنفيذ عند تحميل الصفحة أول مرة
handleDirection(i18n.language);

// تنفيذ كل مرة تتغير اللغة
i18n.on("languageChanged", (lng) => {
    handleDirection(lng);
    localStorage.setItem("lang", lng); // حفظ اللغة في localStorage
});

export default i18n;