import portraits from "./portraits.json";
import governmentData from "./government.json";
import { governmentForYear, primaryGovernmentPerson } from "./government.js";
import leadership from "./leadership.json";

const translations = {
  fa: {
    title: "قیمت سالانه دلار در ایران",
    introduction:
      "من همیشه مشکل این که دلار ۲۰ هزار تومانی برای چه موقعی بوده رو داشتم. یکبار برای همیشه گفتم یک چیزی دم دستم باشه که نیاز نباشه سرچ کنم همش. این سایت رو درست کردم.",
    year: "سال",
    government: "دولت",
    minimum: "کمترین",
    maximum: "بیشترین",
    multiplier: "نسبت بیشترین به کمترین قیمت در این سال",
    unit: "تومان",
    conversion: "ارزش دلاری",
    amount: "مبلغ به دلار",
    coverage: "آخرین داده:",
    daysAgo: "روز پیش",
    dayAgo: "روز پیش",
    source: "منبع داده:",
    createdWith: "ساخته شده با علاقه و درد توسط",
    createdWhen: "در یک بعدازظهر مهر ۱۴۰۵",
    light: "تم روشن",
    dark: "تم تاریک",
    loading: "در حال دریافت داده‌ها…",
    error: "دریافت داده‌ها ناموفق بود.",
    more: "بیشتر",
    close: "بستن",
    governmentTree: "ساختار دولت در سال",
    cabinet: "هیئت دولت",
    officeholdersNote: "افرادی که در بخشی از این سال خدمت کرده‌اند. نام‌های متعدد نشان‌دهنده تغییر مسئول هستند؛ همه هم‌زمان در سمت نبوده‌اند.",
    historicalSource: "منبع",
    imageSources: "منبع تصاویر",
    imageNote: "پرتره‌ها با هوش مصنوعی و بر اساس عکس‌های ویکی‌مدیا کامانز بازطراحی شده‌اند. منابع عکس‌های اصلی:",
    publicDomain: "مالکیت عمومی",
    unknownAuthor: "پدیدآورنده نامشخص",
    acting: "سرپرست",
    yearEvents: "تغییرات این سال",
    portraitRule: "تصویر جدول مربوط به فردی است که در این سال بیشترین مدت مسئولیت را داشته است.",
    centralBank: "بانک مرکزی",
    president: "رئیس‌جمهور",
    primeMinister: "نخست‌وزیر",
    termsAndSources: "دوره مسئولیت و منابع",
    otherLeaders: "دیگر مسئولان این سال",
    personHint: "برای دیدن جزئیات، روی نام هر فرد بزنید.",
  },
  en: {
    title: "Yearly dollar prices in Iran",
    introduction:
      "I always had trouble remembering when the dollar was 20,000 tomans. Once and for all, I wanted something handy so I wouldn't have to keep searching. So I made this website.",
    year: "Year",
    government: "Government",
    minimum: "Minimum",
    maximum: "Maximum",
    multiplier: "Highest / lowest price this year",
    unit: "toman",
    conversion: "Dollar value",
    amount: "Amount in dollars",
    coverage: "Latest observation:",
    daysAgo: "days ago",
    dayAgo: "day ago",
    source: "Data sources:",
    createdWith: "Made with passion and pain by",
    createdWhen: "on an afternoon in Mehr 1405",
    light: "Light theme",
    dark: "Dark theme",
    loading: "Loading data…",
    error: "Could not load data. Please reload.",
    more: "More",
    close: "Close",
    governmentTree: "Government in",
    cabinet: "Cabinet",
    officeholdersNote: "People who served during part of this year. Multiple names indicate changes in office; they did not all serve simultaneously.",
    historicalSource: "Source",
    imageSources: "Portrait sources",
    imageNote: "AI-generated illustrated portraits based on Wikimedia Commons photographs. Original photo sources:",
    publicDomain: "Public domain",
    unknownAuthor: "Unknown author",
    acting: "Acting",
    yearEvents: "Changes this year",
    portraitRule: "The table portrait represents the leader who served longest during this year.",
    centralBank: "Central Bank",
    president: "President",
    primeMinister: "Prime Minister",
    termsAndSources: "Terms and sources",
    otherLeaders: "Other leaders this year",
    personHint: "Select a name to view their details.",
  },
};
const numberFormatters = new Map();
const numberFormatter = (locale, options) => {
  const key = locale + JSON.stringify(options);
  if (!numberFormatters.has(key)) numberFormatters.set(key, new Intl.NumberFormat(locale, options));
  return numberFormatters.get(key);
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
    governmentYear: null,
    selectedGovernmentPerson: null,
    currentDate: new Date(),
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
      if (sortParameters.get("credits") === "1") this.$nextTick(() => this.$refs.creditsDialog.showModal());
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
        this.currentDate = new Date();
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
    portrait(person) {
      return portraits[person.en]?.src;
    },
    primaryPerson(row) {
      return primaryGovernmentPerson(row, leadership.terms);
    },
    get governmentEvent() {
      return leadership.events[this.governmentYear] || null;
    },
    get portraitCredits() {
      return Object.entries(portraits).map(([en, credit]) => ({
        ...credit,
        en,
        fa: this.data?.years.flatMap(row => row.government).find(person => person.en === en)?.fa || en,
      }));
    },
    get governmentTree() {
      if (this.governmentYear === null) return [];
      return governmentForYear(this.governmentYear, governmentData.records).map(node => ({
        ...node,
        label: this.lang === "fa" ? node.role : governmentData.roles[node.role],
      }));
    },
    get governmentLeaders() {
      return this.governmentTree.filter(node => ["رئیس‌جمهور", "نخست‌وزیر", "معاون اول"].includes(node.role));
    },
    get governmentMinisters() {
      return this.governmentTree.filter(node => !["رئیس‌جمهور", "نخست‌وزیر", "رئیس کل بانک مرکزی"].includes(node.role))
        .sort((a, b) => {
          const priority = role => role === "وزیر امور اقتصادی و دارایی" ? 0 : role === "رئیس کل بانک مرکزی" ? 1 : 2;
          return priority(a.role) - priority(b.role) || a.label.localeCompare(b.label, this.locale);
        });
    },
    get centralBankTree() {
      return this.governmentTree.find(node => node.role === "رئیس کل بانک مرکزی") || null;
    },
    get governmentPrimaryLeader() {
      const row = this.data?.years.find(row => row.year === this.governmentYear);
      return row ? this.primaryPerson(row) : null;
    },
    selectGovernmentPerson(person) {
      this.selectedGovernmentPerson = { ...person };
    },
    get selectedPersonRole() {
      const role = this.selectedGovernmentPerson?.role;
      return role ? (this.lang === "fa" ? role : governmentData.roles[role]) : "";
    },
    showGovernment(row) {
      this.governmentYear = row.year;
      const primary = this.primaryPerson(row);
      const leaders = this.governmentLeaders.flatMap(node => node.members);
      const normalize = name => name.replace(/ \(.+\)/, "");
      const person = leaders.find(person => normalize(person.en) === normalize(primary.en)) || leaders[0] || this.centralBankTree?.members[0];
      this.selectedGovernmentPerson = person ? { ...person } : null;
      this.$refs.governmentDialog.showModal();
    },
    formatTermDate(value) {
      if (this.lang === "fa") return value;
      const words = {
        "فروردین": "Farvardin", "اردیبهشت": "Ordibehesht", "خرداد": "Khordad",
        "تیر": "Tir", "مرداد": "Mordad", "شهریور": "Shahrivar", "مهر": "Mehr",
        "آبان": "Aban", "آذر": "Azar", "دی": "Dey", "بهمن": "Bahman", "اسفند": "Esfand",
        "بهار": "Spring", "تابستان": "Summer", "پاییز": "Autumn", "زمستان": "Winter",
        "در حال تصدی": "Present", "اکنون": "Present", "متصدی": "Present", "تاکنون": "Present",
      };
      let text = value.replace(/[۰-۹]/g, digit => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit));
      for (const [fa, en] of Object.entries(words)) text = text.replaceAll(fa, en);
      return text;
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
      return numberFormatter(this.locale, { useGrouping: false }).format(
        value,
      );
    },
    tomanValue(price) {
      const amount = Number(this.dollarAmount);
      if (!Number.isFinite(amount) || amount < 0 || !price || price <= 0)
        return "—";
      return numberFormatter(this.locale, {
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
        : numberFormatter(this.locale, {
            maximumFractionDigits: 0,
          }).format(value);
    },
    priceMultiplier(row) {
      if (
        !Number.isFinite(row.minimum) ||
        !Number.isFinite(row.maximum) ||
        row.minimum <= 0 ||
        row.maximum < row.minimum
      )
        return "—";
      return (
        "(" + numberFormatter(this.locale, {
          useGrouping: false,
          maximumFractionDigits: 2,
        }).format(row.maximum / row.minimum) + "×)"
      );
    },
    daysAgo(value, now = this.currentDate) {
      const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Tehran", year: "numeric", month: "2-digit", day: "2-digit",
      }).formatToParts(now).map(part => [part.type, part.value]));
      const today = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
      const observed = Date.parse(value + "T00:00:00Z");
      if (!Number.isFinite(observed)) return "—";
      const days = Math.max(0, Math.round((today - observed) / 86400000));
      return numberFormatter(this.locale, { useGrouping: false }).format(days) + " " + (days === 1 ? this.t.dayAgo : this.t.daysAgo);
    },
    formatDate(value) {
      return new Intl.DateTimeFormat(this.locale + "-u-ca-persian", {
        numberingSystem: this.lang === "fa" ? "arabext" : "latn",
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
