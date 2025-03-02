'use client'

import Image from 'next/image';
import React, { useState, useRef, useEffect } from "react";
import {
  Box, Stack, TextField, Button, Typography, Avatar, AppBar, Toolbar,
  createTheme, ThemeProvider, Fade, IconButton, CircularProgress,
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic'; // Import microphone icon
import StopIcon from '@mui/icons-material/Stop'; // Import stop icon
// import {
//   SignInButton,
//   SignedIn,
//   SignedOut,
//   UserButton,
//   useUser
// } from '@clerk/nextjs';

// Import your logo
import logo from '../public/logoV2.png'; // public pathway
import logo2 from '../public/logoV1.png'; // public pathway

// Theme customization based on logo colors
const logoColor = '#0a6826'; // This is green, dominant color in the logo
const theme = createTheme({
  palette: {
      primary: {
          main: '#091F62', // Dark blue, also in the logo
          contrastText: '#fff',  // White text for contrast
      },
      secondary: {
          main: '#0a6826',  // green, in the logo
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

const quickReplies = [
  "I need to certify a new aircraft design.",
  "What documents are needed for type certification?",
  "How do I demonstrate structural integrity?",
  "What are the emergency systems requirements?",
  "Tell me about production certification.",
  "What's required for airworthiness certification?",
  "Help me with system reliability assessment.",
  "I have a general certification question."
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCoverPage, setShowCoverPage] = useState(true);
  const [addedResultLine, setResults] = useState("");
  const [coverPageOpacity, setCoverPageOpacity] = useState(1);
  const [isListening, setIsListening] = useState(false); // State to manage listening status
  
  //These variables store the results of our queries that we have sent out.
  const [autismResultLine, setAutismResults] = useState("")
  const [dementiaResultLine, setDementiaResults] = useState("")
  const [arthritisResultLine, setArthritisResults] = useState("")
  const [copdResultLine, setCOPDResults] = useState("")
  const [hypertensionResultLine, setHypertensionResults] = useState("")
  const [hypoglycemiaResultLine, setHypoglycemiaResults] = useState("")
  const [pneumoniaResultLine, setPneumoniaResults] = useState("")
  const [lastQuery, setLastQuery] = useState("")
  // const { isSignedIn, user, isLoaded } = useUser();
  const recognitionRef = useRef(null); // Ref for the SpeechRecognition object

  // Initialize SpeechRecognition object
  useEffect(() => {
      // if (isLoaded) {
        let initialGreeting = "Hello! I'm the FAA Aircraft Certification Assistant. I can help determine if your aircraft design meets airworthiness requirements by collecting information and processing it through our certification engine. Select an option below or describe your aircraft to begin the certification process.";
          // if (isSignedIn && user) {
          //     initialGreeting = `Hello ${user.firstName || user.username || 'there'}! I'm the Aeros(CASP) certification support assistant. How can I help you today? You can use the options below to get started.`;
          // }

          setMessages([{
              role: "model",
              parts: [{ text: initialGreeting }]
          }]);
      // }
  }, );//[isLoaded, isSignedIn, user]);

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

  // Fade out the cover page after 1 second
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
  //function to send a message to the chatbot.
  //TTS effects
  const synthRef = useRef(null);

    useEffect(() => {
      synthRef.current = window.speechSynthesis;
      
      // Stop speech when switching tabs
      const handleVisibilityChange = () => {
          if (document.hidden) {
              synthRef.current?.cancel();
          }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
  }, []);

  // Function to speak the text
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);

      // Stop any ongoing speech before new message
      synthRef.current?.cancel();

      // Voice Selection
      const voices = synth.getVoices();
      if (voices.length > 0) {
          const preferredVoice = voices.find(voice => voice.name.includes('Ava')); // Example: looking for a voice that includes 'Ava'
          utterance.voice = preferredVoice || voices[0]; // Use preferred voice or default
      }

      // Configure speech
      utterance.rate = 2;     // Speech speed (0.1 - 10), lower for more natural pace
      utterance.pitch = 1.4;    // Speech pitch (0 - 2), adjust for a more natural tone
      utterance.volume = 0.8;   // Volume (0 - 1), adjust as needed

      synth.speak(utterance);
    } else {
        console.warn('Text-to-speech not supported in this browser.');
    }
  };

  // Function to start listening
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
        console.log("Speech Recognition Not Available")
        return;
    }

    // Stop any ongoing speech before new recording
    synthRef.current?.cancel();

    setIsListening(true);
    recognitionRef.current = new webkitSpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript;
            }
        }
        setMessage(transcript); // Set the transcribed message to the input
    };

    recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
    };

    recognitionRef.current.onend = () => {
        setIsListening(false);
    };

    recognitionRef.current.start();
  };

  // Function to stop listening
  const stopListening = () => {
      if (recognitionRef.current) {
          recognitionRef.current.stop();
          setIsListening(false);
      }
  };
  
  const parseQueryResults = async(queries) => {
    if(queries.length != 0)
    {
      setAutismResults("")
      setDementiaResults("")
      setArthritisResults("")
      setCOPDResults("")
      setHypertensionResults("")
      setHypoglycemiaResults("")
      setPneumoniaResults("")
      for(const oneQuery of queries)
      {
        console.log("query results: " + oneQuery)
        if(oneQuery.indexOf("no models") != -1 || oneQuery == "no.")
        {
          if(oneQuery.indexOf("has_autism") != -1)
          {
            setAutismResults("{SCREENING RESULTS: NO AUTISM}") 
          }
          else if(oneQuery.indexOf("has_dementia") != -1)
          {
            setDementiaResults("{SCREENING RESULTS: NO DEMENTIA}") 
          }
          else if(oneQuery.indexOf("has_ra") != -1)
          {
            setDementiaResults("{SCREENING RESULTS: NO ARTHRITIS}") 
          }
          else if(oneQuery.indexOf("has_copd") != -1)
          {
            setDementiaResults("{SCREENING RESULTS: NO COPD}") 
          }
          else if(oneQuery.indexOf("has_hyper_hypo_tension") != -1)
          {
            setDementiaResults("{SCREENING RESULTS: NO HYPERTENSION OR HYPOTENSION}") 
          }
          else if(oneQuery.indexOf("has_hypoglycemia") != -1)
          {
            setDementiaResults("{SCREENING RESULTS: NO HYPOGLYCEMIA}") 
          }
          else if(oneQuery.indexOf("has_pneumonia") != -1)
          {
            setDementiaResults("{SCREENING RESULTS: NO PNEUMONIA}") 
          }
        }
        else
        {
          const searchForPhrase = "Y = "
          const pointOfY = oneQuery.indexOf(searchForPhrase)
          if(oneQuery.indexOf("has_autism") != -1)
          {
            const severityLevel = parseInt(oneQuery.substring(pointOfY + searchForPhrase.length, pointOfY + searchForPhrase.length + 1)) - 4
            setAutismResults("{SCREENING RESULTS: POSSIBLE AUTISM. SEVERITY LEVEL: " + severityLevel + "}") 
          }
          else if(oneQuery.indexOf("has_dementia") != -1)
          {
            const startPoint = pointOfY + searchForPhrase.length
            const severityLevel = oneQuery.substring(startPoint, startPoint + 6)
            setDementiaResults("{SCREENING RESULTS: POSSIBLE DEMENTIA. SEVERITY LEVEL: " + severityLevel + "}")
          }
          else if(oneQuery.indexOf("has_ra") != -1)
          {
            const startPoint = pointOfY + searchForPhrase.length
            const severityLevel = oneQuery.substring(startPoint, oneQuery.length - 1)
            setDementiaResults("{SCREENING RESULTS: POSSIBLE ARTHRITIS. SEVERITY LEVEL: " + severityLevel + "}")
          }
          else if(oneQuery.indexOf("has_copd") != -1)
          {
            setDementiaResults("{SCREENING RESULTS: COPD MAY BE POSSIBLE. SHOULD BE MONITORED.}")
          }
          else if(oneQuery.indexOf("has_hyper_hypo_tension") != -1)
          {
            const startPoint = pointOfY + searchForPhrase.length
            const typeOfBpDisorder = oneQuery.substring(startPoint, oneQuery.length - 2)
            
            setDementiaResults("{SCREENING RESULTS: USER MAY HAVE " + typeOfBpDisorder + ". SHOULD BE MONITORED.}")
          }
          else if(oneQuery.indexOf("has_hypoglycemia") != -1)
          {
            const startPoint = pointOfY + searchForPhrase.length
            const severityLevel = oneQuery.substring(startPoint, oneQuery.length - 2)
            setDementiaResults("{SCREENING RESULTS: POSSIBLE HYPOGLYCEMIA. SEVERITY LEVEL: " + severityLevel + "}")
          }
          else if(oneQuery.indexOf("has_pneumonia") != -1)
          {
            setDementiaResults("{SCREENING RESULTS: PNEUMONIA MAY BE POSSIBLE. SHOULD BE MONITORED.}")
          }
        }
      }
    }
  }

  const sendMessage = async() => {
    //don't send empty messages
    if (!message.trim()) return;
    //add it to the messages array
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", parts: [{ text: message }] },
    ]);
    //reset message
    setMessage('');
    //show AI is typing
    setIsTyping(true);
    //try to get AI's response
    try {
      //reponse stores AIs' response.
      const trueUserMessage = "CURRENT QUERIES: " + lastQuery + "\nQUERY RESULTS (if any): "  + autismResultLine + "\n" + dementiaResultLine + "\n" + arthritisResultLine + "\n" + 
        copdResultLine + "\n" + hypertensionResultLine + "\n" + hypoglycemiaResultLine + 
        "\n" + pneumoniaResultLine + "\n" + "USER MESSAGE: " + message
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 'Content-Type': "application/json" },
        body: JSON.stringify([...messages, {role: "user", parts: [{text: trueUserMessage}]}])
      });
      setAutismResults("")
      setDementiaResults("")
      setArthritisResults("")
      setCOPDResults("")
      setHypertensionResults("")
      setHypoglycemiaResults("")
      setPneumoniaResults("")
      const data = await response.json();
      const botResponse = { role: "model", parts: [{ text: data.message }] };
      //add the ai's message to the history
      setMessages((prevMessages) => [...prevMessages, botResponse]);
      // Speak the bot's response
      speak(data.message);
      console.log("john query: " + data.conditionStatus)
      setLastQuery(data.conditionStatus)
      //if there was a query returned.
      parseQueryResults(data.queryResult)

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
            backgroundColor: '#091F62',
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
        {/* <ThemeProvider theme={theme}>
          <AppBar position="static">
            <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>              
                <Button color="inherit" href="/" sx={{ ml: 2 }}>
                  <Image src={logo} alt="Aeros(CASP) Logo" width={40} height={40} /><Typography variant="h6" fontWeight="600">
                    Aeros(CASP)
                  </Typography>
                </Button>
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
        </ThemeProvider> */}

        {/* Background Image ----------------------------------------------------------------------------------------------*/}
        <Image 
          src="/plane.gif" 
          alt="Background" 
          layout="fill"
          objectFit="cover"
          quality={100}
          style={{ 
            zIndex: -1,  // Ensures image is behind other content
            opacity: 0.8  // Makes background slightly transparent
          }}
        />

        {/* Chat Box ----------------------------------------------------------------------------------------------*/}
        <ThemeProvider theme={theme}>
          <Box sx={{
            position: 'fixed',
            top: "5%",
            left: "5%",
            width: "90%",
            height: "90%",
            borderRadius: 2,
            boxShadow: 5,
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
                  AeroBot
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
                        <Avatar alt="Aeros(CASP) Logo" src={logo.src} sx={{ mr: 1 }} /> // Use Image component
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
                    <Typography variant="body2" ml={1}>AeroBot is typing...</Typography>
                  </Box>
                )}
              </Box>

              {/* Quick replies ----------------------------------------------------------------------------------------------*/}
              <Box sx={{ overflowX: 'auto', display: 'flex', p: 2 }}>
                <Stack direction="row" spacing={2} flexWrap="nowrap">
                  {quickReplies.map((reply, index) => (
                    <Button 
                      key={index} 
                      variant="outlined" 
                      size="small" 
                      onClick={() => setMessage(reply)}
                      sx={{
                        minHeight: 'auto',
                        height: '30px',
                        p: 0.5,
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {reply}
                    </Button>
                  ))}
                </Stack>
              </Box>

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
                  <IconButton
                      color={isListening ? "error" : "primary"}
                      onClick={isListening ? stopListening : startListening}
                  >
                      {isListening ? <StopIcon /> : <MicIcon />}
                  </IconButton>
                </Stack>
                <Typography fontStyle="italic" sx={{ pt: 1, color: '#808080', textAlign: 'center' }}>
                  This bot is designed to assist wiht certification of aricrafts in accordance with FAA regulations.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </ThemeProvider>
      </Box>
    </Box>
  );
}
