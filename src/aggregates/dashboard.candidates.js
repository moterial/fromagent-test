const Candidate = require("../models/candidates.model.js");
const User = require("../models/users.model.js");

const defaultValues = {
    "_id": { "username": "" },
    "items": [0, 0, 0, 0, 0, 0],
    "IR": 0,
    "NIR": 0,
    "BGA": 0
}

const calculateNumbersGroup = {
    _id: { username: "" },
    totalAmount: { $sum: "$interviews.profit" },
    1: { $sum: { $cond: [{ $in: ["首次見面", "$interviews.item"] }, 1, 0] } },
    2: { $sum: { $cond: [{ $in: ["Networking", "$interviews.item"] }, 1, 0] } },
    3: { $sum: { $cond: [{ $in: ["已報名考試", "$interviews.item"] }, 1, 0] } },
    4: { $sum: { $cond: [{ $in: ["上掛牌堂", "$interviews.item"] }, 1, 0] } },
    5: { $sum: { $cond: [{ $in: ["已經有牌", "$interviews.item"] }, 1, 0] } },
    6: { $sum: { $cond: [{ $in: ["完成", "$interviews.item"] }, 1, 0] } },
    numItems: { $sum: { $size: "$interviews.item" } },
    IR: { $sum: { $cond: [{ $in: ["IR", "$interviews.categories"] }, 1, 0] } },
    NIR: { $sum: { $cond: [{ $in: ["NIR", "$interviews.categories"] }, 1, 0] } },
    BGA: { $sum: { $cond: [{ $in: ["BGA", "$interviews.categories"] }, 1, 0] } },
}

async function calculateNumbers(userList) {
    let currentYear = new Date("1970-1-1");
    const dummy = new Date();
    currentYear.setYear(dummy.getFullYear());
    const result = await Candidate.aggregate()
        .match({ user: { $in: userList } })
        .project({ interviews: "$interviews" })
        .project({
            interviews: {
                $filter: {
                    "input": "$interviews",
                    "as": "interview",
                    "cond": { $gt: ["$$interview.date", currentYear] }
                }
            }
        })
        .unwind("interviews")
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
            IR: "$IR",
            NIR: "$NIR",
            BGA: "$BGA"
        })
    if (result.length == 0) { return ([defaultValues]) }
    else { return result; }
}

module.exports.todaytasks = function () {

}

module.exports.selfAmount = async function (username) {
    const result = await calculateNumbers([username]);
    return (result[0]);
}

module.exports.selfAndOneBelowAmount = async function (username) {
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

module.exports.selfAndAllBelowAmount = async function (username) {
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

// module.exports.subManagersIndividualAmount = async function (username) {

//     // Find all the direct sub-managers
//     const subManagersResults = await User.aggregate()
//         .graphLookup({
//             from: "users",
//             startWith: "username",
//             connectFromField: "username",
//             connectToField: "parentUser",
//             as: "subManagers",
//             maxDepth: 0
//         })
//         .match({ username: username })
//         .project({
//             subManagers: "$subManagers.username"
//         });
//     const subManagers = subManagersResults[0].subManagers;

//     // Calculate the values of the sub-managers
//     let subManagersValues = [];
//     for (let subManager of subManagers) {
//         temp = {}; // Initialize
//         // find all sub-sub-managers of submanager
//         const subSubManagersResults = await User.aggregate()
//             .graphLookup({
//                 from: "users",
//                 startWith: "username",
//                 connectFromField: "username",
//                 connectToField: "parentUser",
//                 as: "subSubManagers",
//             })
//             .match({ subManager })
//             .project({
//                 subSubManagers: "$subSubManagers.username"
//             });
//         let subSubManagers = [subManager];
//         if (subSubManagersResults[0] != undefined) {
//             subSubManagers.push(subSubManagersResults[0].subSubManagers);
//         }

//         temp.name = subManager;
//         const self = await calculateNumbers([subManager]);
//         const team = await calculateNumbers(subSubManagers);
//         temp.self = self[0];
//         temp.team = team[0];
//         subManagersValues.push(temp)
//     }
//     return (subManagersValues);
// }


module.exports.subManagersIndividualAmount = async function (username) {

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

    // Calculate the values of the sub-managers
    let subManagersValues = [];
    for (let subManager of subManagers) {
        temp = {}; // Initialize
        temp.name = subManager;
        const self = await calculateNumbers([subManager]);
        temp.self = self[0];
        subManagersValues.push(temp)
    }
    return (subManagersValues);
}


module.exports.subManagersTeamAmount = async function (usernamelist) {

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
        subManagersValues.push(temp)
    }
    return (subManagersValues);
}

/**
 * Calculates and sort the candidates with interviews greater than the refernce date
 * @param {string} username 
 * @param {Date} referneceDate 
 * @returns {Promise}
 */
async function CalculateChart(username, referneceDate) {
    const result = await Candidate.aggregate()
        .match({ user: username })
        .project({
            candidateName: "$candidateName",
            interviews: {
                $filter: {
                    "input": "$interviews",
                    "as": "interview",
                    "cond": { $gt: ["$$interview.date", referneceDate] }
                }
            }
        })
        .unwind("interviews")
        .group({
            _id: "$candidateName",
            score: { $sum: "$interviews.score" }
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

module.exports.totalAmount = async function (username) {
    let currentYear = new Date("1970-1-1");
    const dummy = new Date();
    currentYear.setYear(dummy.getFullYear());
    const result = await Candidate.aggregate()
        .match({ user: username })
        .project({
            candidateName: "$candidateName",
            interviews: {
                $filter: {
                    "input": "$interviews",
                    "as": "interview",
                    "cond": { $gt: ["$$interview.date", currentYear] }
                }
            }
        })
        .unwind("interviews")
        .group({
            _id: "$user",
            totalAmount: { $sum: { $cond: [{ $in: ["完成", "$interviews.item"] }, 1, 0] } }
        })
    if (result.length == 0) return 0;
    else return (result[0].totalAmount);
}


