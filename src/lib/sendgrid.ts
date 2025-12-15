/**
 * SendGrid Email Service
 * Handles sending transactional emails via SendGrid API
 */

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailContent {
  type: 'text/plain' | 'text/html';
  value: string;
}

interface SendEmailParams {
  to: EmailRecipient | EmailRecipient[];
  cc?: EmailRecipient | EmailRecipient[];
  subject: string;
  text?: string;
  html?: string;
  from?: EmailRecipient;
}

interface SendGridResponse {
  success: boolean;
  error?: string;
}

/**
 * Send an email using SendGrid API
 */
export async function sendEmail(params: SendEmailParams): Promise<SendGridResponse> {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.error('SendGrid API key not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const fromEmail = params.from || {
    email: process.env.SENDGRID_FROM_EMAIL || 'hello@nukleo.digital',
    name: process.env.SENDGRID_FROM_NAME || 'ARISE-Test'
  };

  const toRecipients = Array.isArray(params.to) ? params.to : [params.to];

  const content: EmailContent[] = [];
  if (params.text) {
    content.push({ type: 'text/plain', value: params.text });
  }
  if (params.html) {
    content.push({ type: 'text/html', value: params.html });
  }

  const ccRecipients = params.cc ? (Array.isArray(params.cc) ? params.cc : [params.cc]) : [];

  const personalization: any = {
    to: toRecipients.map(r => ({ email: r.email, name: r.name })),
  };

  if (ccRecipients.length > 0) {
    personalization.cc = ccRecipients.map(r => ({ email: r.email, name: r.name }));
  }

  const payload = {
    personalizations: [personalization],
    from: {
      email: fromEmail.email,
      name: fromEmail.name,
    },
    subject: params.subject,
    content,
  };

  try {
    const response = await fetch(SENDGRID_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 202) {
      return { success: true };
    }

    const errorData = await response.json().catch(() => ({}));
    console.error('SendGrid error:', response.status, errorData);
    return { 
      success: false, 
      error: errorData.errors?.[0]?.message || `Failed to send email (${response.status})` 
    };
  } catch (error) {
    console.error('SendGrid request failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

/**
 * Send welcome/confirmation email to new user
 */
export async function sendWelcomeEmail(params: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<SendGridResponse> {
  const { email, firstName, lastName } = params;
  const name = firstName ? `${firstName}${lastName ? ' ' + lastName : ''}` : 'there';

  const subject = 'Welcome to ARISE Human Capital - Your Leadership Journey Begins!';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ARISE</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0D5C5C; padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ARISE</h1>
              <p style="margin: 10px 0 0; color: #D4A84B; font-size: 14px; letter-spacing: 1px;">HUMAN CAPITAL</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #0D5C5C; font-size: 24px;">Welcome, ${name}! 🎉</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Thank you for joining ARISE Human Capital. Your journey to becoming an authentic leader starts now!
              </p>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Your account has been successfully created. Here's what you can do next:
              </p>
              
              <!-- Steps -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 15px; background-color: #f7fafc; border-radius: 8px; margin-bottom: 10px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="40" style="vertical-align: top;">
                          <div style="width: 32px; height: 32px; background-color: #0D5C5C; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: bold;">1</div>
                        </td>
                        <td style="padding-left: 15px;">
                          <strong style="color: #0D5C5C;">Complete Your Assessments</strong>
                          <p style="margin: 5px 0 0; color: #718096; font-size: 14px;">Take the MBTI, TKI, 360° Feedback, and Wellness assessments to understand your leadership style.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f7fafc; border-radius: 8px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="40" style="vertical-align: top;">
                          <div style="width: 32px; height: 32px; background-color: #0D5C5C; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: bold;">2</div>
                        </td>
                        <td style="padding-left: 15px;">
                          <strong style="color: #0D5C5C;">Invite Your Evaluators</strong>
                          <p style="margin: 5px 0 0; color: #718096; font-size: 14px;">Get 360° feedback from colleagues, managers, and direct reports for comprehensive insights.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f7fafc; border-radius: 8px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="40" style="vertical-align: top;">
                          <div style="width: 32px; height: 32px; background-color: #0D5C5C; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: bold;">3</div>
                        </td>
                        <td style="padding-left: 15px;">
                          <strong style="color: #0D5C5C;">Build Your Development Plan</strong>
                          <p style="margin: 5px 0 0; color: #718096; font-size: 14px;">Create personalized goals and track your growth with our coaching resources.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://web-production-d62b.up.railway.app'}/dashboard" 
                       style="display: inline-block; padding: 16px 40px; background-color: #D4A84B; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                If you have any questions, feel free to reach out to our support team. We're here to help you on your leadership journey.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2D2D2D; padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 10px; color: #D4A84B; font-size: 16px; font-weight: 600;">ARISE Human Capital</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">Empowering Authentic Leaders</p>
              <p style="margin: 20px 0 0; color: #6b7280; font-size: 11px;">
                © ${new Date().getFullYear()} ARISE Human Capital. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Welcome to ARISE Human Capital, ${name}!

Thank you for joining us. Your journey to becoming an authentic leader starts now!

Your account has been successfully created. Here's what you can do next:

1. Complete Your Assessments
   Take the MBTI, TKI, 360° Feedback, and Wellness assessments to understand your leadership style.

2. Invite Your Evaluators
   Get 360° feedback from colleagues, managers, and direct reports for comprehensive insights.

3. Build Your Development Plan
   Create personalized goals and track your growth with our coaching resources.

Go to your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://web-production-d62b.up.railway.app'}/dashboard

If you have any questions, feel free to reach out to our support team.

Best regards,
The ARISE Human Capital Team
  `;

  return sendEmail({
    to: { email, name: firstName || undefined },
    subject,
    html,
    text,
  });
}

/**
 * Send 360° feedback invitation email to evaluator
 */
export async function sendEvaluatorInviteEmail(params: {
  evaluatorEmail: string;
  evaluatorName: string;
  userName: string;
  userEmail: string;
  relationship: string;
  feedbackUrl: string;
}): Promise<SendGridResponse> {
  const { evaluatorEmail, evaluatorName, userName, userEmail, relationship, feedbackUrl } = params;

  const subject = `${userName} has invited you to provide 360° feedback`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0D5C5C; padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ARISE</h1>
              <p style="margin: 10px 0 0; color: #D4A84B; font-size: 14px; letter-spacing: 1px;">360° FEEDBACK REQUEST</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #0D5C5C; font-size: 24px;">Hello ${evaluatorName},</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                <strong>${userName}</strong> has invited you to provide feedback as their <strong>${relationship}</strong>.
              </p>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Your honest feedback will help them understand their leadership strengths and areas for development. The survey takes approximately 10-15 minutes to complete.
              </p>
              
              <p style="margin: 0 0 20px; color: #718096; font-size: 14px; line-height: 1.6;">
                <em>All responses are anonymous and will be aggregated with other feedback.</em>
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${feedbackUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #D4A84B; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Provide Feedback
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Thank you for taking the time to support ${userName}'s leadership development.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2D2D2D; padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 10px; color: #D4A84B; font-size: 16px; font-weight: 600;">ARISE Human Capital</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">Empowering Authentic Leaders</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Hello ${evaluatorName},

${userName} has invited you to provide feedback as their ${relationship}.

Your honest feedback will help them understand their leadership strengths and areas for development. The survey takes approximately 10-15 minutes to complete.

All responses are anonymous and will be aggregated with other feedback.

Provide Feedback: ${feedbackUrl}

Thank you for taking the time to support ${userName}'s leadership development.

Best regards,
The ARISE Human Capital Team
  `;

  return sendEmail({
    to: { email: evaluatorEmail, name: evaluatorName },
    cc: { email: userEmail, name: userName },
    subject,
    html,
    text,
  });
}

/**
 * Send confirmation email when an evaluator is added
 */
export async function sendEvaluatorAddedConfirmation(params: {
  userEmail: string;
  userName: string;
  evaluatorName: string;
  evaluatorEmail: string;
  relationship: string;
}): Promise<SendGridResponse> {
  const { userEmail, userName, evaluatorName, evaluatorEmail, relationship } = params;

  const subject = `Evaluator added: ${evaluatorName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0D5C5C; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">ARISE</h1>
              <p style="margin: 8px 0 0; color: #D4A84B; font-size: 12px; letter-spacing: 1px;">EVALUATOR ADDED</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 15px; color: #0D5C5C; font-size: 20px;">Hi ${userName},</h2>
              
              <p style="margin: 0 0 15px; color: #4a5568; font-size: 15px; line-height: 1.6;">
                You have successfully added a new evaluator to your 360° feedback:
              </p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; background-color: #f7fafc; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; color: #0D5C5C; font-weight: 600; font-size: 16px;">${evaluatorName}</p>
                    <p style="margin: 0 0 5px; color: #718096; font-size: 14px;">${evaluatorEmail}</p>
                    <p style="margin: 0; color: #718096; font-size: 14px;">Relationship: ${relationship}</p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 15px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                When you're ready, go to your dashboard to send the invitation.
              </p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://web-production-d62b.up.railway.app'}/dashboard/360-evaluators" 
                       style="display: inline-block; padding: 12px 30px; background-color: #D4A84B; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px;">
                      Manage Evaluators
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2D2D2D; padding: 20px 40px; text-align: center;">
              <p style="margin: 0; color: #D4A84B; font-size: 14px; font-weight: 600;">ARISE Human Capital</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Hi ${userName},

You have successfully added a new evaluator to your 360° feedback:

Name: ${evaluatorName}
Email: ${evaluatorEmail}
Relationship: ${relationship}

When you're ready, go to your dashboard to send the invitation.

Manage Evaluators: ${process.env.NEXT_PUBLIC_APP_URL || 'https://web-production-d62b.up.railway.app'}/dashboard/360-evaluators

Best regards,
The ARISE Human Capital Team
  `;

  return sendEmail({
    to: { email: userEmail, name: userName },
    subject,
    html,
    text,
  });
}

/**
 * Send confirmation email when evaluator completes feedback
 */
export async function sendFeedbackCompletedEmail(params: {
  userEmail: string;
  userName: string;
  evaluatorName: string;
  relationship: string;
}): Promise<SendGridResponse> {
  const { userEmail, userName, evaluatorName, relationship } = params;

  const subject = `${evaluatorName} has completed their 360° feedback!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0D5C5C; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">ARISE</h1>
              <p style="margin: 8px 0 0; color: #D4A84B; font-size: 12px; letter-spacing: 1px;">FEEDBACK RECEIVED ✅</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 15px; color: #0D5C5C; font-size: 20px;">Great news, ${userName}!</h2>
              
              <p style="margin: 0 0 15px; color: #4a5568; font-size: 15px; line-height: 1.6;">
                <strong>${evaluatorName}</strong> (${relationship}) has completed their 360° feedback for you.
              </p>
              
              <p style="margin: 0 0 20px; color: #718096; font-size: 14px; line-height: 1.6;">
                Their responses have been recorded and will be included in your aggregated feedback report.
              </p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://web-production-d62b.up.railway.app'}/dashboard/360-evaluators" 
                       style="display: inline-block; padding: 12px 30px; background-color: #D4A84B; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px;">
                      View Progress
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2D2D2D; padding: 20px 40px; text-align: center;">
              <p style="margin: 0; color: #D4A84B; font-size: 14px; font-weight: 600;">ARISE Human Capital</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Great news, ${userName}!

${evaluatorName} (${relationship}) has completed their 360° feedback for you.

Their responses have been recorded and will be included in your aggregated feedback report.

View Progress: ${process.env.NEXT_PUBLIC_APP_URL || 'https://web-production-d62b.up.railway.app'}/dashboard/360-evaluators

Best regards,
The ARISE Human Capital Team
  `;

  return sendEmail({
    to: { email: userEmail, name: userName },
    subject,
    html,
    text,
  });
}

/**
 * Send thank you email to evaluator after completing feedback
 */
export async function sendEvaluatorThankYouEmail(params: {
  evaluatorEmail: string;
  evaluatorName: string;
  userName: string;
}): Promise<SendGridResponse> {
  const { evaluatorEmail, evaluatorName, userName } = params;

  const subject = `Thank you for your feedback!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0D5C5C; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">ARISE</h1>
              <p style="margin: 8px 0 0; color: #D4A84B; font-size: 12px; letter-spacing: 1px;">THANK YOU!</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 15px; color: #0D5C5C; font-size: 20px;">Thank you, ${evaluatorName}!</h2>
              
              <p style="margin: 0 0 15px; color: #4a5568; font-size: 15px; line-height: 1.6;">
                Your feedback for <strong>${userName}</strong> has been successfully submitted.
              </p>
              
              <p style="margin: 0 0 20px; color: #718096; font-size: 14px; line-height: 1.6;">
                Your honest insights will help ${userName} understand their leadership strengths and identify areas for growth. This kind of feedback is invaluable for professional development.
              </p>
              
              <p style="margin: 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Thank you for taking the time to contribute to their leadership journey.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2D2D2D; padding: 20px 40px; text-align: center;">
              <p style="margin: 0; color: #D4A84B; font-size: 14px; font-weight: 600;">ARISE Human Capital</p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 11px;">Empowering Authentic Leaders</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Thank you, ${evaluatorName}!

Your feedback for ${userName} has been successfully submitted.

Your honest insights will help ${userName} understand their leadership strengths and identify areas for growth. This kind of feedback is invaluable for professional development.

Thank you for taking the time to contribute to their leadership journey.

Best regards,
The ARISE Human Capital Team
  `;

  return sendEmail({
    to: { email: evaluatorEmail, name: evaluatorName },
    subject,
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<SendGridResponse> {
  const subject = 'Reset your ARISE password';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0D5C5C 0%, #0a4a4a 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #D4A84B; font-size: 32px; font-weight: 700;">ARISE</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #2D2D2D; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hi ${name},
              </p>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your ARISE account. Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #0D5C5C; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0; color: #0D5C5C; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <p style="margin: 30px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                This link will expire in 1 hour for security reasons.
              </p>
              
              <p style="margin: 20px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2D2D2D; padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 10px; color: #D4A84B; font-size: 16px; font-weight: 600;">ARISE Human Capital</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">Empowering Authentic Leaders</p>
              <p style="margin: 20px 0 0; color: #6b7280; font-size: 11px;">
                © ${new Date().getFullYear()} ARISE Human Capital. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Reset Your Password

Hi ${name},

We received a request to reset your password for your ARISE account. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

Best regards,
The ARISE Human Capital Team
  `;

  return sendEmail({
    to: { email, name },
    subject,
    html,
    text,
  });
}