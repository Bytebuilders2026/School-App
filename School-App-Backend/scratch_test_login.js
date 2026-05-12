const axios = require("axios");

async function testLogin() {
    try {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
            role: "student",
            identifier: "1",
            password: "123"
        });
        console.log("LOGIN_SUCCESS", res.data.message);
    } catch (err) {
        console.log("LOGIN_FAILED", err.response?.data?.message || err.message);
    }
}

testLogin();
