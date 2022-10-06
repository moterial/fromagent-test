const express = require("express");
const router = express.Router();
const { validate } = require("../utils/session-utils.js");

// Models 

const User = require("../models/users.model.js");
const Client = require("../models/clients.model.js");
const Candidate = require("../models/candidates.model.js");

// New Methods

const clientDashboard = require("../aggregates/dashboard.clients.js");
const candidateDashboard = require("../aggregates/dashboard.candidates.js");

//router.use(validate);

router.post("/todaytasks", validate, async function (req, res, next) {
    const user = req.body;
    const today = new Date();
    const reReminder = new Date();  
    reReminder.setDate(today.getDate() - 3);
    reReminder.setUTCHours(0,0,0,0);
    console.log(reReminder);
    // Fetch today meetings with clients 
    let clientReturnValue = [];
    const allClients = await Client.find({ user: user.username }).lean()
    for (let client of allClients) {
        if (client.meetings != undefined) {
            for (let meeting of client.meetings) {
                if (
                    // Condition for today tasks 
                    ((meeting.nextDate.getYear() == reReminder.getYear()) &&
                    (meeting.nextDate.getMonth() == reReminder.getMonth()) &&
                    (meeting.nextDate.getDate() == reReminder.getDate()))   ||
                    ((meeting.nextDate.getYear() == today.getYear()) &&
                    (meeting.nextDate.getMonth() == today.getMonth()) &&
                    (meeting.nextDate.getDate() == today.getDate()))  
                    

                ) {
                    clientReturnValue.push({
                        clientName: client.clientName,
                        meeting: meeting,
                        _id: client._id,
                        item: meeting.item,
                        categories: meeting.businessCategories,
                        note: meeting.note,
                        read: meeting.read,
                        caseID: meeting._id,
                        
                    });
                }
            }
        }
    }
    console.log(clientReturnValue);

    // Fetch today interviews with candidates
    let candidateReturnValue = [];
    const allCandidates = await Candidate.find({ user: user.username }).lean()
    for (let candidate of allCandidates) {
        if (candidate.interviews != undefined) {
            for (let interview of candidate.interviews) {
                if (
                    // Condition for today tasks 
                    ((interview.nextDate.getYear() == reReminder.getYear()) &&
                    (interview.nextDate.getMonth() == reReminder.getMonth()) &&
                    (interview.nextDate.getDate() == reReminder.getDate())) 
                    ||
                    ((interview.nextDate.getYear() == today.getYear()) &&
                    (interview.nextDate.getMonth() == today.getMonth()) &&
                    (interview.nextDate.getDate() == today.getDate()))
                ) {
                    candidateReturnValue.push({
                        candidateName: candidate.candidateName,
                        interview: interview
                    });
                }
            }
        }
    }

    let subManagerReturnValue = [];
    const subManagerReminder = await clientDashboard.getSubMangerReminder(user.username);
    // console.log(subManagerReminder);



    res.json({
        status: "success",
        clients: clientReturnValue,
        candidates: candidateReturnValue,
        subManagerReminder: subManagerReminder
    });
})




/*

Prototype Response

{
    status: "success",
    body: {
        currentProfit: number,
        targetProfit: number,
        self: {
            items: [n,n,n,n,n,n]
            MPF:
            Insurance:
            Investment:
        },
        selfA: {...},
        selfB: {...},
        submanagers: {...},
        chart: [Array]
    }
}


*/
/*
function calculateNumbers(Clients) {

    const currentYear = new Date();
    let self = {};
    let sumItems = 0;
    let MPF = 0;
    let insurance = 0;
    let investment = 0;
    let itemsCount = [0, 0, 0, 0, 0, 0];

    for (let client of Clients) {
        for (let meeting of client.meetings) {
            if (meeting.date.getYear() != currentYear.getYear()) continue;
            sumItems += meeting.item.length;
            for (let category of meeting.businessCategories) {
                if (meeting.item.includes("Done Deal")) {
                    switch (category) {
                        case "MPF":
                            MPF += meeting.profit;
                            break;
                        case "保險":
                            insurance += meeting.profit;
                            break;
                        case "投資":
                            investment += meeting.profit;
                            break;
                        default:
                            console.log("Item not found");
                    }
                }
            }
            for (let item of meeting.item) {
                switch (item) {
                    case "首次見面":
                        itemsCount[0]++;
                        break;
                    case "Fact Finding":
                        itemsCount[1]++;
                        break;
                    case "睇 Proposal":
                        itemsCount[2]++;
                        break;
                    case "Try Closing":
                        itemsCount[3]++;
                        break;
                    case "Networking":
                        itemsCount[4]++;
                        break;
                    case "Done Deal":
                        itemsCount[5]++;
                        break;
                    default:
                        console.log("Item ", item, " not found");
                }
            }
        }
    }
    itemsCount = itemsCount.map(function (item) { return (parseFloat(item / sumItems)); })

    return ({
        items: itemsCount,
        MPF: MPF,
        insurance: insurance,
        investment: investment
    });
}

async function findAllClients(username) {
    let allClients = [];
    const clients = await Client.find({ user: username }).lean();
    allClients = [...clients];
    const 𡃁 = await User.find({ parentUser: username }).lean();
    for (let i = 0; i < 𡃁.length; i++) {
        allClients = [...allClients, ...await findAllClients(𡃁[i].username)];
    }
    return allClients;
}

async function findDirectClients(username) {
    let allClients = [];
    let currentClients = [];
    const clients = await Client.find({ user: username }).lean();
    allClients = [...clients];
    const 𡃁 = await User.find({ parentUser: username }).lean();
    for (let i = 0; i < 𡃁.length; i++) {
        allClients = [...allClients, ...await Client.find({ user: 𡃁[i].username }).lean()]
    }
    return allClients;
}

async function findDirectClientsWithData(username) {
    let returnValue = [];
    let clients = [];
    const submanagers = await User.find({ parentUser: username }).lean();
    for (const submanager of submanagers) {
        clients = await Client.find({ user: submanager.username }).lean();
        returnValue = [...returnValue, {
            name: submanager.username,
            self: calculateNumbers(clients),
            team: calculateNumbers(await findAllClients(submanager.username))
        }];
    };
    return returnValue;
}

// Filter clients of the same month
const filteredMonthClients = (allClients) => {
    let temp = [];
    const today = new Date();
    for (let client of allClients) {
        temp.push({
            clientName: client.clientName,
            meetings: client.meetings.filter(meeting =>
            // Criteria for a meeting to be valid
            (
                (meeting.date.getYear() == today.getYear()) &&
                (meeting.date.getMonth() == today.getMonth())
            )
            )
        }
        )
    }
    return temp;
}

// Filter clients of the same year
const filteredYearClients = (allClients) => {
    let temp = [];
    const today = new Date();
    for (let client of allClients) {
        temp.push({
            clientName: client.clientName,
            meetings: client.meetings.filter(meeting =>
                // Criteria for a meeting to be valid
                meeting.date.getYear() == today.getYear()

            )
        }
        )
    }
    return temp;
}

async function getTopClients(filteredClients, numItems) {
    let unsortedMeetingList = [];

    // Calculate the scores of each client
    for (let client of filteredClients) {
        let score = 0;
        for (let meeting of client.meetings) {
            score += meeting.score;
        }
        unsortedMeetingList.push(
            {
                clientName: client.clientName,
                score: score
            }
        )
    }

    // Sort the clients with marks 
    const returnValue = unsortedMeetingList.sort(function (a, b) {
        return (
            b.score > a.score ? 1
                : b.score < a.score ? -1
                    : "0"
        );
    })
    return (returnValue.slice(0, numItems));
}

async function getTotalProfit(filteredClients) {
    let totalScore = 0;
    for (let client of filteredClients) {
        for (let meeting of client.meetings) {
            if (meeting.profit != undefined) {
                totalScore += meeting.profit;
            }
        }
    }
    return totalScore;
}*/

router.post("/profit", validate, async function (req, res, next) {
    const user = req.body.AuthState;
    const chartPeriod = req.body.period;

    // const [self, selfA, selfB, subManagers, chartData, profitSum] = await Promise.all([
    const self = await clientDashboard.selfProfit(user.username);
    const selfA = await clientDashboard.selfAndAllBelowProfit(user.username);
    const selfB = await clientDashboard.selfAndOneBelowProfit(user.username);
    const chartData = await clientDashboard.chart(user.username);
    const profitSum = await clientDashboard.totalProfit(user.username);
    const BarChartData = await clientDashboard.barChart(user.username, chartPeriod);
    const SalesCycle = await clientDashboard.salesCycleAverageTimeRange(user.username);
    const subManagerlist = await clientDashboard.getSubManger(user.username);
    
    res.json({
        status: "success",
        body: {
            self: self,
            selfA: selfA,
            selfB: selfB,
            chart: chartData,
            profit: profitSum,
            barChart: BarChartData,
            subManagerlist: subManagerlist,
            SalesCycle: SalesCycle
        }
    });
})


router.post("/submanagers", validate, async function (req, res, next) {
    const user = req.body;
    const subManagerlist = await clientDashboard.getSubManger(user.username);
    res.json({
        status: "success",
        body: {
            subManagers: subManagerlist
        }
    })
})

router.post("/barchart", validate, async function (req, res, next) {
    const user = req.body.AuthState;
    const chartPeriod = req.body.period;
    const BarChartData = await clientDashboard.barChart(user.username, chartPeriod);
    const SalesCycle = await clientDashboard.salesCycleAverageTimeRange(user.username);
    console.log(user.username);
    console.log(chartPeriod);
    console.log(SalesCycle);
    res.json({
        status: "success",
        body: {
            barChart: BarChartData,
            salesCycle: SalesCycle
        }
    })
})


router.post("/profitsubmanagers", validate, async function (req, res, next) {
    const user = req.body;
    
    const subManagers = await clientDashboard.subManagersSelfProfit(user.username);
    
    res.json({
        status: "success",
        body: {
            subManagers: subManagers
        }
    })
})

router.post("/profitsubmanagersteam", validate, async function (req, res, next) {
    const user = req.body;
    console.log(user);
    const subManagers = await clientDashboard.subManagersTeamProfit(user.subSubManagers);
    
    res.json({
        status: "success",
        body: {
            subManagers: subManagers
        }
    })
})


router.post("/recruitment", validate, async function (req, res, next) {
    const user = req.body;
    // const [self, selfA, selfB, subManagers, chartData, amountSum] = await Promise.all([
    const self = await candidateDashboard.selfAmount(user.username);
    const selfA = await candidateDashboard.selfAndAllBelowAmount(user.username);
    const selfB = await candidateDashboard.selfAndOneBelowAmount(user.username);
    const chartData = await candidateDashboard.chart(user.username);
    const amountSum = await candidateDashboard.totalAmount(user.username);
    const subManagerlist = await clientDashboard.getSubManger(user.username);
    console.log(amountSum);
   

    res.json({
        status: "success",
        body: {
            self: self,
            selfA: selfA,
            selfB: selfB,
            chart: chartData,
            recruitment: amountSum,
            subManagerlist: subManagerlist
        }
    });
})

router.post("/recruitmentsubmanagers", validate, async function (req, res, next) {
    const user = req.body;
    const subManagers = await candidateDashboard.subManagersIndividualAmount(user.username);
    console.log(subManagers);
    res.json({
        status: "success",
        body: {
            subManagers: subManagers
        }
    })
})


router.post("/recruitmentsubmanagersteam", validate, async function (req, res, next) {
    const user = req.body;
    console.log(user);
    const subManagers = await candidateDashboard.subManagersTeamAmount(user.subSubManagers);
    
    res.json({
        status: "success",
        body: {
            subManagers: subManagers
        }
    })
})

module.exports = router;
