import { NextRequest, NextResponse } from 'next/server';
import { ConsultationForm } from '@/types/website';

/**
 * POST /api/consultations
 * Handles consultation form submissions
 * 
 * Request body:
 * {
 *   name: string (required)
 *   email: string (required, valid email)
 *   phone: string (required, valid phone)
 *   serviceType: string (required)
 *   message: string (required, min 10 chars)
 *   preferredTime?: Date (optional)
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   message: string
 *   consultationId?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, email, phone, serviceType, message, preferredTime } = body;

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone format' },
        { status: 400 }
      );
    }

    if (!serviceType || typeof serviceType !== 'string' || !serviceType.trim()) {
      return NextResponse.json(
        { success: false, message: 'Service type is required' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Create consultation record
    const consultationId = `CONS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const consultationData: ConsultationForm & { id: string; createdAt: string } = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      serviceType: serviceType.trim(),
      message: message.trim(),
      preferredTime: preferredTime ? new Date(preferredTime) : undefined,
      id: consultationId,
      createdAt: new Date().toISOString(),
    };

    // TODO: Save to database
    // TODO: Send confirmation email to user
    // TODO: Send notification email to admin

    // For now, we'll just log and return success
    console.log('Consultation received:', consultationData);

    // Send confirmation email (placeholder)
    try {
      await sendConfirmationEmail(email, name, consultationId);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Consultation request submitted successfully',
        consultationId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing consultation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process consultation request' },
      { status: 500 }
    );
  }
}

/**
 * Send confirmation email to user
 * This is a placeholder implementation
 */
async function sendConfirmationEmail(
  email: string,
  name: string,
  consultationId: string
): Promise<void> {
  // TODO: Implement email sending using your email service
  // Examples: SendGrid, Mailgun, AWS SES, etc.

  const emailContent = `
    <h2>Consultation Request Received</h2>
    <p>Dear ${name},</p>
    <p>Thank you for submitting your consultation request. We have received your inquiry and will review it shortly.</p>
    <p>Your consultation ID is: <strong>${consultationId}</strong></p>
    <p>We will contact you within 24 hours to discuss your project and schedule a consultation time.</p>
    <p>Best regards,<br/>The Team</p>
  `;

  // Placeholder: Log instead of sending
  console.log(`Sending confirmation email to ${email}:`, emailContent);

  // In production, you would use an email service like:
  // await sendEmail({
  //   to: email,
  //   subject: 'Consultation Request Received',
  //   html: emailContent,
  // });
}
