const { OAuth2Client } = require("google-auth-library");
const ApiError = require("../utils/ApiError");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID token and returns the decoded payload.
 * @param {string} idToken 
 * @returns {{ googleId, email, name, picture }}
 */
const verifyGoogleToken = async (idToken) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
        };
    } catch (err) {
        throw new ApiError(401, "Invalid or expired Google token");
    }
};

module.exports = { verifyGoogleToken };
