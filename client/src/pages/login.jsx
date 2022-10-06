import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGIN_PATH, RESUME_SESSION_PATH } from '../consts/api.const';
import { useAuthState } from '../authentication/authcontext.jsx';

export default function LoginPage(){

    const [credentials, setCredentials] = useState({});
    const [AuthState, dispatchAuthState] = useAuthState();
    const [fetching, setFetching] = useState(false);
    const [loadingSession, setLoadingSession] = useState(true);
    const [forgetPW, setForgetPW] = useState(false);
    const navigate = useNavigate();
    
    async function handleSubmit(event) {
        event.preventDefault();
        setFetching(true);
        const user = credentials;
        const response = await fetch(LOGIN_PATH, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({user}),
        })
        .catch(
            error => {
                window.alert(error);
                return;
            }
        ); 

        const res = await response.json().then(setFetching(false));
        
        if (res.status === "Correct Password") {
            dispatchAuthState(
                {
                    type: "LOGIN",
                    user: res.user
                }
            );            
        }
        else alert(res.status);

        // Todos post item to backend server
    }

    function handleChange(event){
        setCredentials({ ...credentials, [event.target.name]: event.target.value });
    }
	
	function getQueryVariable(variable)
	{
			var query = window.location.search.substring(1);
			var vars = query.split("&");
			for (var i=0;i<vars.length;i++) {
						var pair = vars[i].split("=");
			if(pair[0] == variable){return pair[1];}
			}
			return(false);
	}
	
	const query=(getQueryVariable('from'));
    useEffect( () => {
        if (AuthState.isLoggedIn) {
            if (AuthState.recruitmentTarget === undefined || AuthState.profitTarget === undefined){
                navigate("/yearlytarget");
            } else 
            {
				if(query){
					navigate(query);
				}else{
					navigate("/dashboard");
				}
            }
        }
    },[AuthState]);

    useEffect(() => {
        async function resumeSession(){
            setLoadingSession(true);
            await fetch(RESUME_SESSION_PATH, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(
                res => {
                    if (res.ok){
                        return (res.json());
                    }
                }
            ).then(
                json => {
                    if (json.found === true){
                        dispatchAuthState({
                            type: "LOGIN",
                            user: json.user
                        })
                    }
                }
            ).catch(
                error => {
                    console.log(error);
                    return (error);
                }
            ).finally(() => {
                setLoadingSession(false);
            })
        }
        resumeSession();
    }, []);

    const forget = () =>{
        navigate("/forgetpassword");
    }

    if (loadingSession){
        return (
            <div>
                載入中...
            </div>
        );
    } else  return (
        <div className='d-flex flex-column align-items-center justify-content-center h-100'>
            <div className='abcd' style={{ fontSize: "30px" }}>客戶及招募管理系統</div>
			
            <form onSubmit={handleSubmit} className="w-90">
			<div className="border primary p-3 pb-4 mt-3 rounded">
                <div className='form-group d-flex flex-column'>
                    <label>用戶名稱</label>
                    <input type="text" className='form-control shadow-sm ' name='username' onChange={handleChange} />
                    <label className="mt-3">密碼</label>
                    <input type="password" className='form-control shadow-sm ' name='password' onChange={handleChange}/>
                </div>
			</div>
			<div className='form-group d-flex flex-column mt-3'>
				<input className='btn btn-light' type="submit" disabled={fetching} value={!fetching? "登入": "登入中..."}/>
			</div>
            </form>

            <div className='w-90'>
                <a className='float-start mt-3 forgetPW' onClick={forget}>忘記密碼？</a>
            </div>
        </div>
    );

}
