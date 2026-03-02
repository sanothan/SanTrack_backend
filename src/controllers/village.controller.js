const Village = require("../models/Village");
const villageService = require("../services/village.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { isValidObjectId } = require("../utils/objectId");

const createVillage = asyncHandler(async (req, res) => {
  const { gps } = req.body;
  if (
    !gps ||
    gps.lat === undefined || gps.lat === null || isNaN(Number(gps.lat)) ||
    gps.lng === undefined || gps.lng === null || isNaN(Number(gps.lng))
  ) {
    throw new ApiError(400, 'GPS coordinates (lat and lng) are required');
  }
  const village = await Village.create(req.body);
  res.status(201).json(village);
});

const getVillages = asyncHandler(async (_req, res) => {
  const villages = await Village.aggregate([
    {
      $lookup: {
        from: "facilities",
        localField: "_id",
        foreignField: "villageId",
        as: "facilities",
      },
    },
    {
      $addFields: {
        facilitiesCount: { $size: "$facilities" },
      },
    },
    {
      $project: {
        facilities: 0,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  res.status(200).json(villages);
});

const getVillageById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid village id");

  const village = await Village.findById(id);
  if (!village) throw new ApiError(404, "Village not found");

  res.status(200).json(village);
});

const updateVillage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid village id");

  const village = await Village.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!village) throw new ApiError(404, "Village not found");
  res.status(200).json(village);
});

const deleteVillage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid village id");

  const village = await Village.findByIdAndDelete(id);
  if (!village) throw new ApiError(404, "Village not found");

  res.status(200).json({ message: "Village deleted successfully" });
});

const reverseGeocode = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    throw new ApiError(400, "Latitude (lat) and Longitude (lng) are required");
  }

  const addressData = await villageService.reverseGeocode(
    parseFloat(lat),
    parseFloat(lng)
  );

  res.status(200).json(addressData);
});

module.exports = {
  createVillage,
  getVillages,
  getVillageById,
  updateVillage,
  deleteVillage,
  reverseGeocode,
};
