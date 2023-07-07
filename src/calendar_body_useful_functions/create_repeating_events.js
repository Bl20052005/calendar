const createEventsRepeated = (event, monthStart, monthEnd) => {
    const convertMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    const roundTime = (time) => {
        let potentialDST = new Date(time).getHours();
        if(potentialDST === 23) {
            return time + 3600000;
        } else if(potentialDST === 1) {
            return time - 3600000;
        }
        return time;
    }

    const getReturnedObj = (event, time1, time2) => {
        let curEvent = {...event};
        let curEventStart = new Date(time1);
        let curEventEnd = new Date(time2);
        let curEventStartStr = (curEventStart.getMonth() + 1 + " " + curEventStart.getDate() + " " + curEventStart.getFullYear());
        let curEventEndStr = (curEventEnd.getMonth() + 1 + " " + curEventEnd.getDate() + " " + curEventEnd.getFullYear());
        let curEventStartStrMonth = (convertMonths[curEventStart.getMonth()] + " " + curEventStart.getDate() + ", " + curEventStart.getFullYear());
        let curEventEndStrMonth = (convertMonths[curEventEnd.getMonth()] + " " + curEventEnd.getDate() + ", " + curEventEnd.getFullYear());
        let curDateOne = {"year": curEventStart.getFullYear(), "month": curEventStart.getMonth(), "day": curEventStart.getDate()};
        let curDateTwo = {"year": curEventEnd.getFullYear(), "month": curEventEnd.getMonth(), "day": curEventEnd.getDate()};
        let objNow = {"startDate" : curEventStartStr, "endDate" : curEventEndStr, "rawStartDate" : curEventStartStrMonth, "rawEndDate" : curEventEndStrMonth, "curDateOne" : curDateOne, "curDateTwo" : curDateTwo};
        objNow["startTime"] = (curEventStartStr + " " + new Date(curEvent.startTime).getHours() + ":" + new Date(curEvent.startTime).getMinutes())
        objNow["endTime"] = (curEventEndStr + " " + new Date(curEvent.endTime).getHours() + ":" + new Date(curEvent.endTime).getMinutes())
        return Object.assign(curEvent, objNow);
    }

    let returnedArr = [];

    let iterations = -1;
    let onEndDay = "none";
    let eventStartDate = new Date(event.startDate);
    let eventEndDate = new Date(event.endDate);
    let start = roundTime(eventStartDate.getTime());
    let startWeekday = eventStartDate.getDay();
    let weekdays = [...event.repeatSpecifics.weekdays].sort((a, b) => a - b);

    if(!isNaN(Date.parse(event.repeatEnding.onDay))) {
        onEndDay = event.repeatEnding.onDay.split('-');
        onEndDay = onEndDay[1] + " " + onEndDay[2] + " " + onEndDay[0];
    }

    if(weekdays.length === 0) {
        weekdays.push(startWeekday);
    }

    if(event.repeatEnding.afterIterations !== null) {
        iterations = event.repeatEnding.afterIterations;
    }

    let eventLength = roundTime(eventEndDate.getTime()) - roundTime(eventStartDate.getTime());

    if(roundTime(eventStartDate.getTime()) < monthStart - eventLength) start = monthStart - eventLength;

    let i = new Date(start);

    const addFunction = () => {
        let curTime = Math.round((i.getTime() - eventStartDate.getTime()) / 86400000);
        if(event.repeatSpecifics.day > 0) {
            if(curTime % event.repeatSpecifics.day === 0
            && (iterations === -1 || curTime / event.repeatSpecifics.day < iterations)) {
                returnedArr.push(getReturnedObj(event, roundTime(i.getTime()), roundTime(i.getTime() + eventLength)));
            }
        } else if(event.repeatSpecifics.week > 0) {
            let curNumDaysPassed = (curTime + startWeekday) % (event.repeatSpecifics.week * 7);
            let comparisonDate = Math.floor((curTime + startWeekday) / (event.repeatSpecifics.week * 7));
            let indexOfDay = weekdays.indexOf(curNumDaysPassed);
            if((indexOfDay !== -1 && (iterations === -1 || comparisonDate < iterations)) || i.getTime() === eventStartDate.getTime()) {
                returnedArr.push(getReturnedObj(event, roundTime(i.getTime()), roundTime(i.getTime() + eventLength)));
            }
        } else if(event.repeatSpecifics.month > 0) {
            let monthDifference = i.getMonth() - eventStartDate.getMonth();
            if(i.getFullYear() === eventStartDate.getFullYear()) monthDifference = i.getMonth() - eventStartDate.getMonth();
            else monthDifference = i.getFullYear() - eventStartDate.getFullYear() * 12 + i.getMonth();
            if(monthDifference % event.repeatSpecifics.month === 0 && i.getDate() === eventStartDate.getDate()
            && (iterations === -1 || monthDifference / event.repeatSpecifics.month < iterations)) {
                returnedArr.push(getReturnedObj(event, roundTime(i.getTime()), roundTime(i.getTime() + eventLength)));
            }
        } else if(event.repeatSpecifics.year > 0) {
            if((i.getFullYear() - eventStartDate.getFullYear()) % event.repeatSpecifics.year === 0 && 
            i.getMonth() === eventStartDate.getMonth() && i.getDate() === eventStartDate.getDate()
            && (iterations === -1 || (i.getFullYear() - eventStartDate.getFullYear()) / event.repeatSpecifics.year < iterations)) {
                returnedArr.push(getReturnedObj(event, roundTime(i.getTime()), roundTime(i.getTime() + eventLength)));
            }
        }
        i.setDate(i.getDate() + 1);
    }

    if(i.getTime() === monthEnd && (onEndDay === "none" || i.getTime() <= new Date(onEndDay).getTime())) {
        addFunction();
    }

    while(i.getTime() < monthEnd && (onEndDay === "none" || i.getTime() <= new Date(onEndDay).getTime())) {
        addFunction();
    }

    return returnedArr;
}

export default createEventsRepeated;