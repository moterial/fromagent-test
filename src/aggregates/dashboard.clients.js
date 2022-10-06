const Client = require("../models/clients.model.js");
const User = require("../models/users.model.js");

const defaultValues = {
    "_id": { "username": "" },
    "items": [0, 0, 0, 0, 0, 0],
    "MPF": 0,
    "insurance": 0,
    "investment": 0
}

/**
 * A grouped parameters for calculating items in aggregate group
 */

const calculateNumbersGroup = {
    _id: { username: "" },
    totalProfit: { $sum: "$meetings.profit" },
    1: { $sum: { $cond: [{ $in: ["首次見面", "$meetings.item"] }, 1, 0] } },
    2: { $sum: { $cond: [{ $in: ["Fact Finding", "$meetings.item"] }, 1, 0] } },
    3: { $sum: { $cond: [{ $in: ["睇 Proposal", "$meetings.item"] }, 1, 0] } },
    4: { $sum: { $cond: [{ $in: ["Try Closing", "$meetings.item"] }, 1, 0] } },
    5: { $sum: { $cond: [{ $in: ["Networking", "$meetings.item"] }, 1, 0] } },
    6: { $sum: { $cond: [{ $in: ["Done Deal", "$meetings.item"] }, 1, 0] } },
    numItems: { $sum: { $size: "$meetings.item" } },
    MPF: { $sum: { $cond: [{ $in: ["MPF", "$meetings.businessCategories"] }, "$meetings.profit", 0] } },
    insurance: { $sum: { $cond: [{ $in: ["保險", "$meetings.businessCategories"] }, "$meetings.profit", 0] } },
    investment: { $sum: { $cond: [{ $in: ["投資", "$meetings.businessCategories"] }, "$meetings.profit", 0] } },
}

/**
 * This function is dependent on calculateNumbersGroup
 * It returns the promise that contains a json of the items
 * @param {Array<string>} userList 
 * @returns {Promise}
 */

async function calculateNumbers(userList) {
    let currentYear = new Date("1970-1-1");
    const dummy = new Date();
    currentYear.setYear(dummy.getFullYear());
    const result = await Client.aggregate()
        .match({ user: { $in: userList } })
        .project({ meetings: "$meetings" })
        .project({
            meetings: {
                $filter: {
                    "input": "$meetings",
                    "as": "meeting",
                    "cond": { $gt: ["$$meeting.date", currentYear] }
                }
            }
        })
        .unwind("meetings")
        .group(calculateNumbersGroup)
        .project({
            items: [
                { $divide: ["$2", "$numItems"] },
                { $divide: ["$1", "$numItems"] },
                { $divide: ["$3", "$numItems"] },
                { $divide: ["$4", "$numItems"] },
                { $divide: ["$5", "$numItems"] },
                { $divide: ["$6", "$numItems"] },
            ],
            MPF: "$MPF",
            insurance: "$insurance",
            investment: "$investment"
        })
    if (result.length == 0) { return ([defaultValues]) }
    else { return result; }
}



module.exports.selfProfit = async function (username) {
    const result = await calculateNumbers([username]);
    return (result[0]);
}

module.exports.selfAndOneBelowProfit = async function (username) {
    const subManagersResults = await User.aggregate()
        .graphLookup({
            from: "users",
            startWith: "username",
            connectFromField: "username",
            connectToField: "parentUser",
            as: "subManagers",
            maxDepth: 0
        })
        .match({ username: username })
        .project({
            subManagers: "$subManagers.username"
        });
    const subManagers = [username, ...subManagersResults[0].subManagers];
    const result = await calculateNumbers(subManagers)
    return (result[0]);
}

module.exports.selfAndAllBelowProfit = async function (username) {
    const subManagersResults = await User.aggregate()
        .graphLookup({
            from: "users",
            startWith: "username",
            connectFromField: "username",
            connectToField: "parentUser",
            as: "subManagers"
        })
        .match({ username: username })
        .project({
            subManagers: "$subManagers.username"
        });
    const subManagers = [username, ...subManagersResults[0].subManagers];
    const result = await calculateNumbers(subManagers);
    return (result[0]);
}

module.exports.getSubManger = async function (username) {
    const subManagersResults = await User.aggregate()
        .graphLookup({
            from: "users",
            startWith: "username",
            connectFromField: "username",
            connectToField: "parentUser",
            as: "subManagers",
            maxDepth: 0
        })
        .match({ username: username })
        .project({
            subManagers: "$subManagers.username"
        }); 
        // console.log(subManagersResults);
    const subManagers = subManagersResults[0].subManagers;
    // console.log(subManagers);
    return (subManagers);
}

module.exports.getSubMangerReminder = async function (username) {
    const subManagers = await this.getSubManger(username);
    let data = [];
    let today = new Date();
    let tomorrow = new Date();
    today.setUTCHours(0, 0, 0, 0);
    tomorrow.setUTCHours(0, 0, 0, 0);
    tomorrow.setDate(today.getDate() + 1);
    // console.log(today);
    // console.log(tomorrow);
    for(let subManager of subManagers){
        const result = await Client.aggregate()
            .match({ user: subManager })
            .project({ 
                meetings: "$meetings",
                clientName: "$clientName",
                _id: "$_id"
                

            })
            .project({
                _id: "$_id",
                clientName: "$clientName",
                meetings: {
                    $filter: {
                        //the date is in today and before tomorrow
                        "input": "$meetings",
                        "as": "meeting",
                        "cond": { $and: [{ $gte: ["$$meeting.nextDate", today] }, { $lt: ["$$meeting.nextDate", tomorrow] }] }
                    }
                },
                
            })
            .unwind("meetings")
            .group({
                _id: "$_id",
                name:{$first:"$clientName"},
                // meetings: { $push: "$meetings" },
                item: { $first: "$meetings.item" },
                categories: { $first: "$meetings.businessCategories" },
                note: { $first: { $ifNull: ["$meetings.note", "N/A"] } },
                read: 
                { $first: { $ifNull: ["$meetings.read", "no"] } },
                caseID: { $first:"$meetings._id"},
            })
            
            if(result.length != 0){
                data.push(result[0]);
            }
            // console.log(result);
    }
    data.forEach((item) => {
        item.item = item.item[0];
        item.categories = item.categories[0];
    });
    console.log(data);
    return(data);
    
}
// module.exports.saveRead = async function (id) {
//     const result = await Client.updateOne(
//         { _id: id },
//         { $set: { "meetings.$.read": "yes" } }
//     );
//     return (result);

// }
module.exports.subManagersIndividualProfit = async function (username) {
    // Find all the direct sub-managers
    const subManagersResults = await User.aggregate()
        .graphLookup({
            from: "users",
            startWith: "username",
            connectFromField: "username",
            connectToField: "parentUser",
            as: "subManagers",
            maxDepth: 0
        })
        .match({ username: username })
        .project({
            subManagers: "$subManagers.username"
        });
    const subManagers = subManagersResults[0].subManagers;
    console.log(subManagersResults);

    // Calculate the values of the sub-managers
    let subManagersValues = [];
    for (let subManager of subManagers) {
        temp = {}; // Initialize
        // find all sub-sub-managers of submanager
        const subSubManagersResults = await User.aggregate()
            .graphLookup({
                from: "users",
                startWith: "username",
                connectFromField: "username",
                connectToField: "parentUser",
                as: "subSubManagers",
            })
            .match({ subManager })
            .project({
                subSubManagers: "$subSubManagers.username"
            });
        let subSubManagers = [subManager];
        if (subSubManagersResults[0] != undefined) {
            subSubManagers.push(subSubManagersResults[0].subSubManagers);
        }
        temp.name = subManager;
        const self = await calculateNumbers([subManager]);
        const team = await calculateNumbers(subSubManagers);
        temp.self = self[0];
        temp.team = team[0];
        subManagersValues.push(temp);
    }
    return (subManagersValues);
}

module.exports.subManagersTeamProfit = async function (usernamelist) {

    // Calculate the values of the sub-managers

    let subManagersValues = [];
    let subManagers = usernamelist;
    for (let subManager of subManagers) {
        temp = {}; // Initialize
        // find all sub-sub-managers of submanager
        const subSubManagersResults = await User.aggregate()
            .graphLookup({
                from: "users",
                startWith: "username",
                connectFromField: "username",
                connectToField: "parentUser",
                as: "subSubManagers",
            })
            .match({ subManager })
            .project({
                subSubManagers: "$subSubManagers.username"
            });
        let subSubManagers = [subManager];
        if (subSubManagersResults[0] != undefined) {
            subSubManagers.push(subSubManagersResults[0].subSubManagers);
        }
        temp.name = subManager;
        const team = await calculateNumbers(subSubManagers);
        temp.team = team[0];
        subManagersValues.push(temp);
    }
    return (subManagersValues);
}

module.exports.subManagersSelfProfit = async function (username) {
    // Find all the direct sub-managers
    const subManagersResults = await User.aggregate()
        .graphLookup({
            from: "users",
            startWith: "username",
            connectFromField: "username",
            connectToField: "parentUser",
            as: "subManagers",
            maxDepth: 0
        })
        .match({ username: username })
        .project({
            subManagers: "$subManagers.username"
        });
    const subManagers = subManagersResults[0].subManagers;
    console.log(subManagersResults);

    // Calculate the values of the sub-managers
    let subManagersValues = [];
    for (let subManager of subManagers) {
        temp = {}; // Initialize
        temp.name = subManager;
        const self = await calculateNumbers([subManager]);
        temp.self = self[0];
        subManagersValues.push(temp);
    }
    return (subManagersValues);
}
/**
 * Calculates and sort the clients with meetings greater than the refernce date
 * @param {string} username 
 * @param {Date} referneceDate 
 * @returns {Promise}
 */
async function CalculateChart(username, referneceDate) {
    const result = await Client.aggregate()
        .match({ user: username })
        .project({
            clientName: "$clientName",
            meetings: {
                $filter: {
                    "input": "$meetings",
                    "as": "meeting",
                    "cond": { $gt: ["$$meeting.date", referneceDate] }
                }
            }
        })
        .unwind("meetings")
        .group({
            _id: "$clientName",
            score: { $sum: "$meetings.score" }
        })
        .sort({
            score: -1
        })
        .limit(10)
    return (result);
}



module.exports.chart = async function (username) {
    let currentYear = new Date("1970-1-1");
    let currentMonth = new Date("1970-1-1");
    const dummy = new Date();
    currentYear.setYear(dummy.getFullYear());
	currentMonth.setYear(dummy.getFullYear());
    currentMonth.setMonth(dummy.getMonth());
    const Year = await CalculateChart(username, currentYear);
    const Month = await CalculateChart(username, currentMonth);
    return ({
        year: Year,
        month: Month
    });
}




async function CalculateBarChart(username, firstDay , lastDay , period) {
    let result;
    let data ={
        首次見面:0,
        FactFinding:0,
        睇Proposal:0,
        TryClosing: 0,
        Networking: 0,
        DoneDeal: 0,
    };


    result = await Client.aggregate()
    .match({ user: username })
    .project({
        clientName: "$clientName",
        meetings: {
            $filter: {
                "input": "$meetings",
                "as": "meeting",
                "cond": { $and: [{$gt: ["$$meeting.date", firstDay]},{$lt: ["$$meeting.date", lastDay]}] }
            }
        }
    })
    .unwind("meetings")
    .group({
        _id: "$clientName",


        "首次見面": { $sum: { $cond: [{ $in: ["首次見面", "$meetings.item"] }, 1, 0] } },
        "Fact Finding": { $sum: { $cond: [{ $in: ["Fact Finding", "$meetings.item"] }, 1, 0] } },
        "睇 Proposal": { $sum: { $cond: [{ $in: ["睇 Proposal", "$meetings.item"] }, 1, 0] } },
        "Try Closing": { $sum: { $cond: [{ $in: ["Try Closing", "$meetings.item"] }, 1, 0] } },
        "Networking": { $sum: { $cond: [{ $in: ["Networking", "$meetings.item"] }, 1, 0] } },
        "Done Deal": { $sum: { $cond: [{ $in: ["Done Deal", "$meetings.item"] }, 1, 0] } },
    })
           

    result.forEach(element => {
        data.首次見面 += element['首次見面'];
        data.FactFinding += element['Fact Finding'];
        data.睇Proposal += element['睇 Proposal'];
        data.TryClosing += element['Try Closing'];
        data.Networking += element['Networking'];
        data.DoneDeal+= element['Done Deal'];
        
    });



    return (data);
}

module.exports.salesCycleAverageTimeRange = async function (username) {
    
    console.log(username);
    let reult = await Client.aggregate()
    .match({ user: username })
    .project({
        clientName: "$clientName",
        meetings: "$meetings"
    })
    .unwind("meetings")
    .group({
        _id: "$clientName",
        "首次見面": { $min: { $cond: [{ $in: ["首次見面", "$meetings.item"] }, "$meetings.date", null] } },
        "Done Deal": { $max: { $cond: [{ $in: ["Done Deal", "$meetings.item"] }, "$meetings.date", null] } },
    })

    let total = 0;
    let count = 0;
    let averageTime = 0;
    reult.forEach(element => {
        if(element['首次見面'] != null && element['Done Deal'] != null){
           
            total += element['Done Deal'] - element['首次見面'];
            count++;
        }
    });
    if(total != 0){
        let average = total/count;
        let averageDay = Math.floor(average/(1000*60*60*24));
        let averageHour = Math.floor((average%(1000*60*60*24))/(1000*60*60));
        let averageMinute = Math.floor((average%(1000*60*60))/(1000*60));
        let averageSecond = Math.floor((average%(1000*60))/(1000));
        averageTime = averageDay + "天" + averageHour + "時" + averageMinute + "分" + averageSecond + "秒";

    }else{
        averageTime = "無";
    }
    
    return (averageTime);

}

module.exports.barChart = async function (username, period) {
    let currentYear = new Date("1970-1-1");
    let currentMonth = new Date("1970-1-1");
    const dummy = new Date();
    currentYear.setYear(dummy.getFullYear());
	currentMonth.setYear(dummy.getFullYear());
    currentMonth.setMonth(dummy.getMonth()+1);
    
    let data = [];
    // console.log(period);
    // console.log(username);
    if(period == "month"){
        for(let i=1;i<=currentMonth.getMonth();i++){
        
            let temp;
            let tempData = {};
            if(i<10){
                temp = '0'+i;
            }else{
                temp = i;
            }
            let chartName = currentYear.getFullYear() + "/" + temp;
            let firstDay = new Date(currentYear.getFullYear(), currentYear.getMonth(), 1);
            let lastDay = new Date(currentYear.getFullYear(), currentYear.getMonth() + 1, 0);
            tempData = await CalculateBarChart(username, firstDay, lastDay,period);
            // console.log(tempData);
            tempData.name = chartName;
            data.push(tempData);
            currentYear.setMonth(currentYear.getMonth()+1);
        }
    }
    else if(period == "week"){
        while(currentYear < dummy){
            let tempData = {};
            let firstDay = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate());
            let lastDay = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate()+7);
            tempData = await CalculateBarChart(username, firstDay, lastDay,period);
            // console.log(tempData);
            tempData.name = currentYear.getDate() + "/" + (currentYear.getMonth()+1) + "/" + currentYear.getFullYear();
            data.push(tempData);
            currentYear.setDate(currentYear.getDate()+7);
        }

    }
    else if(period == "season"){
        for(let i=1;i<=4;i++){
            let tempData = {};
            let firstDay = new Date(currentYear.getFullYear(), (i-1)*3, 1);
            let lastDay = new Date(currentYear.getFullYear(), i*3, 0);
            tempData = await CalculateBarChart(username, firstDay, lastDay,period);
            // console.log(tempData);
            tempData.name = currentYear.getFullYear() + "/Q" + i;
            data.push(tempData);
        }
        
    }

    return (data);
}

module.exports.totalProfit = async function (username) {
    let currentYear = new Date("1970-1-1");
    const dummy = new Date();
    currentYear.setYear(dummy.getFullYear());
    const result = await Client.aggregate()
        .match({ user: username })
        .project({
            clientName: "$clientName",
            meetings: {
                $filter: {
                    "input": "$meetings",
                    "as": "meeting",
                    "cond": { $gt: ["$$meeting.date", currentYear] }
                }
            }
        })
        .unwind("meetings")
        .group({
            _id: "$user",
            totalProfit: { $sum: "$meetings.profit" }
         })
    if (result.length == 0) return 0;
    else return (result[0].totalProfit);
}


