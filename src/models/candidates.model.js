const mongoose = require("mongoose");

const candidate = new mongoose.Schema(
    {
        candidateID: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            auto: true,
            index: true
        },
        candidateName: {
            type: String,
            required: true
        },
        interviews: [
            {
                date: {
                    type: Date,
                    required: true
                },
                categories: {
                    type: [String],
                    required: true
                },
                item: {
                    type: [String],
                    required: true
                },
                note: String,
                profit: Number,
                nextDate: {
                    type: Date,
                    required: true
                },
                score: {
                    type: Number,
                    required: true
                }
            }
        ],
        
        user: {
            type: String,
            required: true
        },

        mark: {
            type: Number,
            default: 0,
            require: true
        }
    },
);

const candidateModel = mongoose.model("candidate", candidate);

module.exports = candidateModel;

