const axios = require("axios");

async function testLogin() {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email: "test@example.com",
      password: "123456",
    });

    console.log("✅ Login Success:", res.data);
  } catch (err) {
    console.error("❌ Login Failed:", err.response?.data || err.message);
  }
}

testLogin();
