import React from 'react';

function Login() {
  return (
    <div className="container mx-auto mt-10">
      <div className="card shadow-lg p-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="email" className="form-control" id="email" placeholder="Enter your email" />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" placeholder="Enter your password" />
          </div>
          <button type="submit" className="btn btn-primary w-full">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
