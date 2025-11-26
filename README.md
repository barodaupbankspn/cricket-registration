# Cricket Team Registration Website

A modern, visually stunning cricket team registration website with player registration, admin dashboard, and data management features.

## 🎯 Features

- **Player Registration Form**: Comprehensive registration with validation
- **Admin Dashboard**: Manage and view all registered players
- **CSV Export**: Download player data as CSV file
- **Search & Filter**: Find players by name, role, or experience
- **Statistics**: View team composition at a glance
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Premium UI**: Modern design with glassmorphism and animations
- **Jersey Background**: Custom cricket jersey design in background

## 🚀 Getting Started

### Local Development

1. **Clone or download** this project
2. **Open `index.html`** in your web browser
3. That's it! No build process required.

### File Structure

```
cricket-registration/
├── index.html          # Main registration page
├── admin.html          # Admin dashboard
├── styles.css          # Design system and styles
├── app.js             # Registration form logic
├── admin.js           # Admin dashboard logic
├── images/
│   └── jersey.jpg     # Cricket jersey background
└── README.md          # This file
```

## 📝 Usage

### For Players

1. Visit `index.html`
2. Fill in the registration form
3. Click "Register Now"
4. You'll see a success message

### For Admins

1. Visit `admin.html`
2. Enter password: `admin123` (change this in `admin.js` for production)
3. View all registered players
4. Export data as CSV
5. Search and filter players

## 🔧 Configuration

### Change Admin Password

Edit `admin.js` line 4:
```javascript
const ADMIN_PASSWORD = 'your-secure-password';
```

### Google Sheets Integration

To integrate with Google Sheets:

1. **Create a Google Apps Script**:
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Add the following code:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  // Add headers if first row is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Name', 'Age', 'Contact', 'Email', 'Role', 'Batting', 'Bowling', 'Experience', 'Date']);
  }
  
  // Add player data
  if (Array.isArray(data)) {
    data.forEach(player => {
      sheet.appendRow([
        player.name,
        player.age,
        player.contact,
        player.email,
        player.role,
        player.battingStyle,
        player.bowlingStyle,
        player.experience,
        new Date(player.registeredAt)
      ]);
    });
  } else {
    sheet.appendRow([
      data.name,
      data.age,
      data.contact,
      data.email,
      data.role,
      data.battingStyle,
      data.bowlingStyle,
      data.experience,
      new Date(data.registeredAt)
    ]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

2. **Deploy as Web App**:
   - Click "Deploy" > "New deployment"
   - Select "Web app"
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
   - Copy the Web App URL

3. **Update the code**:
   - In `app.js`, uncomment and update the `sendToGoogleSheets` function
   - In `admin.js`, uncomment and update the sync function
   - Replace `YOUR_GOOGLE_APPS_SCRIPT_URL` with your Web App URL

## 🌐 Deployment

### Option 1: GitHub Pages (Free)

1. Create a GitHub repository
2. Push your code
3. Go to Settings > Pages
4. Select main branch
5. Your site will be live at `https://yourusername.github.io/repo-name`

### Option 2: Netlify (Free)

1. Go to [Netlify](https://netlify.com)
2. Drag and drop your project folder
3. Your site is live instantly!

### Option 3: Vercel (Free)

1. Go to [Vercel](https://vercel.com)
2. Import your project
3. Deploy with one click

## 🎨 Customization

### Colors

Edit CSS variables in `styles.css`:
```css
:root {
  --primary: #00d4ff;
  --secondary: #ff6b35;
  --accent: #ffd700;
  /* ... */
}
```

### Form Fields

Add or modify fields in `index.html` and update validation in `app.js`.

## 📊 Data Storage

Currently uses **localStorage** for data persistence. Data is stored in the browser.

**Note**: For production use, consider:
- Backend database (Firebase, MongoDB, etc.)
- Google Sheets integration
- Regular backups via CSV export

## 🔒 Security Notes

- Change the default admin password
- For production, implement proper authentication
- Consider using environment variables for sensitive data
- Add HTTPS when deploying

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🤝 Support

For issues or questions, please contact the administrator.

## 📄 License

Free to use for your cricket team!

---

**Made with ❤️ for Cricket Lovers**
