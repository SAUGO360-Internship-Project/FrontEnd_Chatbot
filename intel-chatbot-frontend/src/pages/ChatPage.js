import React, { useState, useCallback, useEffect } from 'react';
import { Box, Menu, MenuItem, Drawer, List, ListItem, ListItemText, AppBar, Toolbar, Typography, Paper, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { clearUserEmail, clearUserName, clearUserToken, getUserToken } from '../localStorage';
import AddIcon from '@mui/icons-material/Add'; // Importing the add icon for new chat button
import './ChatPage.css';
import { SERVER_URL } from '../App';

const drawerWidth = 240;

function ChatPage() {
  let [open, setOpen] = useState(true);
  let [messages, setMessages] = useState([]);
  let [userToken, setUserToken] = useState(getUserToken());
  let [suggestedQuestions, setSuggestedQuestions] = useState([
    'Quiz me on ancient civilizations',
    'Experience Seoul like a local',
    'Morning routine for productivity',
    'Pick outfit to look good on camera'
  ]);
  let [inputValue, setInputValue] = useState('');
  let [chats, setChats] = useState([]);
  let [newChatTitle, setNewChatTitle] = useState('');
  let [isAddingChat, setIsAddingChat] = useState(false);
  let [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };



  const handleSendMessage = (message) => {
    const newMessage = { text: message, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');
    // Simulate a response from the backend
    setTimeout(() => {
      const responseMessage = { text: `Response to: ${message}`, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, responseMessage]);
    }, 1000);
    if (suggestedQuestions.length > 0) {
      setSuggestedQuestions([]);
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    adjustTextareaHeight(event.target);
  };

  const adjustTextareaHeight = (textarea) => {
    textarea.style.height = 'auto'; // Reset the height
    textarea.style.height = textarea.scrollHeight + 'px'; // Set the height based on the scroll height
  };

  const handleSuggestedQuestionClick = (question) => {
    handleSendMessage(question);
  };

  function createChat(title) {
    if (!title) {
      alert("Please enter a suitable title");
      return;
    }

    fetch(`${SERVER_URL}/chat/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${userToken}`
      },
      body: JSON.stringify({ title: title }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setChats((prevChats) => [...prevChats, data]);
          setNewChatTitle('');
          setIsAddingChat(false);
        }
      })
      .catch((error) => {
        alert(error.error);
      });
  }

  const getChats = useCallback(() => {
    fetch(`${SERVER_URL}/chat/chats`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${userToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("fetching chats failed");
        }
        return response.json()
      })
      .then((data) => {
        if (data) {
          setChats(data); // Update the chat list with the new chat
        }
      })

      .catch((error) => {
        alert(error.message); // Display the error message from the backend
        return;
      });
  }, [userToken]);
  useEffect(() => {
    if (userToken) {
      getChats();
    }
  }, [getChats, userToken]);



  function logout() {
    setUserToken(null);
    clearUserToken();
    clearUserName();
    clearUserEmail();
  }

  return (
    <Box className={`app-container ${open ? 'open' : 'closed'}`}>
      {/* AppBar with IconButton to open/close sidebar */}
      <AppBar className={`app-bar ${open ? 'open' : 'closed'}`} position="fixed">
        <Toolbar>
          {!open && (  // Show MenuIcon only if sidebar is closed
            <IconButton
              color="inherit"
              aria-label={open ? "close drawer" : "open drawer"}
              onClick={() => setOpen(!open)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap>
            Intel Chatbot
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
          >
            {/* <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>My account</MenuItem> */}
            <MenuItem onClick={() => { handleMenuClose(); logout(); }}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer with new chat button on the upper right */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <IconButton
            color="inherit"
            aria-label={open ? "close drawer" : "open drawer"}
            onClick={() => setOpen(!open)}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">Chats</Typography>
          <IconButton color="primary" onClick={() => setIsAddingChat(true)}>
            <AddIcon />
          </IconButton>
        </Box>
        {isAddingChat && (
          <Box sx={{ p: 2 }}>
            <input
              type="text"
              placeholder="Enter chat title"
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  createChat(newChatTitle);
                }
              }}
              autoFocus
            />
          </Box>
        )}
        <List>
          {chats.map((chat) => (
            <ListItem button key={chat.id}>
              <ListItemText primary={chat.title} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Chat content area with suggested questions and messages */}
      <Box className={`chat-content ${open ? 'open' : 'closed'}`}>
        <Box className="suggested-questions-container">
          {suggestedQuestions.map((text, index) => (
            <Paper
              key={index}
              className="suggested-question-card"
              onClick={() => handleSuggestedQuestionClick(text)}
            >
              <Typography variant="body1">
                {text}
              </Typography>
            </Paper>
          ))}
        </Box>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 1,
              width: '100%',
              maxWidth: '600px',
            }}
          >
            <Paper sx={{ padding: 2, backgroundColor: message.sender === 'user' ? '#bbdefb' : '#e3f2fd' }}>
              <Typography>{message.text}</Typography>
            </Paper>
          </Box>
        ))}
      </Box>

      {/* Chat box area with text input and send button */}
      <div className={`chat-box-container ${open ? 'open' : 'closed'}`}>
        <textarea className='chat-input'
          variant="outlined"
          placeholder="Type a message..."
          fullWidth
          rows={1}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSendMessage(inputValue);
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={() => handleSendMessage(inputValue)}
        >
          <SendIcon />
        </IconButton>
      </div>
    </Box>
  );
}

export default ChatPage;