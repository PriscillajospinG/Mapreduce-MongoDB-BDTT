# Climate Analysis React Frontend

A modern, responsive React dashboard for climate data analysis with MapReduce operations.

## 🚀 Features

- **Dashboard**: Overview of climate data statistics
- **Analytics**: Interactive charts and visualizations (6 MapReduce operations)
- **Data Upload**: Upload datasets and manage data processing
- **Settings**: Configure backend and frontend preferences
- **Real-time Updates**: Live data refresh and monitoring
- **Responsive Design**: Works on desktop, tablet, and mobile

## 📦 Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Recharts**: Data visualization
- **Axios**: HTTP client
- **React Router**: Navigation
- **Lucide React**: Icons

## 🔧 Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` (optional):
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 💻 Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

The dev server automatically proxies API calls to `http://localhost:5000`

## 🏗️ Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── api.js              # Axios instance and API calls
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── Charts.jsx          # Chart components
│   │   ├── DatasetUpload.jsx   # File upload form
│   │   └── StatsCard.jsx       # Statistics cards
│   ├── pages/
│   │   ├── Dashboard.jsx       # Home dashboard
│   │   ├── Analytics.jsx       # Analytics & charts page
│   │   ├── Upload.jsx          # Data upload page
│   │   └── Settings.jsx        # Settings page
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # React DOM entry
│   └── index.css               # Global styles
├── index.html                  # HTML entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🔌 API Integration

The frontend connects to the backend API at `http://localhost:5000/api`

### Endpoints Used:

- `GET /api/health` - Health check
- `GET /api/stats/summary` - Dashboard statistics
- `GET /api/analytics/avg-temp-by-country` - Average temperature by country
- `GET /api/analytics/temp-trends-by-year` - Temperature trends
- `GET /api/analytics/seasonal-analysis` - Seasonal analysis
- `GET /api/analytics/extreme-temps` - Extreme temperatures
- `GET /api/analytics/decade-analysis` - Decade analysis
- `GET /api/analytics/records-by-country` - Records per country
- `POST /api/upload` - Upload dataset
- `POST /api/preprocess/<dataset>` - Preprocess data
- `POST /api/mapreduce/run` - Run MapReduce operations

## 📊 Pages

### Dashboard
- Summary statistics
- Quick actions
- Dataset upload
- System status

### Analytics
- Average temperature by country (bar chart)
- Temperature trends by year (line chart)
- Seasonal analysis (pie chart)
- Extreme temperatures (table)
- Decade analysis (line chart)
- Records per country (horizontal bar chart)

### Upload
- Dataset file upload
- Data preprocessing
- MapReduce execution
- Processing status

### Settings
- Backend configuration
- Performance settings
- Display settings
- System information

## 🎨 Styling

### Tailwind CSS Classes

- `.card` - Card container with shadow
- `.btn-primary` - Primary blue button
- `.btn-secondary` - Secondary gray button
- `.section-title` - Large page title
- `.subsection-title` - Medium section title
- `.container` - Max-width container with padding

### Color Scheme

- Primary: Blue (`#0ea5e9`)
- Accent: Purple (`#764ba2`) & Gradient
- Success: Green (`#10b981`)
- Warning: Amber (`#f59e0b`)
- Error: Red (`#ef4444`)

## 🔄 Data Flow

1. User uploads CSV dataset via Upload page
2. Backend processes and stores in MongoDB
3. Frontend fetches statistics for Dashboard
4. User navigates to Analytics to view charts
5. Charts are populated with MapReduce results
6. Settings allow configuration adjustments

## 🚨 Error Handling

- API errors are caught and displayed to user
- Retry buttons on error messages
- Loading states with spinner
- Fallback UI when no data available

## 📱 Responsive Design

- Mobile-first approach
- Grid layouts that adapt to screen size
- Hamburger menu on small screens
- Touch-friendly buttons and inputs
- Optimized chart sizes

## 🔐 Security

- CORS proxy configured in Vite
- Environment variables for API URL
- Input sanitization for forms
- Error handling without exposing sensitive info

## 📝 Customization

### Adding a New Chart

1. Create chart component in `components/Charts.jsx`
2. Add API call in `api/api.js`
3. Fetch data in `pages/Analytics.jsx`
4. Add to chart grid layout

### Adding a New Page

1. Create component in `pages/`
2. Add route in `App.jsx`
3. Add navigation link in `Navbar.jsx`
4. Add relevant API calls in `api/api.js`

### Styling Changes

- Edit `src/index.css` for global styles
- Edit `tailwind.config.js` for theme colors
- Use Tailwind classes in JSX files

## 🐛 Troubleshooting

### API Connection Issues
- Ensure backend is running on `http://localhost:5000`
- Check CORS settings in backend
- Verify proxy configuration in `vite.config.js`

### Chart Not Displaying
- Check browser console for errors
- Verify API endpoint returns data
- Ensure data format matches chart requirements

### Styling Issues
- Clear cache: `npm run build && rm -rf dist`
- Check Tailwind config is loaded
- Verify postcss plugins are installed

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts Documentation](https://recharts.org)
- [Axios Documentation](https://axios-http.com)

## 🤝 Contributing

To contribute improvements:

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

This project is part of the Climate Analysis MapReduce system.

---

**Built with ❤️ for climate data analysis**
