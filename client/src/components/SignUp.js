import React,{ useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './style/LoginPage.css'; 
import { Navigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitForm = () => {    
    setIsSubmitted(true);
  }
  return (
      <div className="form-container">
        <p className="title">Sign Up</p>
        <form className="form">
          <div className="input-group">
            <label for="username">Username</label>
            <input type="text" name="username" id="username" placeholder=""/>
          </div>
          <div className="input-group">
            <label for="password">Password</label>
            <input type="password" name="password" id="password" placeholder=""/>
          </div>
          <div className="input-group">
            <label for="password">Password verification</label>
            <input type="password" name="password" id="password" placeholder=""/>
          </div>
          <div className="seperator"></div>
          <button className="sign">Sign Up</button>
        </form>
        <p className="signup">You already have an account?
          <a rel="noopener noreferrer" href="#" onClick={() => navigate('/login')} class="">Sign In</a>
        </p>
      </div>
  );
}

export default SignUp;
