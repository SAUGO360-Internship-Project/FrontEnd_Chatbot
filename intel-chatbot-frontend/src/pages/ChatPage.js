import React, { useState, useCallback, useEffect } from 'react';
import { Box, Menu, MenuItem, Drawer, List, ListItem, ListItemText, AppBar, Toolbar, Typography, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { clearUserEmail, clearUserName, clearUserToken, getUserToken } from '../localStorage';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './ChatPage.css';
import { SERVER_URL } from '../App';

const drawerWidth = 240;

function ChatPage() {
  let [open, setOpen] = useState(true);
  let [messages, setMessages] = useState([]);
  let [userToken, setUserToken] = useState(getUserToken());
  let [suggestedQuestions, setSuggestedQuestions] = useState([
    'How many customers are called Emily',
    'What is the purchase history of Robert Smith',
    'How much milk did Linda Garcia buy',
    'What is the age of Alex Jones'
  ]);
  let [inputValue, setInputValue] = useState('');
  let [chats, setChats] = useState([]);
  let [newChatTitle, setNewChatTitle] = useState('');
  let [isAddingChat, setIsAddingChat] = useState(false);
  let [anchorEl, setAnchorEl] = useState(null);
  let [currentChatId, setCurrentChatId] = useState(null);
  let [menuAnchorEl, setMenuAnchorEl] = useState(null);
  let [selectedChatId, setSelectedChatId] = useState(null);
  let [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  let [renameChatTitle, setRenameChatTitle] = useState('');
  let [chatMessages, setChatMessages] = useState({});


  const isMenuOpen = Boolean(anchorEl);
  const isChatMenuOpen = Boolean(menuAnchorEl);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChatMenuOpen = (event, chatId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedChatId(chatId);
  };

  const handleChatMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleSendMessage = (message) => {
    if (!message) {
      return;
    }

    const newMessage = { text: message, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');

    if (!currentChatId) {
      const generatedTitle = generateChatTitle(message);
      createChat(generatedTitle, message);
    } else {
      sendMessageToChat(message, currentChatId);
    }

    setChatMessages((prevChatMessages) => ({
      ...prevChatMessages,
      [currentChatId]: true,
    }));
  };


  const sendMessageToChat = (message, chatId) => {
    fetch(`${SERVER_URL}/chat/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${userToken}`,
      },
      body: JSON.stringify({ question: message, chat_id: chatId }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Couldn't send a question, try again later");
        }
        return response.json();
      })
      .then((data) => {
        const responseMessage = { text: data.response, sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, responseMessage]);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const generateChatTitle = (message) => {
    const words = message.split(' ');
    const title = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
    return title;
  };

  const createChat = (title, initialMessage) => {
    let chatTitle = title;
    if (!title) {
      const randomIndex = Math.floor(Math.random() * suggestedQuestions.length);
      chatTitle = suggestedQuestions[randomIndex];
    }

    fetch(`${SERVER_URL}/chat/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${userToken}`
      },
      body: JSON.stringify({ title: chatTitle }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Creating a chat failed");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          setChats((prevChats) => [...prevChats, data]);
          setNewChatTitle('');
          setCurrentChatId(data.id);
          setIsAddingChat(false); // Hide the input field
          if (initialMessage) {
            sendMessageToChat(initialMessage, data.id);
          }
        }
      })
      .catch((error) => {
        alert(error.error);
      });
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    adjustTextareaHeight(event.target);
  };

  const adjustTextareaHeight = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const handleSuggestedQuestionClick = (question) => {
    handleSendMessage(question);
  };

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
          throw new Error("Fetching chats failed");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          setChats(data);
        }
      })
      .catch((error) => {
        alert(error.message);
        return;
      });
  }, [userToken]);

  const getConversations = useCallback((chatId) => {
    fetch(`${SERVER_URL}/chat/chats/${chatId}/conversations`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${userToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Fetching conversations failed");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          const newMessages = data.flatMap(convo => ([
            { text: convo.user_query, sender: 'user' },
            { text: convo.response, sender: 'bot' }
          ]));
          setMessages(newMessages);
          setChatMessages((prevChatMessages) => ({
            ...prevChatMessages,
            [chatId]: newMessages.length > 0,
          }));
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, [userToken]);



  useEffect(() => {
    if (userToken) {
      getChats();
    }
  }, [getChats, userToken]);

  const handleChatClick = (chatId) => {
    setCurrentChatId(chatId);
    getConversations(chatId);
  };

  const handleRenameChat = () => {
    if (!renameChatTitle.trim()) {
      alert('Chat title cannot be empty');
      return;
    }

    fetch(`${SERVER_URL}/chat/chats/${selectedChatId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${userToken}`,
      },
      body: JSON.stringify({ title: renameChatTitle }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Renaming chat failed');
        }
        return response.json();
      })
      .then((data) => {
        getChats();
        setIsRenameDialogOpen(false);
        setRenameChatTitle('');
        handleChatMenuClose();
      })
      .catch((error) => {
        alert(error.message);
      });
  };


  const handleDeleteChat = () => {
    fetch(`${SERVER_URL}/chat/chats/${selectedChatId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${userToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Deleting chat failed');
        }
        setChats((prevChats) => prevChats.filter(chat => chat.id !== selectedChatId));
        handleChatMenuClose();
        setMessages([]);
        setCurrentChatId(null);
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  function logout() {
    setUserToken(null);
    clearUserToken();
    clearUserName();
    clearUserEmail();
    navigate('App');
  }

  return (
    <Box className={`app-container ${open ? 'open' : 'closed'}`}>
      <AppBar className={`app-bar ${open ? 'open' : 'closed'}`} position="fixed">
        <Toolbar>
          {!open && (
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
            <MenuItem onClick={() => { handleMenuClose(); logout(); }}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

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
            <ListItem button key={chat.id} onClick={() => handleChatClick(chat.id)}>
              <ListItemText primary={chat.title} />
              <IconButton onClick={(event) => handleChatMenuOpen(event, chat.id)}>
                <MoreVertIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box className={`chat-content ${open ? 'open' : 'closed'}`}>
        {(!chatMessages[currentChatId] && suggestedQuestions.length > 0) && (
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
        )}
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
              event.preventDefault();
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

      <Menu
        anchorEl={menuAnchorEl}
        open={isChatMenuOpen}
        onClose={handleChatMenuClose}
      >
        <MenuItem onClick={() => { setIsRenameDialogOpen(true); handleChatMenuClose(); }}>Rename</MenuItem>
        <MenuItem onClick={handleDeleteChat}>Delete</MenuItem>
      </Menu>

      <Dialog open={isRenameDialogOpen} onClose={() => setIsRenameDialogOpen(false)}>
        <DialogTitle>Rename Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Chat Title"
            type="text"
            fullWidth
            value={renameChatTitle}
            onChange={(e) => setRenameChatTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRenameChat}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ChatPage;
