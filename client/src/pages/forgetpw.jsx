import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FORGET_CHANGE_PASSWORD,FORGET_COMPARE_SECURITY, FORGET_GET_SECURITY,LOGIN_PATH, RESUME_SESSION_PATH } from '../consts/api.const';
import { useAuthState } from '../authentication/authcontext.jsx';



export default function Forgetpassword(){


    const [fetching, setFetching] = useState(false);
    const [fetching2, setFetching2] = useState(false);
    const [fetching3, setFetching3] = useState(false);
    const [userExist, setUserExist] = useState(false);
    const [hasSecurity, setHasSecurity] = useState(false);
    const [name, setName] = useState("");
    const [security, setSecurity] = useState({});
    const [correct, setCorrect] = useState(false);
    
    const navigate = useNavigate();
    
    async function handleSubmit(event) {
        event.preventDefault();
        setFetching(true);

        let user = document.getElementById("name").value;
        setName(user);
        await fetch(FORGET_GET_SECURITY, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                AuthState: {
                    username: user
                }
                })
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
                    setUserExist(true);
                    setSecurity(foundUser);
                    
                }
                else{
                    alert("還沒有設定安全問題");
                    setFetching(false); 
                }
            }else{
                alert("查無此人");
                setFetching(false);
            }
            
        })

    }

    async function handleSubmit2(event) {
        event.preventDefault();
        setFetching2(true);
        let answer1 = document.getElementById("answer1").value;
        let answer2 = document.getElementById("answer2").value;
        await fetch(FORGET_COMPARE_SECURITY, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                AuthState: {
                    username: name,
                    securityAnswer1: answer1,
                    securityAnswer2: answer2,
                }
            })

        }).then( res=>{
            if(res.ok){
                return res.json();
            }
        }).then( data=>{
            if(data.status === "success"){
                setCorrect(true);
            }else{
                alert("答案錯誤");
                setFetching2(false);
            }
        })
    }



    async function handleSubmit3(event) {
        event.preventDefault();
        setFetching2(true);
        let pw1 = document.getElementById("pw1").value;
        let pw2 = document.getElementById("pw2").value;
        if(pw1 !== pw2){
            alert("密碼不一致");
            setFetching3(false);
        } else{
            //bcrypt the pw1
            await fetch(FORGET_CHANGE_PASSWORD, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    AuthState: {
                        username: name,
                        password: pw1,
                    }
                })
            }).then( res=>{
                if(res.ok){
                    return res.json();
                }
            }).then( data=>{
                if(data.status === "success"){
                    alert("密碼修改成功");
                    navigate(LOGIN_PATH);
                }else{
                    alert("密碼修改失敗");
                    setFetching3(false);
                }
            })
        }
        

    }


   return (
        <div className='d-flex flex-column align-items-center justify-content-center h-100'>
            <div className='abcd' style={{ fontSize: "30px" }}>客戶及招募管理系統</div>
			
            <form onSubmit={handleSubmit} className="w-90">
                <div className="border primary p-3 pb-4 mt-3 rounded">
                    <div className='form-group d-flex flex-column'>
                        <label>用戶名稱</label>
                        <input type="text" className='form-control shadow-sm ' name='username'  id="name" />
                    
                    </div>
                </div>
                <div className='form-group d-flex flex-column mt-3'>
                    <input className='btn btn-light' type="submit" disabled={fetching} value={!fetching? "提交": "提交完成"}/>
                </div>
                </form>


            { userExist && hasSecurity &&
                <form onSubmit={handleSubmit2} className="w-90">
                <div className="border primary p-3 pb-4 mt-3 rounded">
                    <div className='form-group d-flex flex-column'>
                        <label>問題一:{security.securityQuestion1}</label>
                        <input type="text" className='form-control shadow-sm ' name='answer1' id="answer1" />
                        <label>問題二:{security.securityQuestion2}</label>
                        <input type="text" className='form-control shadow-sm ' name='answer2' id="answer2" />
                    </div>
                </div>
                <div className='form-group d-flex flex-column mt-3'>
                    <input className='btn btn-light' type="submit" disabled={fetching2} value={!fetching2? "提交": "提交完成"}/>
                </div>
                </form>
            }

            {
               correct && 
               <form onSubmit={handleSubmit3} className="w-90">
                    <div className="border primary p-3 pb-4 mt-3 rounded">
                        <div className='form-group d-flex flex-column'>
                            <label className="mt-3">新密碼</label>
                            <input type="password" className='form-control shadow-sm ' name='password' id="pw1" />
                            <label className="mt-3">確認新密碼</label>
                            <input type="password" className='form-control shadow-sm ' name='password' id="pw2"/>
                        </div>
                    </div>
                    <div className='form-group d-flex flex-column mt-3'>
                        <input className='btn btn-light' type="submit" disabled={fetching3} value={!fetching3? "更改": "更改中..."}/>
                    </div>
                </form>


            }

        </div>
    );


}
