const ApiError = require("../utils/ApiError");

/**
 * Reverse geocode coordinates using Nominatim API
 * @param {number} lat 
 * @param {number} lng 
 * @returns {Promise<Object>}
 */
const reverseGeocode = async (lat, lng) => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        throw new ApiError(400, "Valid latitude and longitude are required");
    }

    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

        const response = await fetch(url, {
            headers: {
                "User-Agent": "SanTrack-App/1.0 (dev)",
                "Accept-Language": "en-US,en;q=0.9"
            }
        });

        if (!response.ok) {
            throw new ApiError(502, "Failed to fetch data from Geocoding service");
        }

        const data = await response.json();

        if (data.error) {
            return {
                formattedAddress: null,
                district: null,
                state: null,
                country: null,
                raw: data
            };
        }

        const address = data.address || {};

        return {
            formattedAddress: data.display_name,
            district: address.district || address.city_district || address.suburb || address.city || null,
            state: address.state || address.province || null,
            country: address.country || null,
            raw: data.address
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Reverse Geocoding Error:", error);
        throw new ApiError(500, "Internal server error during geocoding");
    }
};

module.exports = {
    reverseGeocode
};
