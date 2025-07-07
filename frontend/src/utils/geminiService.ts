/**
 * Utility for interacting with Google's Gemini API
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Analyze complaint text using Gemini AI to determine:
 * 1. Cognizable/non-cognizable status
 * 2. Applicable IPC sections
 * 3. Summary of the incident
 */
export const analyzeComplaint = async (
  text: string, 
  language: string = 'en'
): Promise<{
  isCognizable: boolean;
  sections: Array<{section: string; description: string}>;
  summary: string;
  explanation: string;
}> => {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your environment variables.');
      throw new Error('Gemini API key is missing');
    }

    // Enhance the prompt to more strictly enforce JSON response format
    const prompt = language === 'hi' 
      ? `निम्नलिखित शिकायत का विश्लेषण करें और निम्नलिखित जानकारी प्रदान करें:
      1. क्या यह संज्ञेय अपराध है या गैर-संज्ञेय अपराध है?
      2. सभी संबंधित IPC धाराएँ बताएं और प्रत्येक का संक्षिप्त विवरण दें。
      3. घटना का संक्षिप्त सारांश दें。
      4. अपने विश्लेषण के लिए एक विस्तृत स्पष्टीकरण दें。
      
      महत्वपूर्ण: केवल JSON प्रारूप में उत्तर दें। अतिरिक्त टेक्स्ट, प्रस्तावना, या स्पष्टीकरण न जोड़ें। यदि शिकायत में पर्याप्त जानकारी नहीं है, तो संभावित धाराओं का अनुमान लगाएं और अपने विश्लेषण में अधिक जानकारी की आवश्यकता का उल्लेख करें。
      
      {
        "isCognizable": true/false,
        "sections": [
          {"section": "IPC XXX", "description": "धारा का विवरण"}
        ],
        "summary": "संक्षिप्त सारांश",
        "explanation": "विश्लेषण और जानकारी की आवश्यकता का उल्लेख"
      }
      
      शिकायत: ${text}`
      : `Analyze the following complaint and provide the following information:
      1. Is it a cognizable offense or non-cognizable offense?
      2. List all relevant IPC sections with a brief description of each.
      3. Provide a concise summary of the incident.
      4. Give a detailed explanation for your analysis.
      
      IMPORTANT: Respond ONLY in JSON format. Do not include any additional text, preamble, or explanations. If there is insufficient information in the complaint, make educated guesses about possible sections and note the need for more information in your analysis.
      
      {
        "isCognizable": true/false,
        "sections": [
          {"section": "IPC XXX", "description": "Description of the section"}
        ],
        "summary": "Concise summary",
        "explanation": "Analysis and need for more information"
      }
      
      Complaint: ${text}`;

    console.log('Sending request to Gemini API with prompt:', prompt.substring(0, 100) + '...');

    // Add a timeout to the fetch call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${GEMINI_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId); // Clear the timeout

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error response:', errorData);
      
      // Check for specific error messages
      const errorMessage = errorData.error?.message || 'Unknown error';
      if (errorMessage.includes('overloaded')) {
        throw new Error('The AI service is currently overloaded. Please try again in a few moments.');
      } else {
        throw new Error(`Gemini API error: ${errorMessage}`);
      }
    }

    const data: GeminiResponse = await response.json();
    console.log('Received response from Gemini API:', data);
    
    const textResponse = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!textResponse) {
      console.error('Empty response from Gemini API');
      throw new Error('Received empty response from AI service');
    }
    
    console.log('Raw text response:', textResponse);
    
    // Enhanced JSON extraction logic
    let jsonContent = textResponse.trim();
    
    // If response is wrapped in markdown code blocks, extract just the JSON
    if (jsonContent.includes('```json') || jsonContent.includes('```')) {
      // Extract content between code blocks
      const codeBlockMatch = jsonContent.match(/```(?:json)?([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonContent = codeBlockMatch[1].trim();
        console.log('Extracted content from code block:', jsonContent);
      }
    }
    
    // Try to parse the JSON directly
    try {
      const result = JSON.parse(jsonContent);
      console.log('Successfully parsed JSON directly:', result);
      return result;
    } catch (parseError) {
      console.error('Failed to parse JSON directly, trying to extract JSON from text:', parseError);
      
      // Try to extract any JSON-like structure from the text
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[0]);
          console.log('Successfully extracted and parsed JSON:', result);
          return result;
        } catch (extractError) {
          console.error('Failed to parse extracted JSON:', extractError);
          throw new Error('Invalid JSON format in AI response');
        }
      }
      
      console.error('Could not extract JSON from response:', textResponse);
      
      // If the response is in Hindi, create a fallback response based on the text
      if (language === 'hi' && textResponse.includes('पर्याप्त जानकारी नहीं')) {
        return {
          isCognizable: false,
          sections: [
            {
              section: "जानकारी अपर्याप्त",
              description: "शिकायत में पर्याप्त जानकारी नहीं है"
            }
          ],
          summary: "अपर्याप्त जानकारी",
          explanation: "प्रदान की गई शिकायत में पर्याप्त विवरण नहीं है। कृपया अधिक विवरण प्रदान करें ताकि सही धाराओं का निर्धारण किया जा सके।"
        };
      }
      
      // For English or any other language, use this fallback
      return {
        isCognizable: false,
        sections: [
          {
            section: "Insufficient Information",
            description: "The complaint lacks specific details needed for analysis"
          }
        ],
        summary: "Insufficient information provided",
        explanation: "The complaint does not contain enough details to determine applicable sections. Please provide more specific information about the incident."
      };
    }
  } catch (error) {
    console.error('Error analyzing complaint with Gemini:', error);
    
    // Return fallback analysis
    return {
      isCognizable: false,
      sections: [
        {
          section: "Analysis Error",
          description: "Could not analyze the complaint due to technical issues"
        }
      ],
      summary: error instanceof Error ? error.message : 'Could not analyze complaint',
      explanation: 'An error occurred during analysis. This may be due to service unavailability or high demand. Please try again later.'
    };
  }
};

/**
 * Fallback analysis when Gemini API is unavailable - uses basic keyword matching
 */
export const fallbackAnalysis = (text: string): {
  isCognizable: boolean;
  sections: Array<{section: string; description: string}>;
  summary: string;
  explanation: string;
} => {
  // Convert to lowercase for better matching
  const lowerText = text.toLowerCase();
  
  // Simple keyword matching
  const keywords = {
    theft: {
      pattern: /theft|stole|stolen|rob|robbed|robbery|burglary|break-in|took|take/i,
      section: "IPC 379",
      description: "Punishment for theft",
      cognizable: true
    },
    assault: {
      pattern: /assault|attack|beat|hit|punch|slap|physical|violence|injured/i,
      section: "IPC 323",
      description: "Punishment for voluntarily causing hurt",
      cognizable: true
    },
    harassment: {
      pattern: /harass|stalk|follow|unwanted|messages|calls|threat|sexual/i,
      section: "IPC 354D",
      description: "Stalking",
      cognizable: true
    },
    fraud: {
      pattern: /fraud|cheat|scam|deceive|fake|false|misrepresentation/i,
      section: "IPC 420",
      description: "Cheating and dishonestly inducing delivery of property",
      cognizable: true
    },
    damage: {
      pattern: /damage|destroy|broke|vandalize|graffiti|property/i,
      section: "IPC 427",
      description: "Mischief causing damage",
      cognizable: false
    }
  };
  
  // Check for matches
  const matches = [];
  let isCognizable = false;
  
  for (const [key, value] of Object.entries(keywords)) {
    if (value.pattern.test(lowerText)) {
      matches.push({
        section: value.section,
        description: value.description
      });
      
      if (value.cognizable) {
        isCognizable = true;
      }
    }
  }
  
  // If no matches, return generic
  if (matches.length === 0) {
    matches.push({
      section: "Review Required",
      description: "Could not automatically determine applicable IPC sections"
    });
  }
  
  return {
    isCognizable: isCognizable,
    sections: matches,
    summary: "Automatic analysis based on keywords (fallback mode)",
    explanation: "This is a basic analysis using keyword matching because the AI service is unavailable. Please review the details manually for accuracy."
  };
};

/**
 * Transcribe speech to text using the browser's Web Speech API
 */
// Define the Web Speech API interfaces
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      }
    }
    length: number;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

// Extend the Window interface
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export const transcribeSpeech = (
  language: string = 'en-US', 
  onInterimResult?: (text: string) => void,
  onError?: (error: string) => void
): { 
  start: () => void; 
  stop: () => void;
  isListening: () => boolean;
} => {
  if (typeof window === 'undefined') {
    throw new Error('Speech recognition is not available in this environment');
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;  // Use browser's SpeechRecognition API
  
  if (!SpeechRecognition) {
    console.error('Speech recognition not supported in this browser');
    if (onError) onError('Speech recognition not supported in this browser');
    return {
      start: () => {},
      stop: () => {},
      isListening: () => false
    };
  }
  
  const speechLang = languageMap[language] || 'en-US';
  
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionAPI) {
    throw new Error('Speech recognition not supported in this browser');
  }
  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = speechLang;
  
  let finalTranscript = '';
  let isRecognitionActive = false;
  
  recognition.onresult = (event) => {
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' ';
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    
    if (onInterimResult) {
      onInterimResult(finalTranscript + interimTranscript);
    }
  };
  
  recognition.onerror = (event) => {
    if (onError) onError(`Error occurred in recognition: ${event.error}`);
    isRecognitionActive = false;
  };
  
  return {
    start: () => {
      try {
        recognition.start();
        isRecognitionActive = true;
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        if (onError) onError('Failed to start speech recognition');
      }
    },
    stop: () => {
      try {
        recognition.stop();
        isRecognitionActive = false;
      } catch (error) {
        console.error('Failed to stop speech recognition:', error);
      }
    },
    isListening: () => isRecognitionActive
  };
};

const languageMap: Record<string, string> = {
  'hi': 'hi-IN',
  'en': 'en-US',
};
