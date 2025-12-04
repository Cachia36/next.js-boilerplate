export async function sendPasswordResetEmail(to: string, resetLink: string) {
    // In boilerplate: just log it
    if (process.env.NODE_ENV !== "production") {
        console.log(`Password reset email to ${to}: With link: ${resetLink}`);
    }

    //In real project: plug in Resend / SendGrid / SES / etc.
}