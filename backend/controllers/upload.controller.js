const cloudinary = require("cloudinary").v2;
const { success, error } = require("../utils/response.utils");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = (folder, transformation) => async (req, res, next) => {
  try {
    if (!req.file) return error(res, "No file uploaded", 400);
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `pulsedesk/${folder}`, transformation },
        (err, r) => (err ? reject(err) : resolve(r)),
      );
      stream.end(req.file.buffer);
    });
    success(res, { url: result.secure_url, public_id: result.public_id });
  } catch (e) {
    next(e);
  }
};

exports.uploadPhoto = upload("photos", [
  { width: 300, height: 300, crop: "fill", gravity: "face" },
]);
exports.uploadLogo = upload("logos", [
  { width: 400, height: 400, crop: "pad", background: "transparent" },
]);
