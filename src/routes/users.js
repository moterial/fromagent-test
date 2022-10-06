const express = require("express");
const router = express.Router();
const User = require("../models/users.model.js");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { validate } = require("../utils/session-utils.js");

router.post("/login", (req, res, next) => {
    const user = req.body.user;
    User.findOne({ username: user.username }, function (error, currentUser) {
        if (!error) {
            if (currentUser != null) {
                currentUser.Validate(user.password, function (_error, isCorrect) {
                    if (!_error) {
                        if (isCorrect) {
                            const tokenStatus = (currentUser.gapiToken.access_token != undefined);
                            const returnJson = {
                                username: currentUser.username,
                                permissionLevel: currentUser.permissionLevel,
                                profitTarget: currentUser.profitTarget,
                                recruitmentTarget: currentUser.recruitmentTarget,
                                token: tokenStatus
                            };
                            req.session.user = returnJson;
                            res.json({
                                status: "Correct Password",
                                user: returnJson
                            });
                        }
                        else res.json({
                            status: "Incorrect Password"
                        });
                    }
                    else {
                        console.log(error);
                        return (error);
                    }
                });
            } else {
                console.log("User not found");
                res.json({
                    status: "User not found"
                });
            }
        } else {
            console.log(error)
        }
    })
})

router.post("/adduser", validate, async (req, res, next) => {
    const user = req.body;
    User.findOne({ username: user.username }, function (error, foundUser) {
        if (!error) {
            if (foundUser != null) {
                res.json({ status: "failed", message: "Username already exists." })
                return;
            } else {
                User.findOne({ username: user.parentUser }, function (_error, _parentUser) {
                    if (!_error) {
                        if (user.parentUser == undefined || _parentUser != null) {
                            User.create(user, function (__error, _user) {
                                if (!__error) {
                                    res.json({ status: "success", message: "User " + _user.username + " has been created." });
                                }
                                else {
                                    console.log(__error);
                                    return (__error);
                                }
                            })
                        } else {
                            res.send({ status: "failed", message: "Parent User not found." });
                            return;
                        }
                    } else {
                        console.log(error);
                    }
                })

            }
        } else return (error);
    })
})


router.post("/forgetpwgetsecurity", (req, res) => {
    console.log(req.body);
    const user = req.body.AuthState.username;
    console.log(user);

    User.findOne({ username: user},"securityQuestion1 securityQuestion2", function (error, foundUser) {
        if (!error) {
            if (foundUser != null) {
                console.log(foundUser);
                res.json({
                    status: "success",
                    body: {
                        foundUser: foundUser
                    }
                });
            } else {
                res.json({ status: "failed", message: "User not found." })
                return;
            }
        } else {
            console.log(error);
            return (error);
        }
    })
})

router.post("/forgetpwcomparesecurity", (req, res) => {
    const user = req.body.AuthState.username;
    console.log(user);

    User.findOne({ username: user},"securityAnswer1 securityAnswer2", function (error, foundUser) {
        if (!error) {
            if (foundUser != null) {
                if(foundUser.securityAnswer1 == req.body.AuthState.securityAnswer1 && foundUser.securityAnswer2 == req.body.AuthState.securityAnswer2){
                    res.json({
                        status: "success"
                    });
                }else{
                    res.json({
                        status: "failed"
                    });
                }
            } else {
                res.json({ status: "failed", message: "User not found." })
                return;
            }
        } else {
            console.log(error);
            return (error);
        }
    })
})
router.post("/forgetpwchangepassword", (req, res) => {
    const user = req.body.AuthState.username;
    const password = req.body.AuthState.password;
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, function (err, hash) {
        if (!err) {
            User.findOneAndUpdate({ username: user }, { password: hash }, function (error, foundUser) {
                if (!error) {
                    if (foundUser != null) {
                        res.json({
                            status: "success"
                        });
                    } else {

                        res.json({ status: "failed", message: "User not found." })
                        return;
                    }
                } else {
                    console.log(error);
                    return (error);
                }
            })
        } else {
            console.log(err);
            return (err);
        }
    })
})

router.post("/getusers", validate, (req, res) => {
    const user = req.body;
    if (user.permissionLevel == 2) {
        User.find({}, "_id username permissionLevel parentUser", function (error, users) {
            if (!error) {
                res.json(users);
            } else {
                console.log(error);
                return (error);
            }
        });
    }
})

router.post("/getsecurity", validate, async (req, res) => {
    const user = req.body.AuthState.username;
    console.log(user);

    User.findOne({ username: user},"securityQuestion1 securityQuestion2", function (error, foundUser) {
        if (!error) {
            if (foundUser != null) {
                console.log(foundUser);
                res.json({
                    status: "success",
                    body: {
                        foundUser: foundUser
                    }
                });
            } else {
                res.json({ status: "failed", message: "User not found." })
                return;
            }
        } else {
            console.log(error);
            return (error);
        }
    })


})

router.post("/updatesecurity", validate, async (req, res) => {

    const user = req.body.AuthState.username;   
    const security = req.body.security;
    console.log(user);
    console.log(security);

    //insert security questions into user
    User.findOneAndUpdate(
        { username: user ,},
        { $set: security } ,
        {upsert: true},
        function (error, foundUser) {
            if (!error) {
                if (foundUser != null) {
                    console.log(foundUser);
                    res.json({
                        status: "success",
                        body: {
                            foundUser: foundUser
                        }
                    });
                } else {
                    res.json({ status: "failed", message: "User not found." })
                    return;
                }
            } else {
                console.log(error);
                return (error);
            }
        }
    );
    
    


})

router.post("/updateuser", validate, async (req, res, next) => {
    const user = req.body.user;
    User.updateOne({ username: user.username }, function (error, currentUser) {
        // Todos 
    });
})

router.delete("/deleteuser", validate, (req, res, next) => {
    const userList = req.body;
    let deleteCount = 0;
    userList.map((user, index) => {
        User.deleteOne({ username: user }, function (error, deletedUser) {
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
})

router.post("/changepassword", validate, async (req, res, next) => {
    const user = req.body;
    User.findOne({ username: user.username }, function (error, foundUser) {
        if (!error) {
            if (foundUser != null) {
                foundUser.Validate(user.oldPassword, function (_error, isCorrect) {
                    if (isCorrect) {
                        let updatedUser = new User(foundUser)
                        updatedUser.password = user.newPassword;
                        updatedUser.save();
                        res.json({
                            status: "Sucess",
                            message: "User " + updatedUser.username + " has been updated."
                        });
                    }
                    else {
                        res.json({
                            status: "Failed",
                            message: "Incorrect Old Password"
                        }
                        );
                    }
                })
            } else {
                res.json({
                    status: "Failed",
                    message: "User not found"
                })
            }
        } else {
            console.log(error);
            return (error);
        }
    }
    )
});

router.post("/changeotherspassword", validate, async (req, res, next) => {
    const user = req.body.user;
    const editUser = req.body.editUser;
    if (user.permissionLevel == 2) {
        User.findOne({ _id: editUser.userID }, function (error, foundUser) {
            if (!error) {
                if (!!foundUser) {
                    let updatedUser = new User(foundUser)
                    updatedUser.password = editUser.userNewPassword;
                    updatedUser.save();
                    res.json({
                        status: "Sucess",
                        message: "User " + updatedUser.username + " has been updated."
                    });
                } else {
                    res.json({
                        stauts: "Failed",
                        message: "User not found"
                    });
                }
            } else {
                console.log(error);
                return (error);
            }
        })
    }
});

router.post("/setyearlytarget", validate, async (req, res, next) => {
    const user = req.body;
    User.findOneAndUpdate(
        { username: user.user },
        {
            profitTarget: user.profitTarget,
            recruitmentTarget: user.recruitmentTarget
        },
        function (error, found) {
            if (!error) {
                res.json(
                    {
                        status: "success",
                        message: "Successfully updated yearly targets"
                    }
                )
            }
            else {
                console.log(error);
                return (error);
            }
        });
});

router.post("/getyearlytarget", validate, async (req, res, next) => {
    const user = req.body;
    User.findOne({ username: user.username }, function (error, foundUser) {
        if (!error) {
            console.log(foundUser)
            res.json({
                status: "success",
                message: "Success",
                targets: {
                    profitTarget: foundUser.profitTarget,
                    recruitmentTarget: foundUser.recruitmentTarget
                }
            });
        } else {
            console.log(error);
            return (error);
        }
    });
});


router.post("/resumesession", async (req, res, next) => {
	var found=false;
	var user=null;
	if (req.session.user){
	   found=true;
		
       //res.json({ status: "success", found: true, user: req.session.user })
    }else{
		const Session = mongoose.connection.db.collection("sessions");
		const sessionItem = await Session.find({ _id: req.session.id }).toArray();
		if (sessionItem.length > 0) {
			found=true;
			const session = JSON.parse(sessionItem[0].session);
			req.session.user=session.user
		}
	}
	if(found){
		User.findOne({ username: req.session.user.username }, function (error, currentUser) {
			if (!error) {
				if (currentUser != null) {
					const tokenStatus = (currentUser.gapiToken.access_token != undefined);
					req.session.user={
						username: currentUser.username,
						permissionLevel: currentUser.permissionLevel,
						profitTarget: currentUser.profitTarget,
						recruitmentTarget: currentUser.recruitmentTarget,
						token: tokenStatus
					};
					res.json({ status: "success", found: true, user: req.session.user })
				}
			}
		});
	}else{
		res.json({ status: "success", found: false })
	}
	
	
});

router.post("/logout", validate, (req, res, next) => {
    if (req.session.user.username == req.body.username){
        req.session.destroy(function(error){
            if (!error){
                res.json({
                    status: "success",
                    message: "Sucessfully logged out"
                })
            }
        })
    } else {
        res.json({
            status: "failed",
            message: "username does not match with session"
        });
    }
})

module.exports = router;
