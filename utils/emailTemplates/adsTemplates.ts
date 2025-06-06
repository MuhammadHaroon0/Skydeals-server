export function adCreationTemplate(name: string) {
    return {
        subject: "Your listing is under review!",
        html: `
      <section style="max-width: 640px; padding: 24px 48px; margin: 0 auto; background-color: #ffffff; color: #1f2937;">
        <main style="margin-top: 32px;">
            <h2 style="color: #374151;">Hi ${name}</h2>
            <p style="margin-top: 8px; line-height: 1.75; color: #4b5563;">
                Your new creation is under review. We will inform you if it gets <b>approved</b> or <b>rejected</b>.
            
            <p style="margin-top: 32px; color: #4b5563;">
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

export function listingStatusTemplate(name: string, status: boolean) {

    return (
        status === true ?
            {
                subject:
                    `Congratulations! Your listing has been approved!"`,
                html: `<section style="max-width: 640px; padding: 24px 48px; margin: 0 auto; background-color: #ffffff; color: #1f2937;">
        <main style="margin-top: 32px;">
            <h2 style="color: #374151;">Hi ${name}</h2>
            <p style="margin-top: 8px; line-height: 1.75; color: #4b5563;">
                Your new listing has been <b>approved</b>. You can see it on the <span><a href="${process.env.FRONTEND_URL}" style="font-weight: 600;">Skydeals</a></span> website.
            
            <p style="margin-top: 32px; color: #4b5563;">
                Thanks, <br>
                Skydeals Team
            </p>
        </main>
        <footer style="margin-top: 32px;">
            <p style="margin-top: 12px; color: #9ca3af;">© ${new Date().getFullYear()} Skydeals. All Rights Reserved.</p>
        </footer>
    </section>`
            }

            :
            {
                subject:
                    `We're sorry! Your listing has been rejected!"`,
                html: `<section style="max-width: 640px; padding: 24px 48px; margin: 0 auto; background-color: #ffffff; color: #1f2937;">
        <main style="margin-top: 32px;">
            <h2 style="color: #374151;">Hi ${name}</h2>
            <p style="margin-top: 8px; line-height: 1.75; color: #4b5563;">
                Your new listing has been <b>rejected</b>. It is against our community standards. 
            
            <p style="margin-top: 32px; color: #4b5563;">
                Thanks, <br>
                Skydeals Team
            </p>
        </main>
        <footer style="margin-top: 32px;">
            <p style="margin-top: 12px; color: #9ca3af;">© ${new Date().getFullYear()} Skydeals. All Rights Reserved.</p>
        </footer>
    </section>`
            }
    )
}