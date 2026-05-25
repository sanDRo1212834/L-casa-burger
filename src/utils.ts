export const getStoreStatus = () => {
    const brtDateString = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
    const brtDate = new Date(brtDateString);
    const day = brtDate.getDay();
    const time = brtDate.getHours() * 60 + brtDate.getMinutes();

    let isOpen = false;
    let scheduleText = "Segunda a Sexta: 18:00 às 23:10\nSábado e Domingo: 18:00 às 23:40";

    let nextOpenText = "abre hoje às 18h";

    if (day >= 1 && day <= 5) {
      // Monday to Friday
      if (time >= 18 * 60 && time <= 23 * 60 + 10) isOpen = true;
    } else if (day === 0 || day === 6) {
      // Saturday and Sunday
      if (time >= 18 * 60 && time <= 23 * 60 + 40) isOpen = true;
    }

    return { isOpen, scheduleText, nextOpenText };
};
