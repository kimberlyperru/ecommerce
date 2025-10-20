const axios = require('axios');

/**
 * @desc    Get M-Pesa API access token
 */
const getAccessToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    const auth = 'Basic ' + Buffer.from(consumerKey + ':' + consumerSecret).toString('base64');

    const response = await axios.get(url, { headers: { Authorization: auth } });
    return response.data.access_token;
};

/**
 * @desc    Get current timestamp in YYYYMMDDHHMMSS format
 */
const getTimestamp = () => {
    const now = new Date();
    return now.getFullYear() + ('0' + (now.getMonth() + 1)).slice(-2) + ('0' + now.getDate()).slice(-2) + ('0' + now.getHours()).slice(-2) + ('0' + now.getMinutes()).slice(-2) + ('0' + now.getSeconds()).slice(-2);
};

module.exports = { getAccessToken, getTimestamp };