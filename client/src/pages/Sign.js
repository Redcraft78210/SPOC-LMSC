import React, { useState, useEffect } from 'react'
import './styles/Sign.css'
const Sign = () => {
    const [isRegistered, setIsRegistered] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleRegisterTrue = () => {
        setIsRegistered(true);
    }
    const handleRegisterFalse = () => {
        setIsRegistered(false);
    }
    const handleSubmit = (e) => {
        console.log(username + "||" + password)
        console.log("Is registered ?  " + isRegistered )
        console.log("if no, " + confirmPassword)
    }
    const useEffect = () => {
        // 
    }

  return (
        <div className="form-container">
            {isRegistered ? (<p className="title">Login</p>) : (<p className="title">Register</p>)}
            <form onSubmit={handleSubmit} className="form">
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input onChange={(e) => {setUsername(e.target.value)}} type="text" name="username" id="username" placeholder=""/>
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input onChange={(e) => {setPassword(e.target.value)}} type="password" name="password" id="password" placeholder=""/>
                    {!isRegistered && (<label htmlFor="confirmpassword">Confirm Password</label>)}
                    {!isRegistered && (<input onChange={(e)=> {setConfirmPassword(e.target.value)}} type="password" name='confirmpassword' id='confirmpassword' placeholder="" />)}
                    <div className="forgot">
                        <a rel="noopener noreferrer" href="#">Forgot Password ?</a>
                    </div>
                </div>
                <br />
                {isRegistered ? (<button type="submit" className="sign">Sign in</button>) : (<button type="submit" className="sign">Sign Up</button>)}
            </form>
            <br /> 

            {isRegistered ? (<p className="signup">Don't have an account?
                <a rel="noopener noreferrer" href="#"  onClick={handleRegisterFalse} className="">Sign up</a>
            </p>) : (<p className="signup">Already have an account?
                <a rel="noopener noreferrer" href="#"  onClick={handleRegisterTrue} className="">Sign in</a>
            </p>)}
        </div>
  )
}

export default Sign;