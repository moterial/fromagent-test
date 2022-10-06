import { AuthContext } from './authentication/authcontext.jsx';
import Router from './router.jsx';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap';

function App() {
  const api_regex = /^\/api\/.*/
   // if using "/api/" in the pathname, don't use React Router
   if (api_regex.test(window.location.pathname)) {
      return <div /> // must return at least an empty div
   } else {
      // use React Router
      return (
		<div className="App">
			<AuthContext>
			<Router/>
			</AuthContext>
		</div>
	  );
   }
	
	
  
}

export default App;
