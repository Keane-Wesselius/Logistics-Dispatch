import React from 'react';
import './Welcome.css'; 

function Welcome() {
  return (
      <div class="col-lg-6 mb-5 mb-lg-0" className="welcome-div">
          <h1 class="my-5 display-5 fw-bold ls-tight" className="welcome-h12">
            Welcome to <br />
            <span className="welcome-h12">LoadUp</span>
          </h1>
          <p class="mb-4 opacity-70" className="welcome-p">
            The premier way of using logistics dispatch.
          </p>
        </div>
  )
}

export default Welcome;