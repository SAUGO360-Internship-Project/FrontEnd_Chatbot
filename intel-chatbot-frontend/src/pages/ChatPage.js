import React, { useState, useCallback, useEffect } from 'react';
import { Box, Menu, MenuItem, Snackbar, Drawer, List, ListItem, ListItemText, AppBar, Toolbar, Typography, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from '@mui/material';
import {
  Menu as MenuIcon,
  Send as SendIcon,
  AccountCircle as AccountCircleIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { clearUserEmail, clearUserName, clearUserToken, getUserToken } from '../localStorage';

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
  let [activeChatId, setActiveChatId] = useState(null);
  let [menuAnchorEl, setMenuAnchorEl] = useState(null);
  let [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  let [renameChatTitle, setRenameChatTitle] = useState('');
  let [chatMessages, setChatMessages] = useState({});
  let [loading, setLoading] = useState(false);
  let [feedbackComment, setFeedbackComment] = useState('');
  let [snackbarOpen, setSnackbarOpen] = useState(false);
  let [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

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
    setActiveChatId(chatId);
  };

  const handleChatMenuClose = () => {
    setMenuAnchorEl(null);
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
    console.log(chats);
  };

  const handleChatClick = (chatId) => {
    setActiveChatId(chatId);
    getConversations(chatId);
  };

  const createChat = (title, initialMessage) => {
    fetch(`${SERVER_URL}/chat/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${userToken}`
      },
      body: JSON.stringify({ title: title }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Creating a chat failed");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          setChats((prevChats) => {
            if (!Array.isArray(prevChats)) return [data];
            return [...prevChats, data];
          });
          setNewChatTitle('');
          setActiveChatId(data.id);
          getChats();
          setIsAddingChat(false);
          if (initialMessage) {
            sendMessageToChat(initialMessage, data.id);
          }
        }
      })
      .catch((error) => {
        alert(error.error);
      });
  };


  const generateChatTitle = (message) => {
    const words = message.split(' ');
    const title = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
    return title;
  };


  const handleSendMessage = (message) => {
    if (!message || loading) {
      return;
    }

    const newMessage = { text: message, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');
    setLoading(true);

    if (!activeChatId) {
      const generatedTitle = generateChatTitle(message);
      createChat(generatedTitle, message);
    } else {
      sendMessageToChat(message, activeChatId);
    }

    setChatMessages((prevChatMessages) => ({
      ...prevChatMessages,
      [activeChatId]: true,
    }));

    setTimeout(() => {
      const chatContent = document.querySelector('.chat-content');
      chatContent.scrollTop = chatContent.scrollHeight;
    }, 100);
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
        setLoading(false);
        setChatMessages((prevChatMessages) => ({
          ...prevChatMessages,
          [chatId]: true,
        }));

        // Scroll to bottom after receiving a response
        setTimeout(() => {
          const chatContent = document.querySelector('.chat-content');
          chatContent.scrollTop = chatContent.scrollHeight;
        }, 100);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  const categorizeChats = (chats) => {
    const categorizedChats = {
      today: [],
      yesterday: [],
      last7Days: [],
      earlier: [],
    };

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDaysAgo = new Date(now.getTime() - 7 * oneDay);

    chats.forEach(chat => {
      const chatDate = new Date(chat.created_at);
      const chatDay = chatDate.getDate();
      const chatMonth = chatDate.getMonth();
      const chatYear = chatDate.getFullYear();

      if (chatYear === now.getFullYear() && chatMonth === now.getMonth() && chatDay === now.getDate()) {
        categorizedChats.today.push(chat);
      } else if (chatYear === now.getFullYear() && chatMonth === now.getMonth() && chatDay === (now.getDate() - 1)) {
        categorizedChats.yesterday.push(chat);
      } else if (chatDate >= sevenDaysAgo) {
        categorizedChats.last7Days.push(chat);
      } else {
        categorizedChats.earlier.push(chat);
      }
    });

    // Sort each category by creation date in descending order
    Object.keys(categorizedChats).forEach(category => {
      categorizedChats[category].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    });

    return categorizedChats;
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
          setChats(categorizeChats(data));
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



  const handleRenameChat = () => {
    if (!renameChatTitle.trim()) {
      alert('Chat title cannot be empty');
      return;
    }

    fetch(`${SERVER_URL}/chat/chats/${activeChatId}`, {
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
    fetch(`${SERVER_URL}/chat/chats/${activeChatId}`, {
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
        setChats((prevChats) => {
          if (!Array.isArray(prevChats)) return prevChats;
          return prevChats.filter(chat => chat.id !== activeChatId);
        });
        handleChatMenuClose();
        setMessages([]);
        setActiveChatId(null);
        setChatMessages((prevChatMessages) => {
          const { [activeChatId]: _, ...rest } = prevChatMessages;
          return rest;
        });
        getChats();
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  //fix the feedback for different conversations,put the button under the response, regenerate the reponse if the feedback was negative
  const handleThumbUp = () => {
    fetch(`${SERVER_URL}/chat/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${userToken}`,
      },
      body: JSON.stringify({
        conversation_id: activeChatId,
        feedback_type: 'positive'
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Submitting feedback failed");
        }
        return response.json();
      })
      .then(() => {
        setSnackbarOpen(true);
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const handleFeedbackSubmit = () => {
    fetch(`${SERVER_URL}/chat/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${userToken}`,
      },
      body: JSON.stringify({
        conversation_id: activeChatId,
        feedback_type: 'negative',
        feedback_comment: feedbackComment,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Submitting feedback failed");
        }
        return response.json();
      })
      .then(() => {
        setSnackbarOpen(true);
        setIsFeedbackDialogOpen(false);
        setFeedbackComment('');
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={('Thank you for your feedback')}
      />
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
          {['today', 'yesterday', 'last7Days', 'earlier'].map((category) => (
            <React.Fragment key={category}>
              {chats[category]?.length > 0 && (
                <>
                  <ListItem>
                    <Typography variant="subtitle1" className="period-title">
                      {category === 'today' && 'Today'}
                      {category === 'yesterday' && 'Yesterday'}
                      {category === 'last7Days' && 'Last 7 Days'}
                      {category === 'earlier' && 'Earlier'}
                    </Typography>
                  </ListItem>
                  {chats[category].map((chat) => (
                    <ListItem button key={chat.id} onClick={() => handleChatClick(chat.id)}
                      className={activeChatId === chat.id ? 'active-chat' : ''}>
                      <ListItemText primary={chat.title} />
                      <IconButton onClick={(event) => handleChatMenuOpen(event, chat.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      <Box className={`chat-content ${open ? 'open' : 'closed'}`}>
        {(!chatMessages[activeChatId] && suggestedQuestions.length > 0) && (
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
              maxWidth: '800px',
            }}
          >
            <Paper className='messages-content' sx={{ padding: 2, backgroundColor: message.sender === 'user' ? '#bbdefb' : '#e3f2fd' }}>
              <Typography>{message.text}</Typography>
            </Paper>
            {message.sender === 'bot' && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <IconButton color="primary" onClick={handleThumbUp}>
                  <ThumbUpIcon className='feedback-Icon' />
                </IconButton>
                <IconButton color="primary" onClick={() => setIsFeedbackDialogOpen(true)}>
                  <ThumbDownIcon className='feedback-Icon' />
                </IconButton>
              </Box>
            )}
          </Box>
        ))}
        <Dialog
          open={isFeedbackDialogOpen}
          onClose={() => setIsFeedbackDialogOpen(false)}
        >
          <DialogTitle sx={{ width: '500px' }}>Provide Feedback</DialogTitle>
          <DialogContent>
            <TextField
              label="Comment (optional)"
              multiline
              rows={4}
              fullWidth
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsFeedbackDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleFeedbackSubmit} color="primary">Submit</Button>
          </DialogActions>
        </Dialog>

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
          disabled={loading}
        />
        <IconButton
          color="primary"
          onClick={() => handleSendMessage(inputValue)}
          disabled={loading}
        >
          <SendIcon />
        </IconButton>
        {loading && (
          <div className="loading-indicator">
            <CircularProgress />
          </div>
        )}
      </div>

      <Menu
        anchorEl={menuAnchorEl}
        open={isChatMenuOpen}
        onClose={handleChatMenuClose}
      >
        <MenuItem onClick={() => { setIsRenameDialogOpen(true); handleChatMenuClose(); }}>
          <EditIcon sx={{ color: 'gray', margin: '5px' }}></EditIcon>
          Rename</MenuItem>
        <MenuItem onClick={handleDeleteChat}>
          <DeleteIcon sx={{ color: 'gray', margin: '5px' }}></DeleteIcon>
          Delete</MenuItem>
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
