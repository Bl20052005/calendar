const filterEventsStartEnd = (event, start, end, currentUnwantedColors) => {
    let eventDateEnd = new Date(event.endDate);
    let eventDateStart = new Date(event.startDate);
    let startDate = new Date(start);
    let endDate = new Date(end);
    

    if(eventDateEnd.getTime() < startDate.getTime()) {
        return false;
    }

    if(eventDateStart.getTime() > endDate.getTime()) {
        return false;
    }

    return currentUnwantedColors.indexOf(event.color) === -1;
}

export default filterEventsStartEnd;