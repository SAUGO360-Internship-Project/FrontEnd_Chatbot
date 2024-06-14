// import React, { useState } from 'react';
// import './App.css';

// function App(){
//   let  [isSignUp, setIsSignUp] = useState(true);

//   const toggleForm = () => {
//     setIsSignUp(!isSignUp);
//   };

//   return (
//     <div className="container">
//       <div className={`form-container ${isSignUp ? 'sign-up-mode' : 'login-mode'}`}>
//         <div className="left-panel">
//           <div className="content">
//             {isSignUp ? (
//               <>
//                 <h2>Welcome to Intelligent Chatbot!</h2>
//                 <p>To continue, please create an account.</p>
//                 <button onClick={toggleForm}>
//                   Already have an account? <span>Sign In</span>
//                 </button>
//               </>
//             ) : (
//               <>
//                 <h2>Don't have an account yet?</h2>
//                 <p>Please sign up to continue.</p>
//                 <button onClick={toggleForm}>
//                   <span>Sign Up</span>
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//         <div className="right-panel">
//           {isSignUp ? (
//             <form className="sign-up-form">
//               <h2>Sign Up</h2>
//               <input type="text" placeholder="Username" required />
//               <input type="email" placeholder="Email" required />
//               <input type="password" placeholder="Password" required />
//               <button type="submit">Submit</button>
//             </form>
//           ) : (
//             <form className="login-form">
//               <h2>Sign In</h2>
//               <input type="text" placeholder="Username" required />
//               <input type="password" placeholder="Password" required />
//               <button type="submit">Submit</button>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;


import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import ChatPage from './pages/ChatPage'; // Import the new ChatPage component

function App() {
  let [isSignUp, setIsSignUp] = useState(true);

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  const SignUpLoginForm = () => (
    <div className="container">
      <div className={`form-container ${isSignUp ? 'sign-up-mode' : 'login-mode'}`}>
        <div className="left-panel">
          <div className="content">
            {isSignUp ? (
              <>
                <h2>Welcome to Intelligent Chatbot!</h2>
                <p>To continue, please create an account.</p>
                <button onClick={toggleForm}>
                  Already have an account? <span>Sign In</span>
                </button>
              </>
            ) : (
              <>
                <h2>Don't have an account yet?</h2>
                <p>Please sign up to continue.</p>
                <button onClick={toggleForm}>
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>
        <div className="right-panel">
          {isSignUp ? (
            <form className="sign-up-form">
              <h2>Sign Up</h2>
              <input type="text" placeholder="Username" required />
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit">Submit</button>
            </form>
          ) : (
            <form className="login-form">
              <h2>Sign In</h2>
              <input type="text" placeholder="Username" required />
              <input type="password" placeholder="Password" required />
              <button type="submit">Submit</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/" element={<SignUpLoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;

