'use client'

import Image from 'next/image';
import React, { useState, useRef, useEffect } from "react";
import {
  Box, Stack, TextField, Button, Typography, Avatar, AppBar, Toolbar,
  createTheme, ThemeProvider, Fade, IconButton, CircularProgress,
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';

// Import your logo
import logo from '../public/logoV2.png'; // public pathway
import logo2 from '../public/logoV1.png'; // public pathway

// Theme customization based on logo colors
const logoColor = '#39FF14'; // This is green, dominant color in the logo
const theme = createTheme({
  palette: {
    primary: {
      main: '#02023a', // Dark blue, also in the logo
      contrastText: '#fff',  // White text for contrast
    },
    secondary: {
      main: '#00C850',  // Lighter green, also in the logo
      contrastText: '#000', // Black text for contrast
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const quickReplies = ["I'd like a screening", "I think I have symptoms for autism", "I have a question", "I think I have symptoms for dementia"];

export default function Home() {
  const [messages, setMessages] = useState([{
    role: "model",
    parts: [{ text: "Hello! I'm the MediCASP medical support assistant. How can I help you today? You can use the options below to get started. " }]
  }]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCoverPage, setShowCoverPage] = useState(true);
  const [addedResultLine, setResults] = useState("")
  const [coverPageOpacity, setCoverPageOpacity] = useState(1);

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

  useEffect(() => {
    if (showCoverPage) {
      const timeoutId = setTimeout(() => {
        // Fade out effect
        let opacity = 1;
        const fadeOutInterval = setInterval(() => {
          opacity -= 0.05; // Adjust the fade speed here
          setCoverPageOpacity(opacity);
          if (opacity <= 0) {
            clearInterval(fadeOutInterval);
            setShowCoverPage(false); // Fully hide the cover page
          }
        }, 50); // Update opacity every 50ms
      }, 1000); // Wait for 1 second before fading
      const handleKeyPress = () => setShowCoverPage(false); // Hide on keypress
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
    setCoverPageOpacity(1); // Reset opacity when cover page shows
  }, [showCoverPage]);

  const sendMessage = async () => {
    console.log("Current line: " + addedResultLine)
    if (!message.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", parts: [{ text: message }] },
    ]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 'Content-Type': "application/json" },
        body: JSON.stringify([...messages, { role: "user", parts: [{ text: addedResultLine + "\n" + message }] }])
      });
      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "model", parts: [{ text: data.message }] }
      ]);
      if (data.autismStatus.indexOf("has_autism") == -1) {
        console.log("HELP IN GAIA")
      }
      console.log("john query: " + data.autismStatus.substring(data.autismStatus.indexOf("has_autism"), data.autismStatus.length - 1))
      if (data.queryResult.length != 0) {
        setResults("")
        console.log("query result: " + data.queryResult)
        if (data.queryResult.indexOf("no models") != -1) {
          setResults("{SCREENING RESULTS: NO AUTISM}")
        }

        else {

          const searchForPhrase = "Y = "
          const pointOfY = data.queryResult.indexOf(searchForPhrase)
          const severityLevel = parseInt(data.queryResult.substring(pointOfY + searchForPhrase.length, pointOfY + searchForPhrase.length + 1)) - 4
          setResults("{SCREENING RESULTS: POSSIBLE AUTISM. SEVERITY LEVEL: " + severityLevel + "}")
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
      {/* coverpage ----------------------------------------------------------------------------------------------*/}
      {showCoverPage && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#020221',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            opacity: coverPageOpacity,
            transition: 'opacity 0.2s ease-in-out' // Add transition for smooth fade
          }}
          onClick={() => setShowCoverPage(false)}
        >
          <Image
            src="/logoV1.png"
            alt="Enter Site"
            width={850}
            height={850}
            style={{ objectFit: 'contain' }}
          />
        </Box>
      )}
      {/* Rest of JSX */}

      <Box sx={{ position: 'relative', width: '100vw', height: '100vh' }}>
        {/* navibar ----------------------------------------------------------------------------------------------*/}
        <ThemeProvider theme={theme}>
          <AppBar position="static">
            <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>              
              {/* <Box style={{ display: 'flex', alignItems: 'center' }}> */}
                <Button color="inherit" href="/" sx={{ ml: 2 }}>
                  <Image src={logo} alt="MediCASP Logo" width={40} height={40} /><Typography variant="h6" fontWeight="600">
                    MediCASP
                  </Typography>
                </Button>
              {/* </Box> */}
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                <Button color="inherit" href="/about" sx={{ ml: 2 }}>
                  About
                </Button>
                  <SignedOut>
                    <Button color="inherit" href="/login">{' '}Login</Button>
                    <Button color="inherit" href="/sign-up">{' '}Sign Up</Button>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
              </Box>
            </Toolbar>
          </AppBar>
        </ThemeProvider>

        {/* Background Image ----------------------------------------------------------------------------------------------*/}
        <Image 
          src="/mdcsp_bckgrnd.png" 
          alt="Background" 
          layout="fill"
          objectFit="cover"
          quality={100}
          style={{ 
            zIndex: -1,  // Ensures image is behind other content
            opacity: 0.4 // Makes background slightly transparent
          }}
        />

        {/* Chat Box ----------------------------------------------------------------------------------------------*/}
        <ThemeProvider theme={theme}>
          <Box sx={{
            position: 'fixed',
            top: "12%",
            left: "5%",
            width: "90%",
            height: "83%",
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}>
            <Stack direction="column" height="100%">
              {/* Header ----------------------------------------------------------------------------------------------*/}
              <Box sx={{
                p: 2,
                bgcolor: 'primary.main',
                color: 'white',
              }}>
                <Typography variant="h6" fontWeight="600">
                  MediBot
                </Typography>
              </Box>

              {/* Chat messages ----------------------------------------------------------------------------------------------*/}
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
                        <Avatar alt="MediCASP Logo" src={logo.src} sx={{ mr: 1 }} /> // Use Image component
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

              {/* Quick replies ----------------------------------------------------------------------------------------------*/}
              <Stack direction="row" spacing={2} p={2}>
                {quickReplies.map((reply, index) => (
                  <Button key={index} variant="outlined" size="small" onClick={() => setMessage(reply)}>
                    {reply}
                  </Button>
                ))}
              </Stack>

              {/* Input area ----------------------------------------------------------------------------------------------*/}
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
                <Typography fontStyle="italic" sx={{ pt: 1, color: '#808080', textAlign: 'center' }}>
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
