import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, Settings, Users, MessageSquare, PhoneOff } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

// Define types for the Zoom SDK
declare global {
  interface Window {
    ZoomMtg: any;
  }
}

interface ZoomIntegrationProps {
  meetingNumber?: string;
  userName?: string;
  userEmail?: string;
  meetingPassword?: string;
  leaveUrl?: string;
  role?: number; // 0 for attendee, 1 for host
}

const ZoomIntegration = ({
  meetingNumber: propMeetingNumber = "",
  userName: propUserName = "Student User",
  userEmail: propUserEmail = "student@example.com",
  meetingPassword: propMeetingPassword = "",
  leaveUrl = window.location.origin,
  role = 0
}: ZoomIntegrationProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState(propMeetingNumber);
  const [userName, setUserName] = useState(propUserName);
  const [userEmail, setUserEmail] = useState(propUserEmail);
  const [password, setPassword] = useState(propMeetingPassword);
  const [loading, setLoading] = useState(false);
  
  const zoomContainer = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Your Zoom SDK credentials
  const apiKey = import.meta.env.VITE_ZOOM_SDK_KEY || "";
  
  // Load the Zoom SDK
  useEffect(() => {
    if (document.getElementById('zoom-wasm') || window.ZoomMtg) {
      console.log('Zoom SDK already loaded');
      setIsLoaded(true);
      return;
    }
    
    // Create script element to load Zoom SDK
    const script = document.createElement("script");
    script.id = 'zoom-wasm';
    script.src = "https://source.zoom.us/2.18.0/lib/vendor/react.min.js";
    script.async = true;
    document.body.appendChild(script);
    
    script.onload = () => {
      const scriptDOM = document.createElement("script");
      scriptDOM.id = 'zoom-wasm';
      scriptDOM.src = "https://source.zoom.us/2.18.0/lib/vendor/react-dom.min.js";
      scriptDOM.async = true;
      document.body.appendChild(scriptDOM);
      
      scriptDOM.onload = () => {
        const scriptZoom = document.createElement("script");
        scriptZoom.id = 'zoom-wasm';
        scriptZoom.src = "https://source.zoom.us/2.18.0/zoom-meeting-embedded-2.18.0.min.js";
        scriptZoom.async = true;
        document.body.appendChild(scriptZoom);
        
        scriptZoom.onload = () => {
          console.log("Zoom SDK loaded");
          setIsLoaded(true);
          
          // Initialize the Zoom SDK
          window.ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
          window.ZoomMtg.preLoadWasm();
          window.ZoomMtg.prepareWebSDK();
          // Set language
          window.ZoomMtg.i18n.load('en-US');
          window.ZoomMtg.i18n.reload('en-US');
        };
        
        scriptZoom.onerror = () => {
          setError("Failed to load Zoom SDK");
          toast({
            title: "Error",
            description: "Failed to load Zoom SDK",
            variant: "destructive",
          });
        };
      };
    };
    
    return () => {
      // Cleanup
      if (window.ZoomMtg) {
        window.ZoomMtg.endMeeting();
      }
      
      const zoomScripts = document.querySelectorAll('#zoom-wasm');
      zoomScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, []);
  
  // Function to generate a Zoom signature
  const generateSignature = async (meetingNumber: string) => {
    try {
      // Call our backend API to generate the signature securely
      const response = await fetch('http://localhost:3001/api/zoom-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingNumber, role }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate meeting signature');
      }
      
      const data = await response.json();
      return data.signature;
    } catch (error) {
      console.error('Error generating signature:', error);
      throw error; // Rethrow to handle in the calling function
    }
  };
  
  // Join meeting function
  const joinMeeting = async () => {
    if (!isLoaded) {
      toast({
        title: "SDK Not Loaded",
        description: "Please wait for the Zoom SDK to load",
        variant: "destructive",
      });
      return;
    }
    
    if (!meetingId) {
      toast({
        title: "Missing Information",
        description: "Meeting ID is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const signature = await generateSignature(meetingId);
      
      console.log("Joining meeting with:", {
        meetingId,
        userName,
        password: password ? "***" : "(empty)", // Don't log actual password but show if it's empty
      });
      
      window.ZoomMtg.init({
        leaveUrl: leaveUrl,
        disableCORP: !window.crossOriginIsolated, // Handle CORP settings
        screenShare: true,
        isSupportChat: true,
        isSupportQA: true,
        isSupportBreakout: true,
        isSupportPolling: true,
        isSupportCC: true,
        isSupportNonverbal: true,
        success: () => {
          const joinParams = {
            signature: signature,
            meetingNumber: meetingId,
            userName: userName,
            userEmail: userEmail,
            apiKey: apiKey,
            success: () => {
              console.log("Joined meeting successfully");
              setIsJoined(true);
              setLoading(false);
              toast({
                title: "Success",
                description: "Joined the Zoom meeting successfully",
              });
            },
            error: (error: any) => {
              console.error("Failed to join meeting:", error);
              let errorMessage = error.errorMessage || "Unknown error";
              
              // Provide more specific error messages for password issues
              if (errorMessage.toLowerCase().includes("password") || error.errorCode === 3008) {
                errorMessage = "Meeting password is incorrect. Please check the password and try again.";
              }
              
              setError("Failed to join meeting: " + errorMessage);
              setLoading(false);
              toast({
                title: "Error",
                description: "Failed to join meeting: " + errorMessage,
                variant: "destructive",
              });
            }
          };
          
          // Only add password if it's provided
          if (password && password.trim() !== "") {
            joinParams.passWord = password.trim();
          }
          
          window.ZoomMtg.join(joinParams);
        },
        error: (error: any) => {
          console.error("Failed to initialize Zoom:", error);
          setError("Failed to initialize Zoom: " + error.errorMessage);
          setLoading(false);
          toast({
            title: "Error",
            description: "Failed to initialize Zoom: " + error.errorMessage,
            variant: "destructive",
          });
        }
      });
    } catch (error: any) {
      console.error("Error joining meeting:", error);
      setError("Error joining meeting: " + (error.message || error));
      setLoading(false);
      toast({
        title: "Error",
        description: "Error joining meeting",
        variant: "destructive",
      });
    }
  };
  
  // Toggle audio
  const toggleAudio = () => {
    if (window.ZoomMtg && isJoined) {
      if (isAudioMuted) {
        window.ZoomMtg.unmute();
      } else {
        window.ZoomMtg.mute();
      }
      setIsAudioMuted(!isAudioMuted);
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (window.ZoomMtg && isJoined) {
      if (isVideoOff) {
        window.ZoomMtg.startVideo();
      } else {
        window.ZoomMtg.stopVideo();
      }
      setIsVideoOff(!isVideoOff);
    }
  };
  
  // Leave meeting
  const leaveMeeting = () => {
    if (window.ZoomMtg && isJoined) {
      window.ZoomMtg.leaveMeeting({
        success: () => {
          setIsJoined(false);
          toast({
            title: "Left Meeting",
            description: "You have left the Zoom meeting",
          });
        }
      });
    }
  };
  
  // Render a form if not joined, otherwise render the meeting
  if (!isJoined) {
    return (
      <Card className="max-w-md mx-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Join Zoom Meeting</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="meetingId">Meeting ID</Label>
              <Input 
                id="meetingId" 
                placeholder="Enter Zoom Meeting ID (no spaces or hyphens)" 
                value={meetingId}
                onChange={(e) => {
                  // Remove spaces and hyphens from meeting ID
                  const cleanedId = e.target.value.replace(/[\s-]/g, '');
                  setMeetingId(cleanedId);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Enter numbers only, without spaces or hyphens</p>
            </div>
            
            <div>
              <Label htmlFor="userName">Your Name</Label>
              <Input 
                id="userName" 
                placeholder="Enter your name" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)} 
              />
            </div>
            
            <div>
              <Label htmlFor="password">Meeting Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter meeting password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
              <p className="text-xs text-gray-500 mt-1">Required if the meeting is password protected</p>
            </div>
            
            <Button 
              onClick={joinMeeting} 
              disabled={!isLoaded || loading} 
              className="w-full bg-quiz-purple hover:bg-purple-700"
            >
              {loading ? "Joining..." : "Join Meeting"}
            </Button>
            
            {!isLoaded && (
              <p className="text-xs text-amber-600 text-center mt-2">
                Loading Zoom SDK... Please wait.
              </p>
            )}
            
            <div className="text-xs text-gray-500 mt-4">
              <p className="mb-1"><strong>Troubleshooting:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Make sure your Meeting ID is correct (numbers only)</li>
                <li>If the meeting requires a password, enter it exactly as provided</li>
                <li>Some meetings may require host authentication</li>
                <li>Check your internet connection</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="relative">
      {/* Zoom Meeting Container */}
      <div 
        ref={zoomContainer} 
        id="zmmtg-root" 
        className="w-full h-[600px] bg-gray-100 rounded-md overflow-hidden"
      ></div>
      
      {/* Meeting Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-70 px-4 py-2 rounded-full flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-white" onClick={toggleAudio}>
          {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button variant="ghost" size="icon" className="text-white" onClick={toggleVideo}>
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
        
        <Button variant="ghost" size="icon" className="text-white">
          <MessageSquare className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-white">
          <Users className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-white">
          <Settings className="h-5 w-5" />
        </Button>
        
        <Button variant="destructive" size="icon" className="bg-red-500 hover:bg-red-600" onClick={leaveMeeting}>
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ZoomIntegration;
