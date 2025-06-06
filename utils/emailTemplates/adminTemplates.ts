export function adminApprovalTemplate(name: string) {
    return {
        subject: "You have a new listing to review!",
        html: `
      <section style="max-width: 640px; padding: 24px 48px; margin: 0 auto; background-color: #ffffff; color: #1f2937;">
        <main style="margin-top: 32px;">
            <h2 style="color: #374151;">Hi ${name}</h2>
            <p style="margin-top: 8px; line-height: 1.75; color: #4b5563;">
                You have a new creation to review. Mark it as <b>approved</b> or <b>rejected</b>.
            
            <p style="margin-top: 32px; color: #4b5563;">
                Thanks, <br>
                Shutter Guide Team
            </p>
        </main>
        <footer style="margin-top: 32px;">
            <p style="margin-top: 12px; color: #9ca3af;">© ${new Date().getFullYear()} Shutter Guide. All Rights Reserved.</p>
        </footer>
    </section>`
    };
}
