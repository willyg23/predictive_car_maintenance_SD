export const generateResponse = async (prompt) => {
    try {
      const response = await fetch('https://ii1orwzkzl.execute-api.us-east-2.amazonaws.com/dev/generate-gpt-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          model: 'gpt-4'
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
    }
  };