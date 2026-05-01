import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, company, message } = req.body;

        // Basis validatie
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Verplichte velden ontbreken' });
        }

        // Email validatie
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Ongeldig emailadres' });
        }

        const { data, error } = await resend.emails.send({
            from: 'Dammy Website <onboarding@resend.dev>',
            to: ['contact@dammy.nl'],
            replyTo: email,
            subject: `Nieuw bericht via website van ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #000; border-bottom: 2px solid #8A9E6C; padding-bottom: 10px;">
                        Nieuw bericht via dammy.nl
                    </h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Naam:</strong></td>
                            <td style="padding: 8px 0;">${escapeHtml(name)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                            <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
                        </tr>
                        ${company ? `
                        <tr>
                            <td style="padding: 8px 0; color: #666;"><strong>Bedrijf:</strong></td>
                            <td style="padding: 8px 0;">${escapeHtml(company)}</td>
                        </tr>` : ''}
                    </table>
                    <div style="margin-top: 24px; padding: 16px; background: #FAF8F5; border-left: 3px solid #8A9E6C; border-radius: 4px;">
                        <strong style="color: #666; display: block; margin-bottom: 8px;">Bericht:</strong>
                        <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ error: 'Versturen mislukt' });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Handler error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
