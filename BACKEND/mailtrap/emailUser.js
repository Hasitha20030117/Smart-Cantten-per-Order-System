import { VERIFICATION_EMAIL_TEMPLATE,
         PASSWORD_RESET_REQUEST_TEMPLATE,
         PASSWORD_RESET_SUCCESS_TEMPLATE } from './emailTemplatesUser.js';

import { Client, sender } from './mailtrap.config.js';

export const sendVerificationEmail = async (email, verificationToken) => {
	const recipient = [{ email }];

	try {
		const response = await Client.send({
			from: sender,
			to: recipient,
			subject: "Verify your email",
			html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
			category: "Email Verification",
		});

		console.log("Email sent successfully", response);
	} catch (error) {
		console.error(`Error sending verification`, error);

		throw new Error(`Error sending verification email: ${error}`);
	}
};

export const sendWelcomeEmail = async (email, firstName) => {
	const recipient = [{ email }];

	try {
		const response = await Client.send({
			from: sender,
			to: recipient,
			template_uuid: "a62b62ca-0bbe-4798-9cb1-8f9b27646c16",
			template_variables: {
				company_info_name: "Yong Smart",
				name: firstName,
			},
		});

		console.log("Welcome email sent successfully", response);
	} catch (error) {
		console.error(`Error sending welcome email`, error);

		throw new Error(`Error sending welcome email: ${error}`);
	}
};


export const sendPasswordResetEmail = async (email, resetURL) => {
	const recipient = [{ email }];

	try {
		const response = await Client.send({
			from: sender,
			to: recipient,
			subject: "Reset your password",
			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
			category: "Password Reset",
		});
	} catch (error) {
		console.error(`Error sending password reset email`, error);

		throw new Error(`Error sending password reset email: ${error}`);
	}
};


export const sendResetSuccessEmail = async (email) => {
	const recipient = [{ email }];

	try {
		const response = await Client.send({
			from: sender,
			to: recipient,
			subject: "Password Reset Successful",
			html: PASSWORD_RESET_SUCCESS_TEMPLATE,
			category: "Password Reset",
		});

		console.log("Password reset email sent successfully", response);
	} catch (error) {
		console.error(`Error sending password reset success email`, error);

		throw new Error(`Error sending password reset success email: ${error}`);
	}
};

