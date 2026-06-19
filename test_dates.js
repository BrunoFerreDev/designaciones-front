const getDayOfWeekLocal = (fechaStr) => {
  if (!fechaStr) return -1;
  const dateStr = String(fechaStr);
  const datePart = dateStr.includes("T") 
    ? dateStr.split("T")[0] 
    : dateStr.includes(" ") 
      ? dateStr.split(" ")[0] 
      : dateStr;
  const separator = datePart.includes("-") ? "-" : datePart.includes("/") ? "/" : "";
  if (separator) {
    const parts = datePart.split(separator).map(Number);
    if (parts.length === 3) {
      let yyyy, mm, dd;
      if (parts[0] > 1000) {
        [yyyy, mm, dd] = parts;
      } else {
        [dd, mm, yyyy] = parts;
      }
      const dateObj = new Date(yyyy, mm - 1, dd);
      return dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    }
  }
  return -1;
};

console.log("2026-06-13 (Saturday):", getDayOfWeekLocal("2026-06-13"));
console.log("2026-06-14 (Sunday):", getDayOfWeekLocal("2026-06-14"));
console.log("2026-06-20 (Saturday):", getDayOfWeekLocal("2026-06-20"));
console.log("2026-06-21 (Sunday):", getDayOfWeekLocal("2026-06-21"));
