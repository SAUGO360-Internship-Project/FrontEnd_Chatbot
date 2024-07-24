import React, { useState, useCallback, useEffect, useContext } from 'react';
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
import { clearUserEmail, clearUserName, clearUserToken, getUserName, getUserToken } from '../localStorage';
import './ChatPage.css';
import AuthContext from '../AuthContext';
import DOMPurify from 'dompurify';
import DynamicComponentLoader from '../components/DynamicComponentLoader';
import PdfUploadComponent from '../components/PdfComponent';
import { SERVER_URL } from '../App';

const drawerWidth = 240;

function ChatPage() {
  let [open, setOpen] = useState(true);
  let [messages, setMessages] = useState([]);
  let [userToken, setUserToken] = useState(getUserToken());
  let [username, setUserName] = useState(getUserName())
  let [suggestedQuestions, setSuggestedQuestions] = useState([
    'What are the top-rated restaurants?',
    'Generate a pie chart of the number of consumers in each city?',
    'Generate a bar chart comparing the ratings of restaurants?',
    'can you give me the location of cafe ambar?'
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
  let [loadingFB, setLoadingFB] = useState(false);
  let [feedbackComment, setFeedbackComment] = useState('');
  let [snackbarOpen, setSnackbarOpen] = useState(false);
  let [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  let [feedbackStatus, setFeedbackStatus] = useState({});
  let [conversationId, setConversationId] = useState(null);
  let [isUpdateFeedbackDialogOpen, setIsUpdateFeedbackDialogOpen] = useState(false);
  let [updateFeedbackComment, setUpdateFeedbackComment] = useState('');


  const isMenuOpen = Boolean(anchorEl);
  const isChatMenuOpen = Boolean(menuAnchorEl);
  const { setAuth } = useContext(AuthContext);
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
  };

  const handleChatClick = (chatId) => {
    setActiveChatId(chatId);
    getConversations(chatId);
    getFeedback();
  };

  const renderMessages = (message) => {
    let processedText = message.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    if (message.sender !== 'user') {
      if (message.text.startsWith('<table border')) {
        const sanitizedHtml = DOMPurify.sanitize(message.text);
        // Case 1: Render the table if the message contains a table
        return (
          <Paper className='messages-content' sx={{ padding: 2, backgroundColor: message.sender === 'user' ? '#F7DCB9' : '#FEFAF6' }}>
            <Box dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
          </Paper>
        );
      } else if (message.chartname !== 'None' && (message.text.startsWith(`Here is your ${message.chartname}`) || message.text.startsWith("Here is your heatmap"))) {
        // Case 2: Render the chart if chartname is not "None" and there's no table
        return (
          <Paper className='messages-content' sx={{ padding: 2, backgroundColor: message.sender === 'user' ? '#F7DCB9' : '#FEFAF6' }}>
            <DynamicComponentLoader codeString={message.text} />
          </Paper>
        );
      } else if (message.location === 'Yes' && (message.text.startsWith("Here is the map to") || message.text.startsWith("Here is your requested area"))) {
        // Case 3: Render the map if location is "Yes" and there's no table or chart
        return (
          <Paper className='messages-content' sx={{ padding: 2, backgroundColor: message.sender === 'user' ? '#F7DCB9' : '#FEFAF6' }}>
            <DynamicComponentLoader codeString={message.text} />
          </Paper>
        );
      } else {
        // Case 4: Render the text if none of the above conditions are met
        return (
          <Paper className='messages-content' sx={{ padding: 2, backgroundColor: message.sender === 'user' ? '#F7DCB9' : '#FEFAF6' }}>
            <Typography dangerouslySetInnerHTML={{ __html: processedText }} />
          </Paper>
        );
      }
    } else {
      return (
        <Paper className='messages-content' sx={{ padding: 2, backgroundColor: message.sender === 'user' ? '#F7DCB9' : '#FEFAF6' }}>
          <Typography dangerouslySetInnerHTML={{ __html: processedText }} />
        </Paper>
      );

    }
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
        setActiveChatId(data.id);
        getConversations(data.id);
      })
      .catch((error) => {
        alert(error.message);
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
        if (response.status === 201) {
          console.log(response);
        }
        else if (response.status === 403) {
          throw new Error("sensitive content, data altering or unrelevant answers are prohibited!")
        }
        else if (!response.ok) {
          throw new Error("Couldn't send a question, try again later");
        }
        return response.json();
      })
      .then((data) => {
        const responseMessage = { text: data.message, sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, responseMessage]);
        setLoading(false);
        setChatMessages((prevChatMessages) => ({
          ...prevChatMessages,
          [chatId]: true,
        }));
        getConversations(chatId)

        // Scroll to bottom after receiving a response
        setTimeout(() => {
          const chatContent = document.querySelector('.chat-content');
          chatContent.scrollTop = chatContent.scrollHeight;
        }, 100);
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message);
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
        Authorization: `bearer ${userToken}`,
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
        Authorization: `bearer ${userToken}`,
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
            { text: convo.user_query, sender: 'user', id: convo.id, chartname: convo.chartname, location: convo.location },
            { text: convo.response, sender: 'bot', id: convo.id, chartname: convo.chartname, location: convo.location }
          ]));
          setMessages(newMessages);
          setChatMessages((prevChatMessages) => ({
            ...prevChatMessages,
            [chatId]: newMessages.length > 0,
          }));
        }
      })
      .catch((error) => {
        alert(error.message);
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

  const handleThumbUp = (conversationId) => {
    if (feedbackStatus[conversationId] === 'positive') {
      return;
    }

    fetch(`${SERVER_URL}/chat/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${userToken}`,
      },
      body: JSON.stringify({
        conversation_id: conversationId,
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
        setFeedbackStatus((prevStatus) => ({
          ...prevStatus,
          [conversationId]: 'positive',
        }));
        getFeedback();
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const handleThumbDown = (convID) => {
    setConversationId(convID);
    if (feedbackStatus[convID] === undefined) {
      setIsFeedbackDialogOpen(true);
    }
    if (feedbackStatus[convID] === 'negative') {
      setIsUpdateFeedbackDialogOpen(true);
    }
  }
  const handleFeedbackSubmit = () => {

    if (loading) {
      return;
    }
    setLoadingFB(true);

    fetch(`${SERVER_URL}/chat/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${userToken}`,
      },
      body: JSON.stringify({
        conversation_id: conversationId,
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
      .then((data) => {
        setSnackbarOpen(true);
        setIsFeedbackDialogOpen(false);
        setFeedbackComment('');
        setLoadingFB(false);
        setFeedbackStatus((prevStatus) => ({
          ...prevStatus,
          [conversationId]: 'negative',
        }));

        getFeedback();
      })
      .catch((error) => {
        alert(error.message);
        setLoadingFB(false);
      });
  };

  const handleUpdateFeedbackSubmit = () => {
    if (loadingFB) {
      return;
    }
    setLoadingFB(true);

    fetch(`${SERVER_URL}/chat/conversations/${conversationId}/feedback`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${userToken}`,
      },
      body: JSON.stringify({
        feedback_comment: updateFeedbackComment,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Updating feedback failed");
        }
        return response.json();
      })
      .then((data) => {
        setSnackbarOpen(true);
        setIsUpdateFeedbackDialogOpen(false);
        setUpdateFeedbackComment('');
        setLoadingFB(false);
        setFeedbackStatus((prevStatus) => ({
          ...prevStatus,
          [conversationId]: 'negative',
        }));
      })
      .catch((error) => {
        alert(error.message);
        setLoadingFB(false);
      });
  };

  const getFeedback = useCallback(() => {
    fetch(`${SERVER_URL}/chat/feedback`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${userToken}`,
      },
    })
      .then((response) => {
        if (response.status === 404) {
          setLoading(false);
          return
        }
        else if (!response.ok) {
          throw new Error("Fetching Feedback failed");
        }
        return response.json();
      })
      .then((data) => {
        if (!data || data.length === 0) {
          setLoadingFB(false);
          return;
        }

        const conversationIDs = data.map(feedback => feedback.conversation_id);
        conversationIDs.forEach(conversationId => {
          const specificFeedback = data.find(feedback => feedback.conversation_id === conversationId);
          if (specificFeedback) {
            setFeedbackStatus((prevStatus) => ({
              ...prevStatus,
              [conversationId]: specificFeedback.feedback_type,
            }));

            if (specificFeedback.feedback_type === 'negative') {
              setUpdateFeedbackComment(specificFeedback.feedback_comment);
            }
          }
        });
        setLoadingFB(false);
      })
      .catch((error) => {
        alert(error.message);
        setLoadingFB(false);
      });
  }, [userToken]);

  useEffect(() => {
    if (userToken) {
      getFeedback();
    }
  }, [getFeedback, userToken]);

  function logout() {
    setUserToken(null);
    setUserName('')
    clearUserToken();
    clearUserName();
    clearUserEmail();
    setSuggestedQuestions('');
    setAuth(null);
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
          <Typography color='seconday' variant="h6" noWrap>
            Intel Chatbot
          </Typography>
          <PdfUploadComponent />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <AccountCircleIcon /> {username}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={()=> navigate('/pages/ProfilePage')}>Profile</MenuItem>
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
            {renderMessages(message)}
            {message.sender === 'bot' && (
              <Box className='feedback-Icon' sx={{ display: 'block', mt: 1 }}>
                <IconButton
                  onClick={() => handleThumbUp(message.id)}
                  disabled={feedbackStatus[message.id] !== undefined}
                >
                  <ThumbUpIcon color={feedbackStatus[message.id] === 'positive' ? 'primary' : 'inherit'} />
                </IconButton>
                <IconButton
                  onClick={() => handleThumbDown(message.id)}
                  disabled={feedbackStatus[message.id] === 'positive'}
                >
                  <ThumbDownIcon color={feedbackStatus[message.id] === 'negative' ? 'primary' : 'inherit'} />
                </IconButton>

              </Box>
            )}
          </Box>
        ))}
        <Dialog
          open={isFeedbackDialogOpen}
          onClose={() => setIsFeedbackDialogOpen(false)}
        >
          <DialogTitle >Provide Feedback</DialogTitle>
          <DialogContent>
            <TextField
              label="Comment (optional)"
              multiline
              rows={4}
              fullwidth
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              disabled={loadingFB}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsFeedbackDialogOpen(false)} disabled={loadingFB}>Cancel</Button>
            <Button onClick={handleFeedbackSubmit} disabled={loadingFB} color="primary">Submit</Button>
            {loadingFB && (
              <div className='loading-indicator'>
                <CircularProgress />
              </div>
            )}
          </DialogActions>
        </Dialog>

        <Dialog
          open={isUpdateFeedbackDialogOpen}
          onClose={() => setIsUpdateFeedbackDialogOpen(false)}
        >
          <DialogTitle >Update Your Feedback</DialogTitle>
          <DialogContent>
            <TextField
              label="Comment (optional)"
              multiline
              rows={4}
              fullwidth
              value={updateFeedbackComment}
              onChange={(e) => setUpdateFeedbackComment(e.target.value)}
              disabled={loadingFB}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsUpdateFeedbackDialogOpen(false)} disabled={loadingFB}>Cancel</Button>
            <Button onClick={handleUpdateFeedbackSubmit} disabled={loadingFB} color="primary">Submit</Button>
            {loadingFB && (
              <div className='loading-indicator'>
                <CircularProgress />
              </div>
            )}
          </DialogActions>
        </Dialog>

      </Box>


      <div className={`chat-box-container ${open ? 'open' : 'closed'}`}>
        <textarea className='chat-input'
          variant="outlined"
          placeholder="Type a message..."
          fullwidth
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
            fullwidth
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
