import PersianDate from "persian-date";

export const formatDate = (date: Date, isRTL: boolean = false): string => {
  if (isRTL) {
    // Persian/Shamsi date
    const persianDate = new PersianDate(date);
    return persianDate.format("dddd DD MMMM YYYY");
  } else {
    // English date
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};

export const formatShortDate = (date: Date, isRTL: boolean = false): string => {
  if (isRTL) {
    // Persian/Shamsi date
    const persianDate = new PersianDate(date);
    return persianDate.format("DD MMMM YYYY");
  } else {
    // English date
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
  isRTL: boolean = false
): string => {
  if (isToday(dateString)) {
    return isRTL ? "امروز" : "Today";
  }
  if (isYesterday(dateString)) {
    return isRTL ? "دیروز" : "Yesterday";
  }
  return formatShortDate(new Date(dateString), isRTL);
};

