export const basicEmailTemplate = ({ name, message }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Email</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
          }
          .content {
            padding: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Hello, ${name}!</h1>
        </div>
        <div class="content">
          <p>${message}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
};
