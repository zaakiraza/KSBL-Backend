import { errorResponse } from "../utils/responseHandler.js";

export const isStudent = (req, res, next) => {
  if (req.user && req.user.role === "student") {
    next();
  } else {
    return errorResponse(res, "Access denied. Students only.", 403);
  }
};
