require('dotenv').config()
const moogoose = require("mongoose");
var ALTAS_URL;

if (process.env.NODE_ENV === "production") {
    console.log("DB Production");
    ALTAS_URL = process.env.DB_STRING;
} else {
    console.log("DB Development");
    ALTAS_URL = process.env.ALTAS_DEVP_URL;
	
}
// const ALTAS_URL = process.env.ALTAS_DEVP_URL;

const connectDB = async () => {
    const connection = await moogoose.connect(ALTAS_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(
            () => {
                console.log("Connection Successful");
            }
        )
        .catch(
            (error) => {
                console.log("Error: ", error);
                return;
            }
        )
}
module.exports = connectDB;
