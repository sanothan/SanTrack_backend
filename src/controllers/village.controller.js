const Village = require("../models/Village");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { isValidObjectId } = require("../utils/objectId");

const createVillage = asyncHandler(async (req, res) => {
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
        facilities: 0, // Exclude the raw facilities array from the response
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

module.exports = {
  createVillage,
  getVillages,
  getVillageById,
  updateVillage,
  deleteVillage,
};
