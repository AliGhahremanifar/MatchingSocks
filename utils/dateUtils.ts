import PersianDate from "persian-date";

export const formatDate = (
  date: Date,
  isRTL: boolean = false,
  language: string = "en"
): string => {
  console.log("formatDate called with language:", language); // Debug log

  if (language === "fa") {
    // Persian/Shamsi date
    const persianDate = new PersianDate(date);
    return persianDate.format("dddd DD MMMM YYYY");
  } else {
    // English or Dutch date - use native JavaScript date formatting
    const locale = language === "nl" ? "nl-NL" : "en-US";
    console.log("Using locale:", locale); // Debug log
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    // Force English/Dutch formatting by explicitly setting the locale
    const result = new Intl.DateTimeFormat(locale, options).format(date);
    console.log("Formatted date result:", result); // Debug log
    return result;
  }
};

export const formatShortDate = (
  date: Date,
  isRTL: boolean = false,
  language: string = "en"
): string => {
  if (language === "fa") {
    // Persian/Shamsi date
    const persianDate = new PersianDate(date);
    return persianDate.format("DD MMMM YYYY");
  } else {
    // English or Dutch date - use native JavaScript date formatting
    const locale = language === "nl" ? "nl-NL" : "en-US";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
};

export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isYesterday = (dateString: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(dateString);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

export const getRelativeDate = (
  dateString: string,
  isRTL: boolean = false,
  language: string = "en"
): string => {
  if (isToday(dateString)) {
    if (language === "fa") return "امروز";
    if (language === "nl") return "Vandaag";
    return "Today";
  }
  if (isYesterday(dateString)) {
    if (language === "fa") return "دیروز";
    if (language === "nl") return "Gisteren";
    return "Yesterday";
  }
  return formatShortDate(new Date(dateString), isRTL, language);
};
