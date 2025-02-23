'use client'
import Image from 'next/image';
import React, { useState, useRef, useEffect } from "react";
import { 
  Box, Stack, TextField, Button, Typography, Avatar, 
  createTheme, ThemeProvider, Fade, IconButton, CircularProgress 
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';

const theme = createTheme({
  palette: {
    primary: { main: '#02023a' },
    secondary: { main: '#00C850' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
  },
});

const quickReplies = ["I'd like a screening" , "I think I have symptoms for autism", "I have a question", "I think I have symptoms for dementia"];

export default function Home() {
  const [messages, setMessages] = useState([{
    role: "model",
    parts: [{text: "Hello! I'm the MediCASP screening support assistant. How can I help you today? You can use the options below to get started. "}]
  }]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCoverPage, setShowCoverPage] = useState(true);
  //These variables store the results of our queries that we have sent out.
  const [autismResultLine, setAutismResults] = useState("")
  const [dementiaResultLine, setDementiaResults] = useState("")

  // Ref for the chat box
  const chatBoxRef = useRef(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop =
        chatBoxRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  //function to send a message to the chatbot.
  const sendMessage = async() => {
    console.log("Current autism line: "  + autismResultLine)
    //don't send empty messages
    if (!message.trim()) return;
    //add it to the messages array
    setMessages((prevMessages) => [
      ...prevMessages,
      {role: "user", parts: [{text: message}]},
    ]);
    //reset message
    setMessage('');
    //show AI is typing
    setIsTyping(true);
    //try to get AI's response
    try {
      //reponse stores AIs' response.
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {'Content-Type': "application/json"},
        body: JSON.stringify([...messages, {role: "user", parts: [{text: autismResultLine + "\n" + dementiaResultLine + "\n" + message}]}])
      });
      const data = await response.json();
      //add the ai's message to the history
      setMessages((prevMessages) => [
        ...prevMessages,
        {role: "model", parts: [{text: data.message}]}
      ]);
      console.log("john query: " + data.conditionStatus)
      //if there was a query returned.
      if(data.queryResult.length != 0)
      {
        setAutismResults("")
        setDementiaResults("")
        for(const oneQuery of data.queryResult)
        {
          console.log("query results: " + oneQuery)
          if(oneQuery.indexOf("no models") != -1)
          {
            setAutismResults("{SCREENING RESULTS: NO AUTISM}") 
          }
          else
          {
            const searchForPhrase = "Y = "
            const pointOfY = oneQuery.indexOf(searchForPhrase)
            const severityLevel = parseInt(oneQuery.substring(pointOfY + searchForPhrase.length, pointOfY + searchForPhrase.length + 1)) - 4
            setAutismResults("{SCREENING RESULTS: POSSIBLE AUTISM. SEVERITY LEVEL: " + severityLevel + "}") 
          }
        }
      }

    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* coverpage */}
    {showCoverPage && (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setShowCoverPage(false)}
        >
      </Box>
    )}
    {/* Rest of JSX */}
  
      <Box sx={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Background Image */}
        <ThemeProvider theme={theme}>
          <Box sx={{
            position: 'fixed',
            top: "4%",
            left: "5%",
            width: "90%",
            height: "90%",
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}>
            <Stack direction="column" height="100%">
              {/* Header */}
              <Box sx={{
                p: 2,
                bgcolor: 'primary.main',
                color: 'white',
              }}>
                <Typography variant="h6" fontWeight="600">
                  MediCASP Bot
                </Typography>
              </Box>

              {/* Chat messages */}
              <Box sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 2,
              }}
              ref={chatBoxRef} // Attach ref to chat box
              >
                {messages.map((message, index) => (
                  <Fade key={index} in={true} timeout={500}>
                    <Box 
                      display="flex" 
                      justifyContent={message.role === "model" ? 'flex-start' : 'flex-end'}
                      mb={2}
                    >
                      {message.role === "model" && (
                        <Avatar alt="Logo" sx={{ bgcolor: 'primary.main', mr: 1 }}>B</Avatar>
                      )}
                      <Box 
                        bgcolor={message.role === 'model' ? 'primary.light' : 'secondary.light'} 
                        color={message.role === 'model' ? 'primary.contrastText' : 'secondary.contrastText'}
                        p={2}
                        borderRadius={2}
                        maxWidth="70%"
                      >
                        <Typography variant="body2">
                          {message.parts[0].text}
                        </Typography>
                      </Box>
                      {message.role === "user" && (
                        <Avatar sx={{ bgcolor: 'secondary.main', ml: 1 }}>U</Avatar>
                      )}
                    </Box>
                  </Fade>
                ))}
                {isTyping && (
                  <Box display="flex" alignItems="center" mt={1}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" ml={1}>Bot is typing...</Typography>
                  </Box>
                )}
              </Box>

              {/* Quick replies */}
              <Stack direction="row" spacing={2} p={2}>
                {quickReplies.map((reply, index) => (
                  <Button key={index} variant="outlined" size="small" onClick={() => setMessage(reply)}>
                    {reply}
                  </Button>
                ))}
              </Stack>

              {/* Input area */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && message.trim()) {
                        sendMessage();
                      }
                    }}
                  />
                  <IconButton color="primary" onClick={() => {
                    sendMessage(); 
                    }} disabled={!message.trim()}>
                    <SendIcon />
                  </IconButton>
                </Stack>
                <Typography fontStyle="italic" sx={{ pt:1 , color: '#808080', textAlign: 'center' }}>
                  This bot is designed to provide insights into a patients case of autism, it does not replace a real doctor!              
                </Typography>
              </Box>
            </Stack>
          </Box>
        </ThemeProvider>
      </Box>
    </Box> 
  );
}