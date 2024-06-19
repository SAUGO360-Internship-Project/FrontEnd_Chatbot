import React from 'react';
import { Box, Drawer, List, ListItem, ListItemText, AppBar, Toolbar, Typography, Paper, IconButton, TextField, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add'; // Importing the add icon for new chat button
import './ChatPage.css';

const drawerWidth = 240;

function ChatPage() {
  const [open, setOpen] = React.useState(true);
  const [messages, setMessages] = React.useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = React.useState([
    'Quiz me on ancient civilizations',
    'Experience Seoul like a local',
    'Morning routine for productivity',
    'Pick outfit to look good on camera'
  ]);
  const [inputValue, setInputValue] = React.useState('');

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
  };

  const handleSuggestedQuestionClick = (question) => {
    handleSendMessage(question);
  };

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
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
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
          <IconButton color="primary" onClick={() => console.log("Create new chat")}>
            <AddIcon />
          </IconButton>
        </Box>
        <List>
          {['Previous 7 Days', 'CORS Error: Backend Configuration', 'Model Blocks Sensitive Requests', 'Fix Circular Import Issues', 'Extract Location Google Maps'].map((text) => (
            <ListItem button key={text}>
              <ListItemText primary={text} />
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
        <TextField
          variant="outlined"
          placeholder="Type a message..."
          fullWidth
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