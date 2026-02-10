async function postData(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST", // Specify the method
      headers: {
        "Content-Type": "application/json", // Tell the server we're sending JSON
        Authorization: "Bearer apf_ydj4nej5fanuc6h2hinoykrt",
      },
      body: JSON.stringify(data), // Convert the JavaScript object to a JSON string
    });

    if (!response.ok) {
      // Handle HTTP errors, as fetch only rejects on network errors
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json(); // Parse the JSON response body
    console.log("Success:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error:", error);
  }
}

// Usage:
const apiEndpoint = "https://apifreellm.com/api/v1/chat"; // A fake API endpoint for testing
const myData = {
  message: "podes hablar en español y hacer 2 + 2?",
};

postData(apiEndpoint, myData);
