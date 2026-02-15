/**
 * Backup Notification Email Template
 * 
 * Professional email template for backup success/failure notifications
 */

interface BackupNotificationData {
  type: 'success' | 'failure'
  title: string
  message: string
  backup?: {
    id: string
    fileName: string
    size: string
    sizeFormatted: string
    createdAt: Date
  }
  error?: any
  stats?: {
    totalBackups: number
    totalSizeFormatted: string
  }
  adminName?: string
}

export function getBackupNotificationTemplate(data: BackupNotificationData): string {
  const isSuccess = data.type === 'success'
  const statusColor = isSuccess ? '#10b981' : '#ef4444'
  const statusIcon = isSuccess ? '✅' : '❌'
  const statusText = isSuccess ? 'Success' : 'Failed'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #1f2937;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .status-badge {
      display: inline-block;
      margin-top: 16px;
      padding: 8px 20px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      backdrop-filter: blur(10px);
    }
    .content {
      padding: 40px 30px;
    }
    .status-card {
      background: ${isSuccess ? '#f0fdf4' : '#fef2f2'};
      border-left: 4px solid ${statusColor};
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .status-card h2 {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: ${statusColor};
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-card p {
      margin: 0;
      color: #6b7280;
      line-height: 1.6;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 30px 0;
    }
    .info-item {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .info-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .info-value {
      font-size: 18px;
      color: #1f2937;
      font-weight: 700;
    }
    .details-section {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .details-section h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #374151;
      font-weight: 600;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #6b7280;
      font-size: 14px;
    }
    .detail-value {
      color: #1f2937;
      font-weight: 600;
      font-size: 14px;
    }
    .action-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .action-button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 8px 0;
      color: #6b7280;
      font-size: 14px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        margin: 0;
        border-radius: 0;
      }
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>${statusIcon} Backup ${statusText}</h1>
      <div class="status-badge">
        Automated Backup System
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      ${data.adminName ? `<p style="margin: 0 0 20px 0; color: #6b7280;">Hi ${data.adminName},</p>` : ''}

      <!-- Status Card -->
      <div class="status-card">
        <h2>${statusIcon} ${data.title}</h2>
        <p>${data.message}</p>
      </div>

      ${isSuccess && data.backup ? `
      <!-- Backup Details -->
      <div class="details-section">
        <h3>📦 Backup Details</h3>
        <div class="detail-row">
          <span class="detail-label">File Name</span>
          <span class="detail-value">${data.backup.fileName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">File Size</span>
          <span class="detail-value">${data.backup.sizeFormatted}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Created At</span>
          <span class="detail-value">${new Date(data.backup.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
      </div>

      ${data.stats ? `
      <!-- Statistics -->
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Total Backups</div>
          <div class="info-value">${data.stats.totalBackups}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Total Size</div>
          <div class="info-value">${data.stats.totalSizeFormatted}</div>
        </div>
      </div>
      ` : ''}
      ` : ''}

      ${!isSuccess && data.error ? `
      <!-- Error Details -->
      <div class="details-section">
        <h3>⚠️ Error Information</h3>
        <div class="detail-row">
          <span class="detail-label">Error Message</span>
          <span class="detail-value" style="color: #ef4444;">${
            typeof data.error === 'string' ? data.error : data.error.message || 'Unknown error'
          }</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
      </div>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0;">
        <strong>Recommended Actions:</strong><br>
        • Check server disk space<br>
        • Review backup logs for details<br>
        • Verify database file permissions<br>
        • Contact system administrator if issue persists
      </p>
      ` : ''}

      <!-- Action Button -->
      <center>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/backups" class="action-button">
          View Backup Management
        </a>
      </center>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        This is an automated notification from your backup system. 
        ${isSuccess ? 'Your data is safe and secure.' : 'Please take action to ensure data safety.'}
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Enterprise Management System</strong></p>
      <p>Automated Backup Notification</p>
      <p style="margin-top: 16px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/backups">Backup Management</a> • 
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/logs">View Logs</a> • 
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings">Settings</a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">
        © ${new Date().getFullYear()} Enterprise Management System. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Get plain text version of backup notification
 */
export function getBackupNotificationText(data: BackupNotificationData): string {
  const isSuccess = data.type === 'success'
  const statusIcon = isSuccess ? '✅' : '❌'

  let text = `${statusIcon} Backup ${isSuccess ? 'Success' : 'Failed'}\n\n`
  
  if (data.adminName) {
    text += `Hi ${data.adminName},\n\n`
  }

  text += `${data.title}\n${data.message}\n\n`

  if (isSuccess && data.backup) {
    text += `Backup Details:\n`
    text += `- File Name: ${data.backup.fileName}\n`
    text += `- File Size: ${data.backup.sizeFormatted}\n`
    text += `- Created At: ${new Date(data.backup.createdAt).toLocaleString()}\n\n`

    if (data.stats) {
      text += `Statistics:\n`
      text += `- Total Backups: ${data.stats.totalBackups}\n`
      text += `- Total Size: ${data.stats.totalSizeFormatted}\n\n`
    }
  }

  if (!isSuccess && data.error) {
    text += `Error Information:\n`
    text += `- Error: ${typeof data.error === 'string' ? data.error : data.error.message || 'Unknown error'}\n`
    text += `- Time: ${new Date().toLocaleString()}\n\n`
    text += `Recommended Actions:\n`
    text += `• Check server disk space\n`
    text += `• Review backup logs for details\n`
    text += `• Verify database file permissions\n`
    text += `• Contact system administrator if issue persists\n\n`
  }

  text += `View Backup Management: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/backups\n\n`
  text += `---\n`
  text += `This is an automated notification from your backup system.\n`
  text += `© ${new Date().getFullYear()} Enterprise Management System`

  return text
}
