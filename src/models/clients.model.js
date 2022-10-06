const mongoose = require("mongoose");

const client = new mongoose.Schema(
    {
        clientID: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            auto: true,
            index: true
        },
        clientName: {
            type: String,
            required: true
        },
        meetings: [
            {
                date: {
                    type: Date,
                    required: true
                },
                businessCategories: {
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
                },
                read: String,

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

const clientModel = mongoose.model("client", client);

module.exports = clientModel;
