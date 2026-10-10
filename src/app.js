const translations = {
  fa: {
    title: "قیمت سالانه دلار در ایران",
    year: "سال",
    government: "دولت",
    minimum: "کمترین",
    maximum: "بیشترین",
    unit: "تومان",
    coverage: "آخرین داده:",
    source: "منبع داده:",
    light: "تم روشن",
    dark: "تم تاریک",
    loading: "در حال دریافت داده‌ها…",
    error: "دریافت داده‌ها ناموفق بود.",
  },
  en: {
    title: "Yearly dollar prices in Iran",
    year: "Year",
    government: "Government",
    minimum: "Minimum",
    maximum: "Maximum",
    unit: "toman",
    coverage: "Latest observation:",
    source: "Data sources:",
    light: "Light theme",
    dark: "Dark theme",
    loading: "Loading data…",
    error: "Could not load data. Please reload.",
  },
};
const preference = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const remember = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};
const sortParameters = new URLSearchParams(window.location.search);
const sortableColumns = ["year", "minimum", "maximum"];
const initialSort = sortParameters.get("sort");

document.addEventListener("alpine:init", () =>
  Alpine.data("dollarTable", () => ({
    lang: preference("language") === "en" ? "en" : "fa",
    theme: preference("theme") === "dark" ? "dark" : "light",
    data: null,
    loading: true,
    error: false,
    sortKey: sortableColumns.includes(initialSort) ? initialSort : "year",
    ascending: sortParameters.get("order") === "asc",
    columns: [
      { key: "year" },
      { key: "government" },
      { key: "minimum", unit: true },
      { key: "maximum", unit: true },
    ],
    get t() {
      return translations[this.lang];
    },
    get locale() {
      return this.lang === "fa" ? "fa-IR" : "en-US";
    },
    async init() {
      this.syncPage();
      try {
        const response = await fetch("data.json");
        if (!response.ok) throw Error(response.status);
        this.data = await response.json();
      } catch {
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    syncPage() {
      document.documentElement.lang = this.lang;
      document.documentElement.dir = this.lang === "fa" ? "rtl" : "ltr";
      document.documentElement.dataset.theme = this.theme;
      document.title = this.t.title;
    },
    toggleLanguage() {
      this.lang = this.lang === "fa" ? "en" : "fa";
      remember("language", this.lang);
      this.syncPage();
    },
    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      remember("theme", this.theme);
      this.syncPage();
    },
    sortBy(key) {
      if (!sortableColumns.includes(key)) return;
      if (this.sortKey === key) this.ascending = !this.ascending;
      else {
        this.sortKey = key;
        this.ascending = false;
      }
      const url = new URL(window.location.href);
      url.searchParams.set("sort", this.sortKey);
      url.searchParams.set("order", this.ascending ? "asc" : "desc");
      window.history.replaceState(null, "", url);
    },
    get sortedRows() {
      if (!this.data) return [];
      const key = this.sortKey,
        direction = this.ascending ? 1 : -1;
      return [...this.data.years].sort((a, b) => {
        if (key === "government")
          return (
            direction *
              a.government
                .map((p) => p[this.lang])
                .join(" ")
                .localeCompare(
                  b.government.map((p) => p[this.lang]).join(" "),
                  this.locale,
                ) || b.year - a.year
          );
        if (a[key] === null && b[key] !== null) return 1;
        if (b[key] === null && a[key] !== null) return -1;
        return direction * ((a[key] ?? 0) - (b[key] ?? 0)) || b.year - a.year;
      });
    },
    formatYear(value) {
      return new Intl.NumberFormat(this.locale, { useGrouping: false }).format(
        value,
      );
    },
    formatPrice(value) {
      return value === null
        ? "—"
        : new Intl.NumberFormat(this.locale, {
            maximumFractionDigits: 0,
          }).format(value);
    },
    formatDate(value) {
      return new Intl.DateTimeFormat(this.locale + "-u-ca-persian", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(value + "T12:00:00Z"));
    },
  })),
);
