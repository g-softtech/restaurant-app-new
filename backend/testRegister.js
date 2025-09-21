const axios = require("axios");

async function testRegister() {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/register", {
      name: "Test User",
      email: "test@example.com",
      password: "123456"
    });

    console.log("✅ Success:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("❌ Error Response:", error.response.data);
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

testRegister();
