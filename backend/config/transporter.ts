import nodemailer from "nodemailer";
import { EMAIL_PASS, EMAIL_USER } from "./envVars.js";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  connectionTimeout: 15_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
