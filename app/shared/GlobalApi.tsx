import axios from "axios";

export const AIChatModel = async (message: any) => {
  try {
    /* Send POST request using Axios */
    const response = await axios.post(
      "https://kravixstudio.com/api/v1/chat",
      {
        message: message,
        aiModel: "gpt-5",
        outputType: "text"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.EXPO_PUBLIC_KARVIX_STUDIO_API_KEY}`
        }
      }
    );
    
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("AI Chat Error:", error);
    throw error;
  }
};

// Add default export - empty component to satisfy router
export default function GlobalApi() {
  return null;
}