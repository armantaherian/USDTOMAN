const translations = {
  fa: {
    title: "قیمت سالانه دلار در ایران",
    introduction:
      "من همیشه مشکل این که دلار ۲۰ هزار تومانی برای چه موقعی بوده رو داشتم. یکبار برای همیشه گفتم یک چیزی دم دستم باشه که نیاز نباشه سرچ کنم همش. این سایت رو درست کردم.",
    year: "سال",
    government: "دولت",
    minimum: "کمترین",
    maximum: "بیشترین",
    unit: "تومان",
    conversion: "ارزش دلاری",
    amount: "مبلغ به دلار",
    coverage: "آخرین داده:",
    source: "منبع داده:",
    light: "تم روشن",
    dark: "تم تاریک",
    loading: "در حال دریافت داده‌ها…",
    error: "دریافت داده‌ها ناموفق بود.",
  },
  en: {
    title: "Yearly dollar prices in Iran",
    introduction:
      "I always had trouble remembering when the dollar was 20,000 tomans. Once and for all, I wanted something handy so I wouldn't have to keep searching. So I made this website.",
    year: "Year",
    government: "Government",
    minimum: "Minimum",
    maximum: "Maximum",
    unit: "toman",
    conversion: "Dollar value",
    amount: "Amount in dollars",
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
    dollarAmount: 100,
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
      await this.refreshData();
      this.onOnline = () => this.refreshData();
      this.onVisible = () => {
        if (document.visibilityState === "visible") this.refreshData();
      };
      window.addEventListener("online", this.onOnline);
      document.addEventListener("visibilitychange", this.onVisible);
      this.refreshTimer = setInterval(() => {
        if (document.visibilityState === "visible") this.refreshData();
      }, 60000);
    },
    destroy() {
      clearInterval(this.refreshTimer);
      window.removeEventListener("online", this.onOnline);
      document.removeEventListener("visibilitychange", this.onVisible);
    },
    async refreshData() {
      if (this.refreshing) return;
      this.refreshing = true;
      try {
        const response = await fetch("data.json", { cache: "no-store" });
        if (!response.ok) throw Error(response.status);
        const data = await response.json();
        if (!Array.isArray(data.years)) throw Error("Invalid data");
        if (JSON.stringify(data) !== JSON.stringify(this.data))
          this.data = data;
        this.error = false;
      } catch {
        this.error = !this.data;
      } finally {
        this.loading = false;
        this.refreshing = false;
      }
    },
    syncPage() {
      document.documentElement.lang = this.lang;
      document.documentElement.dir = this.lang === "fa" ? "rtl" : "ltr";
      document.documentElement.dataset.theme = this.theme;
      document.title =
        this.lang === "fa"
          ? "قیمت سالانه دلار در ایران؛ کمترین و بیشترین نرخ | USD / Toman"
          : "Yearly dollar prices in Iran: minimum and maximum | USD / Toman";
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
    governmentName(row) {
      return row.government
        .map((person) => person[this.lang])
        .join(this.lang === "fa" ? "، " : ", ");
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
      return new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(
        value,
      );
    },
    tomanValue(price) {
      const amount = Number(this.dollarAmount);
      if (!Number.isFinite(amount) || amount < 0 || !price || price <= 0)
        return "—";
      return new Intl.NumberFormat("fa-IR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
        .format(amount * price)
        .replace("٫", ".");
    },
    updateAmount(value) {
      const normalized = value
        .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
        .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))
        .replace(/[,٬\s]/g, "");
      if (/^\d*$/.test(normalized)) this.dollarAmount = Number(normalized);
    },
    formatPrice(value) {
      return value === null
        ? "—"
        : new Intl.NumberFormat("fa-IR", {
            maximumFractionDigits: 0,
          }).format(value);
    },
    formatDate(value) {
      return new Intl.DateTimeFormat(this.locale + "-u-ca-persian", {
        numberingSystem: "arabext",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(value + "T12:00:00Z"));
    },
  })),
);

if ("serviceWorker" in navigator) {
  const alreadyControlled = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (alreadyControlled && !reloading) {
      reloading = true;
      window.location.reload();
    }
  });
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("sw.js", {
        updateViaCache: "none",
      });
      const check = () => registration.update().catch(() => {});
      window.addEventListener("online", check);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") check();
      });
      setInterval(() => {
        if (document.visibilityState === "visible") check();
      }, 300000);
    } catch {
      // The website still works when installation is unavailable.
    }
  });
}
