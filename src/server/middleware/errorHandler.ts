import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("[ServerError]", err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "Validation failed for request parameters",
        details: err.issues,
      },
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected internal server error occurred";
  const code = err.code || "INTERNAL_SERVER_ERROR";

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === "development" ? { details: [err.stack] } : {}),
    },
  });
}
