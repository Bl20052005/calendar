const getHourAndMinutes = (hour, minute, isAllDay = false) => {

    if(isAllDay) {
        return "All Day";
    }

    let returnStr = "";

    let condensedHour = ((hour + 11) % 12 + 1);
    
    if(minute < 10) minute = "0" + minute;

    if(minute === "00") returnStr += condensedHour;
    else returnStr += condensedHour + ":" + minute;

    if(hour % 24 > 11) {
        returnStr += "pm";
    } else {
        returnStr += "am";
    }

    return returnStr;
}

export default getHourAndMinutes;