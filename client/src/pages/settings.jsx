import React, { useEffect } from 'react';
import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuthState } from '../authentication/authcontext.jsx';
import UserManagementPage from './usermanagement.jsx';
import { UPDATE_SECURITY, GET_SECURITY,CHANGE_PASSWORD_PATH, GAPI_DELETE_USER, GAPI_GET_LINK, GAPI_GET_USER_TOKEN, USER_LOGOUT } from '../consts/api.const.js';
import { SocketContext, socket } from '../context/socket';


function Settings() {


    const [values, setValues] = useState({});
    const [hasSecurity, setHasSecurity] = useState(false);
    const [security, setSecurity] = useState({
        securityQuestion1: "你的第一個寵物名字是？",
        securityQuestion2: "你的出生地是？",
    });
    const [AuthState, dispatchAuthState] = useAuthState();
    let popupWindow = null;

    const securityQuestion1 = [
        "你的第一個寵物名字是？",
        "你的第一個車牌號碼是？",
        "你的第一個電話號碼是？",
        "你配偶的姓名是？",
        "你母親的姓名是？",
        "你父親的姓名是？",
    ]

    const securityQuestion2 = [
        "你的出生地是？",
        "你的小學名字是？",
        "你的學號（或職員編號）是？",
        "對你影響最大的人名字是？",
        "你的最喜歡的運動是？",
        "你的最喜歡的食物是？",
    ];


    const exportToGoogleCalendar = () => {
        socket.emit("logingoogle", AuthState.username);
		console.log(GAPI_GET_LINK);
        fetch(GAPI_GET_LINK, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(AuthState)
        })
            .then((res) => {
                if (res.ok) {
                    return (res.json());
                }
            })
            .then((json) => {
                if (json.status === "success") {
                    window.location.href = json.authUrl;
                }
            })
            .catch((error) => {
                console.log("Error: " + error);
            })
    }
	
	const showlogout = () => {
		document.getElementById('logoutbtn').style.display="block";
		document.getElementById('g-logout-more').style.display="none";
	}
	
    const logoutfromGoogleCalendar = () => {
		if (window.confirm("確定要登出Google嗎？")) {
			fetch(GAPI_DELETE_USER, {
				method: "DELETE",
				credentials: "include",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(AuthState)
			})
            .then((res) => {
                if (res.ok) {
                    return (res.json());
                }
            })
            .then((json) => {
                window.alert(json.status + ": " + json.message);
                if (json.status === "success") {
                    dispatchAuthState({
                        type: "UPDATE",
                        targets: {
                            token: false
                        }
                    });
                }
            })
            .catch((error) => {
                console.log("Error: " + error);
            })
		}
    }

    const logout = () => {
        fetch(USER_LOGOUT, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(AuthState)
        })
            .then(res => {
                if (res.ok) {
                    return (res.json())
                }
            })
            .then(
                json => {
                    if (json.status === "success") {
                        alert("Successfully logged out");
                        dispatchAuthState({ type: "LOGOUT" });
                    }
                }
            )
            .catch(
                error => {
                    alert(error);
                    console.log(error);
                    return (error);
                }
            )
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (values.newPw !== values.confirmNewPw) {
            alert("New password and confirm new password are not equal");
            return;
        }
        const data = {
            username: AuthState.username,
            oldPassword: values.oldPw,
            newPassword: values.newPw
        };
        await fetch(CHANGE_PASSWORD_PATH, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(
                response => {
                    if (response.ok) {
                        return (response.json())
                    }
                }
            )
            .then(
                res => {
                    alert(res.status + ": " + res.message);
                }
            )
            .catch(
                error => {
                    alert(error);
                }
            )
    }
    const handleChange = (e) => {
        setValues({
            ...values,
            [e.target.name]: e.target.value,
        }
        );
    }

    function handleQuestion1(e) {
        console.log(e.target.value);
        console.log(security);
        setSecurity({
            ...security,
            securityQuestion1: e.target.value
        })
    }

    function handleQuestion2(e) {
        console.log(e.target.value);
        console.log(security);
        setSecurity({
            ...security,
            securityQuestion2: e.target.value
        })
    }

   const handleSubmitSecurity = async (e) =>{
        e.preventDefault();
        const answer1 = document.getElementById('answer1').value;
        const answer2 = document.getElementById('answer2').value;
        console.log(answer1);
        console.log(answer2);
        if(answer1 != "" || answer2 != ""){
            let security1 = {}
            security1 = {
                securityQuestion1: security.securityQuestion1,
                securityQuestion2: security.securityQuestion2,
                securityAnswer1: answer1,
                securityAnswer2: answer2,
            }
            //wait for the setSecurity to finish
            await fetch(UPDATE_SECURITY, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({AuthState: AuthState, security: security1})
            })
            .then(response => {
                if (response.ok) {
                        return (response.json())
                    }
            })
            .then(res => {
                alert(res.status );
                
                window.location.reload();
            })
            .catch(error => {
                alert(error);
            })
        }
        else{
            alert("請輸入密保答案");
        }
    }


    useEffect(() => {
        socket.on("forceRefresh", (data) => {
            fetch(GAPI_GET_USER_TOKEN, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(
                    res => {
                        if (res.ok) {
                            return (res.json());
                        }
                    }
                )
                .then(
                    json => {
                        if (json.token === true) {
                            dispatchAuthState({
                                type: "UPDATE",
                                targets: {
                                    token: true
                                }
                            })
                        }
                    }
                )
                .catch(
                    error => {
                        console.log(Error(error));
                    }
                )
        });
    }, []);

    useEffect(() => {
        fetch(GET_SECURITY, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ AuthState})
        })
         .then( (res) => {
            if (res.ok) {
                return (res.json());
            }
        })
         .then( (data) => {
            if(data.status === "success"){
                const foundUser = data.body.foundUser;
                console.log(foundUser);
                if(foundUser.securityQuestion1 != null && foundUser.securityQuestion2 != null ){
                    console.log("has security");
                    setHasSecurity(true);
                }
            }
            
        })


    }, []);

    return (
        <div className="bounceInAnimation d-flex justify-content-center">
            <div className='w-90 '>
                <div className='my-3 w-100 d-flex justify-content-center align-items-center' style={{ height: "100px" }}>
                    {!AuthState.token
                        ?
                        <div>
                            <button className='btn-primary-outline google-btn' type="button" onClick={exportToGoogleCalendar}>
                                <img src="/google-btn.png" />
                            </button>
                        </div>
                        :
						<div align="center">
							<h3>已成功連接Google</h3>
							<button onClick={showlogout} id="g-logout-more"><h6>more <span>▼</span></h6></button>
                        <button id="logoutbtn" className='w-100 bg-light form-control shadow-sm border rounded h-50 google-btn' type="button" onClick={logoutfromGoogleCalendar}>
                            從 Google Calendar 登出
                        </button>
						</div>
                    }

                </div>
                
                <div className='w-100 d-inline-flex flex-column align-items-center border p-3 pb-4 rounded'>
                    <label className='w-100 text-start'>更改密碼</label>
                    <form className='w-100 d-inline-flex flex-column align-items-center' onSubmit={handleSubmit}>
                        <div className='form-group w-100 d-inline-flex flex-column align-items-center'>
                            <input className='form-control shadow-sm my-2' type="password" name="oldPw" placeholder='舊密碼' onChange={handleChange} />
                            <input className='form-control shadow-sm my-2' type="password" name="newPw" placeholder='新密碼' onChange={handleChange} />
                            <input className='form-control shadow-sm my-2' type="password" name="confirmNewPw" placeholder='確認新密碼' onChange={handleChange} />
                            <input className='mt-1 btn btn-outline-light w-100' type="submit" value='更改' />
                        </div>
                    </form>
                </div>
                {  
                    hasSecurity==false? <div className='w-80 d-inline-flex flex-column align-items-center border p-3 pb-4 rounded mt-3'>
                    <label className='w-100 text-start'>！！設定密保問題！！</label>
                    <form className='w-100 d-inline-flex flex-column align-items-center' onSubmit={handleSubmitSecurity}>
                        <div className='form-group w-80 d-inline-flex flex-column align-items-center'>
                            問題一：<select className='form-control shadow-sm my-2' onChange={handleQuestion1}>
                                {
                                    securityQuestion1.map((item, index) => {
                                        return (
                                            <option key={index} value={item}>{item}</option>
                                        )
                                    })
                                }
                                
                            </select>
                            <input className='form-control shadow-sm my-2' type="text" id="answer1" name="answer1" placeholder='答案' onChange={handleChange} />
                            
                        </div>
                        <div className='form-group w-80 d-inline-flex flex-column align-items-center'>
                            問題二：<select className='form-control shadow-sm my-2' onChange={handleQuestion2}>
                                {
                                    securityQuestion2.map((item, index) => {
                                        return (
                                            <option key={index} value={item}>{item}</option>
                                        )
                                    })
                                }
                            </select>
                            <input className='form-control shadow-sm my-2' type="text" id="answer2" name="answer2" placeholder='答案' onChange={handleChange} />
                            <input className='mt-1 btn btn-outline-light w-100' type="submit" value='確定' />
                        </div>
                    </form>
                </div>:null
                  


                }
                
                


                <div className='w-100 container mt-3'>
                    <div className="row">
                        {!!(AuthState.permissionLevel === 2) ?
                            <Link to="usermanagement" className='col w-100 p-0 me-1'>
                                <button className='btn btn-outline-light w-100 '>進入員工管理頁面</button>
                            </Link> : ""
                        }
                        <button className='col btn btn-light ms-1 p-0' type="button" onClick={logout}>登出</button>
                    </div>
                </div>
            </div>
        </div>);
}

export default function SettingsPage(props) {
    return (
        <div>
            <Routes>
                <Route path="" element={<Settings />} />
                <Route path="usermanagement" element={<UserManagementPage />} />
            </Routes>
        </div>
    );
}
