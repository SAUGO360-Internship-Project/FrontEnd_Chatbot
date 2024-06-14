import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './ChatPage.css';

// function ChatPage() {
//   const [messages, setMessages] = useState([{ text: "Hi! 👋 it's great to see you!", sender: "bot" }]);
//   const [input, setInput] = useState("");

//   const handleSubmit = (e) => { 
//     e.preventDefault();
//     if (input.trim()) {
//       setMessages([...messages, { text: input, sender: "user" }]);
//       setInput("");
//       // Simulate bot response
//       setTimeout(() => {
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           { text: "Hello, how can I help you today? 😊", sender: "bot" }
//         ]);
//       }, 1000);
//     }
//   };

//   return (
//     <div className="container-fluid h-100">
//       <div className="row h-100">
//         <div className="col-md-3 col-xl-3 chat-list">
//           <div className="card">
//             <div className="card-header">
//               <button className="btn btn-primary btn-block">Create Chat</button>
//             </div>
//             <div className="card-body contacts_body">
//               <ul className="contacts">
//                 <li className="active">
//                   <div className="d-flex bd-highlight">
//                     <div className="user_info">
//                       <span>Chat 1</span>
//                     </div>
//                   </div>
//                 </li>
//                 {/* Add more chat items as needed */}
//               </ul>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-9 col-xl-9 chat">
//           <div className="card">
//             <div className="card-header msg_head d-flex justify-content-between align-items-center">
//               <div>
//                 <span>Chat with ChatBot</span>
//               </div>
//               <div className="dropdown">
//                 <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
//                   Profile
//                 </button>
//                 <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
//                   <a className="dropdown-item" href="#">Username: user123</a>
//                   <a className="dropdown-item" href="#">Email: user@example.com</a>
//                 </div>
//               </div>
//             </div>
//             <div className="card-body msg_card_body">
//               {messages.map((msg, index) => (
//                 <div key={index} className={`d-flex ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"} mb-4`}>
//                   <div className={`msg_cotainer${msg.sender === "user" ? "_send" : ""}`}>
//                     {msg.text}
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="card-footer">
//               <form className="input-group" onSubmit={handleSubmit}>
//                 <input
//                   type="text"
//                   className="form-control type_msg"
//                   placeholder="Type your message..."
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   required
//                 />
//                 <div className="input-group-append">
//                   <button type="submit" className="btn btn-primary">Send</button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ChatPage;


function ChatPage() {
  return (
    <div>
      <p>chat page will be implemented here</p>
    </div>

  );
}

export default ChatPage;