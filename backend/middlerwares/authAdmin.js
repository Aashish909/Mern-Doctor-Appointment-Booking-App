import jwt from "jsonwebtoken";

//admin authentication middleware

const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) {
      return res
        .status(401)
        .json({ success: false, message: "No admin token provided." });
    }

    const token_decoded = jwt.verify(atoken, process.env.JWT_SECRET);

    if (
      token_decoded !==
      process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized token." });
    }
    next();
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

export default authAdmin;
