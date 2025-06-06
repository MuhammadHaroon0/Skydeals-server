export function welcome(name: string, email: string, token: string) {
    return {
        subject: "Welcome to Sky Deals",
        html: `
      <section style="max-width: 640px; padding: 24px 48px; margin: 0 auto; background-color: #ffffff; color: #1f2937;">
        <main style="margin-top: 32px;">
            <h2 style="color: #374151;">Hi ${name}</h2>
            <p style="margin-top: 8px; line-height: 1.75; color: #4b5563;">
                Verify your account to get started on <span style="font-weight: 600;">Sky Deals</span>.
            </p>
            <a style="padding: 8px 24px; margin-top: 16px; font-size: 0.875rem; font-weight: 500; color: #ffffff; background-color: #202125; border-radius: 0.375rem; text-decoration: none; display: inline-block;" href="${process.env.BACKEND_URL}/api/v1/users/verify?token=${token}">
                Verify Account
            </a>
            <p style="margin-top: 32px; color: #4b5563;">
                Thanks, <br>
                Sky Deals Team
            </p>
        </main>
        <footer style="margin-top: 32px;">
            <p style="margin-top: 12px; color: #9ca3af;">© ${new Date().getFullYear()} Sky Deals. All Rights Reserved.</p>
        </footer>
      </section>`
    };
}

export function resetPassword(name: string, resetUrl: string) {
    return {
        subject: "Passsword Reset",
        html: `
      <section style="max-width: 640px; padding: 24px 48px; margin: 0 auto; background-color: #ffffff; color: #1f2937; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
  <main style="margin-top: 32px;">
      <h2 style="color: #374151;">Hi ${name}</h2>
      <p style="margin-top: 8px; line-height: 1.75; color: #000000;">
      Forgot your password? Click this button to reset your password: 
      </p>
      <a style="padding: 8px 24px; margin-top: 16px; font-size: 0.875rem; font-weight: 500; color: #ffffff; background-color: #000814; border-radius: 0.375rem; text-decoration: none; display: inline-block;" href="${resetUrl}">
          Reset Password
      </a>
      <p>
      If you don't forget your password just ignore this message
      </p>

      <p style="margin-top: 32px; color: #000000;">
          Thanks, <br>
          Skydeals Team
      </p>
  </main>
  <footer style="margin-top: 32px;">
      <p style="margin-top: 12px; color: #9ca3af;">© ${new Date().getFullYear()} Skydeals. All Rights Reserved.</p>
  </footer>
</section>`
    };
}
