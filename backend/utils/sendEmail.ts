import { transporter } from "../config/transporter.js";

export const mailConstructor = (email: string, token: string) => {
  const mailOptions = {
    from: '"Speed" <cabutinb@gmail.com>',
    to: email,
    subject: "Test Email from Node.js",
    text: "This is a plain text body.",
    html: `<b>This is <i>HTML</i> ${token}</b>`,
  };
  return mailOptions;
};

export async function sendEmail(email: string, token: string) {
  const mailOptions = mailConstructor(email, token);
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
