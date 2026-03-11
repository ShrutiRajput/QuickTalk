import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);

    if (decision.isDenied) {
      if (decision.reason.isRateLimit) {
        return res
          .status(429)
          .json({ message: "Rate limit exceeded. Please try again later." });
      } else if (decision.reason.isBot) {
        return res
          .status(403)
          .json({ message: "Access denied. Bot traffic is not allowed." });
      } else {
        return res
          .status(403)
          .json({ message: "Access denied by security policy." });
      }
    }

    //check for spoofed bot
    if (decision.results.some(isSpoofedBot)) {
      return res
        .status(403)
        .json({
          error: "Spoofed bot detected",
          message: "Malicious bot activity detected.",
        });
    }
    next();
  } catch (error) {
    console.error("Error in Arcjet middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
