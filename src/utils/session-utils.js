const mongoose = require("mongoose");

module.exports.validate = async function Validate(req, res, next){
   
	if (req.session.user){
        next()
    }else{
		const Session = mongoose.connection.db.collection("sessions");
		const sessionItem = await Session.find({ _id: req.session.id }).toArray();
		if (sessionItem.length > 0) {
			const session = JSON.parse(sessionItem[0].session);
			if (session.user != undefined){
				req.session.user=session.user
				next();
			} else {
				res.send("Session Expired. Please Login Again.")
			}
		} else {
			res.send("Session Expired. Please Login Again.")
		}
	}
}
