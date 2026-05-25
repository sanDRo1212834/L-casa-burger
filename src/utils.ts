export const getStoreStatus = () => {
    const brtDateString = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
    const brtDate = new Date(brtDateString);
    const day = brtDate.getDay();
    const time = brtDate.getHours() * 60 + brtDate.getMinutes();

    let isOpen = false;
    let scheduleText = "Seg a Sex: 18:00 às 23:00 | Sáb e Dom: 18:00 às 23:30";

    if (day >= 1 && day <= 5) {
      if (time >= 18 * 60 && time <= 23 * 60) isOpen = true;
    } else {
      if (time >= 18 * 60 && time <= 23 * 60 + 30) isOpen = true;
    }

    return { isOpen, scheduleText };
};
