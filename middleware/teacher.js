import { errorResponse } from "../utils/responseHandler.js";

export const isTeacher = (req, res, next) => {
  if (req.user && req.user.role === "teacher") {
    next();
  } else {
    return errorResponse(res, "Access denied. Teachers only.", 403);
  }
};
