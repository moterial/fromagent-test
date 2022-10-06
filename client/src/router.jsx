import { useEffect, useState } from 'react';
import LoginPage from './pages/login.jsx';
import Forgetpassword from './pages/forgetpw.jsx';
import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';
import { useAuthState } from './authentication/authcontext.jsx';
import Footer from './components/footer.jsx';
import { Pages } from './consts/pages.const.js';

export default function Router() {
    const [LoginState, dispatchLoginState] = useAuthState();
	
    return (
        <BrowserRouter>
			<div style={{height: "20px"}}></div>
            <div className="main-container">
            <Routes>
                <Route exact path="/login" element={<LoginPage />} />
                <Route exact path="/forgetpassword" element={<Forgetpassword />} />
                {
                    /* Private Routes */
                    Pages.map((page, index) => {
                        let target
						if(!!LoginState.isLoggedIn){
							if(LoginState.recruitmentTarget === undefined || LoginState.profitTarget === undefined){
								if(page.path!="/yearlytarget") target= <Navigate replace to={`/yearlytarget`}  />
							}else{
								if(page.path=="/yearlytarget") target= <Navigate replace to={`/dashboard`}  />
							}
							
						}else{
							target= <Navigate replace to={`/login?from=${window.location.pathname}`}  />
						}
						target= target?target:<page.component /> 
						
						return (
                            <Route
                                key={index}
                                exact
                                path={page.path}
                                element={target}

                            >
                            </Route>
                        );
                    })}
                <Route path="*" element={<Navigate to="/login" />} />

            </Routes>
            </div>
            <div style={{ height: "80px" }} />
			<div id="loading">
				<div className="loader-container">
					<div className="loader"/>
				</div>
			</div>
            <Footer />
        </BrowserRouter>
    );
}
