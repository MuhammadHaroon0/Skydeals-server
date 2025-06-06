
import nodemailer, { Transporter } from "nodemailer";
import { google } from "googleapis";
import { resetPassword, welcome } from "./emailTemplates/authTemplates";
import { adCreationTemplate, listingStatusTemplate } from "./emailTemplates/adsTemplates";
import { adminApprovalTemplate } from "./emailTemplates/adminTemplates";

interface User {
    email: string;
    name: string;
}

const OAuth2 = google.auth.OAuth2;

class Email {
    private to: string;
    private from: string | undefined;
    private name: string;

    constructor(user: User) {
        this.to = user.email;
        this.from = process.env.EMAIL;
        this.name = user.name;
    }

    private async newTransport(): Promise<Transporter> {
        const oauth2Client = new OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        });

        const accessToken = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.EMAIL,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken?.token ?? undefined
            }
        });

        return transporter;
    }

    private async send(subject: string, template: string): Promise<void> {
        const transporter = await this.newTransport();
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html: template,
        };
        await transporter.sendMail(mailOptions);
    }

    async sendWelcome(token: string): Promise<void> {
        const { subject, html } = welcome(this.name, this.to, token);
        await this.send(subject, html);
    }
    async sendResetPassword(resetUrl: string): Promise<void> {
        const { subject, html } = resetPassword(this.name, resetUrl);
        await this.send(subject, html);
    }

    async sendNewListing(): Promise<void> {
        const { subject, html } = adCreationTemplate(this.name);
        await this.send(subject, html);
    }
    async sendListingStatus(status: boolean): Promise<void> {
        const { subject, html } = listingStatusTemplate(this.name, status);
        await this.send(subject, html);
    }
    async sendAdminApproval(): Promise<void> {
        const { subject, html } = adminApprovalTemplate(this.name);
        await this.send(subject, html);
    }
}

export default Email;