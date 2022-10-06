const express = require("express");
const router = express.Router();
const { validate } = require("../utils/session-utils.js");

const Candidate = require("../models/candidates.model.js");
const GoogleAPI = require("../utils/google-api-utils.js");

//router.use(validate);

router.post("/candidates", validate, async (req, res, next) => {
    const user = req.body;
    const _candidates = await Candidate.find({ user: user.username }, "candidateName").exec();
    let Candidates = [];
    _candidates.map(
        (_candidate, index) => {
            Candidates.push(_candidate.candidateName);
        }
    )
    res.json(Candidates);
});

router.post("/submit", validate, async (req, res, next) => {

    try {
        let candidate = req.body;
        let currentCandidate = await Candidate.findOne({ candidateName: candidate.candidateName, user: candidate.user }).exec();

        if (currentCandidate == null) {
            currentCandidate = await Candidate.create(candidate);
        }

        // Parse scores 
        let score = 0;
        const items = candidate.item;
        for (let i = 0; i < items.length; i++) {
            switch (items[i]) {
                case "首次見面":
                    score += 10;
                    break;
                case "Networking":
                    score += 10;
                    break;
                case "已報名考試":
                    score += 20;
                    break;
                case "上掛牌堂":
                    score += 20;
                    break;
                case "已經有牌":
                    score += 5;
                    break;
                default:
                    console.log("Item not found");
            }
        }
        if (items.includes("完成")) {
            candidate.score = 0;
            currentCandidate.mark = 0;
        } else {
            candidate.score = score;
            currentCandidate.mark += score;
        }

        // Parse next date
        const currentDate = new Date(candidate.date);
        const daysAfter = parseInt(candidate.nextDate);
        const nextDate = currentDate.setDate(currentDate.getDate() + daysAfter);
        candidate.nextDate = new Date(nextDate);


        Candidate.findOneAndUpdate(
            { candidateName: candidate.candidateName },
            { $push: { interviews: candidate }, mark: currentCandidate.mark },
            function (_error, isSuccess) {
                if (_error) console.log(_error)
                else {
                    res.json({
                        status: "success",
                        message: isSuccess.candidateName + " has been updated."
                    });
                }
            }
        )

        // Add event to Google Calendar
        const isConnected = await GoogleAPI.isConnectedToGAPI(candidate.user);
        if (isConnected) {
            GoogleAPI.ExecuteGoogleAPI(candidate.user, function (auth) {
                GoogleAPI.createInterview(candidate, auth);
            });
        }
    } catch {
        console.error(`Error in ${req.path}`)
        res.json({
            status: "error",
            message: "An error has occured"
        })
    }
});

router.post("/interviewlist", validate, (req, res) => {
    const user = req.body;
    Candidate.find({ user: user.username }, function (error, allCandidates) {
        if (error) {
            console.log(error);
        }
        res.json(allCandidates);
    });
});

router.delete("/deletecandidates", validate, function (req, res) {
    try {
        const candidateList = req.body;
        let deleteCount = 0;
        candidateList.map((candidate, index) => {
            Candidate.deleteOne({ candidateID: candidate }, function (error, deletedCandidate) {
                if (!error) {
                    deleteCount++;
                }
                else {
                    console.log(error);
                    return (error);
                }
            })
        })
        res.json({
            status: "success",
            deleteCount: deleteCount
        })
    } catch {
        console.error(`Error in ${req.path}`)
        res.json({
            status: "error",
            message: "An error has occured"
        })
    }
});

router.delete("/deleteinterview", validate, async function (req, res, next) {
    try {
        const targetMeeting = req.body;
        const _candidate = await Candidate.findOne({ candidateID: targetMeeting.candidateID }).exec();
        const _candidate_interview = _candidate.interviews.id(targetMeeting.target);
        let newMark = _candidate.mark - _candidate_interview.score;
        if (newMark <= 0) { newMark = 0 };
        Candidate.findOneAndUpdate(
            { candidateID: targetMeeting.candidateID },
            { $pull: { interviews: _candidate_interview }, mark: newMark },
            function (_error, isSuccess) {
                if (!_error) {
                    res.json({
                        status: "success",
                        message: isSuccess.candidateName + " has been updated."
                    })
                }
                else { console.log(_error) }
            }
        )
    } catch {
        console.error(`Error in ${req.path}`)
        res.json({
            status: "error",
            message: "An error has occured"
        })
    }
});

router.post("/changename", async function (req, res, next) {
    const user = JSON.parse(req.body.user);
    const candidate = req.body.candidate;
    Candidate.findOne({ candidateName: candidate.candidateNewName, user: user.username}, function(error, foundCandidate){
        if (!error){
            if (foundCandidate == null) {
                Candidate.findOneAndUpdate(
                    { candidateID: candidate.candidateID },
                    { $set: { candidateName: candidate.candidateNewName } },
                    function (error, success) {
                        if (!error) {
                            res.json({
                                status: "success",
                                message: success.candidateName + " has been updated."
                            })
                        }
                        else {
                            console.log(error);
                            return (error);
                        }
                    }
                )
            } else {
                res.json({
                    status: "failed",
                    message: "CandidateName already exists."
                });
            }
        } else {
            console.log(error);
        }
    })
})

module.exports = router;
