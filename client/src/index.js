import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import {SocketContext, socket} from './context/socket';
import { GAPI_GET_USER_TOKEN } from './consts/api.const';


//add loading effect to every fetch
const _fetch = window.fetch
var timeout;

window.fetch = function(...args) {
  
  timeout = setTimeout(function(){
	document.getElementById('loading').style.display="block";
  }, 500);

  return Promise.resolve(_fetch.apply(window, args))
    .then(resp => {
      document.getElementById('loading').style.display="none";
	    clearTimeout(timeout);

      return resp;
    })
}


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
