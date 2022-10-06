import React, { createContext, useContext, useReducer } from 'react';

const AuthStateContext = createContext();

const initialContext = {
    isLoggedIn: false
};


function reducer(state, action){
    switch (action.type) {
        case "LOGIN": 
            return {isLoggedIn: true, ...action.user};
        case "LOGOUT":
            return initialContext;
        case "UPDATE":
            return {...state, ...action.targets};
        default:
            throw new Error("Error using Auth Reducer: ", state, " ", action);
    }
}

/**
 * 
 * @param {JSON} state returns the AuthState
 * @param {JSON} dispatchAuthState 
 * { type: "LOGIN" || "LOGOUT" || "UPDATE", targets: any }
 * @returns {[state, dispatchAuthState]} (React useState Hook)
 */

export function useAuthState(){
    const context = useContext(AuthStateContext);
    if (context === undefined){
        throw new Error("Context not found");
    }
    return (context);
}

export function AuthContext({children}){
    const [state, dispatch] = useReducer(reducer, initialContext);
    const value = [state, dispatch];
    return (
    <AuthStateContext.Provider value={value}>
        {children}
    </AuthStateContext.Provider>
    );
}
