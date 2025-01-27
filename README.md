# BusinessTracker - Inventory Management System

<div align="center">
  
### Created by [Syed Bilal Alam](https://github.com/syedbilalalam1)
[![GitHub](https://img.shields.io/badge/GitHub-Follow%20@syedbilalalam1-black?style=for-the-badge&logo=github)](https://github.com/syedbilalalam1)

</div>

---

A full-stack inventory management system built with React, Node.js, Express, and MongoDB.

## Features

- User Authentication
- Product Management
- Stock Tracking
- Purchase Management
- Sales Management
- Store Management
- Shipment Tracking
- Monthly Sales Analytics
- Stock History
- Real-time Stock Updates

## Tech Stack

- Frontend: React.js with Tailwind CSS
- Backend: Node.js with Express
- Database: MongoDB Atlas
- Authentication: Custom JWT-based

## Prerequisites

- Node.js >= 16.0.0
- MongoDB Atlas account
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd React-Inventory-Management-System
```

2. Install dependencies:
```bash
npm run install-all
```

3. MongoDB Configuration:
   - Open `Backend/models/index.js`
   - Replace the MongoDB connection string with your own:
```javascript
const uri = "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority";
```
   You can get this connection string from your MongoDB Atlas dashboard:
   - Log into MongoDB Atlas
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string and replace `<username>`, `<password>`, and `<database>` with your values

4. Start the development servers:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:4000`.

## Default Login Credentials

The application comes with two predefined users for testing:
- Admin User:
  - Username: admin
  - Password: admin
- Regular User:
  - Username: user@company.com
  - Password: user123

## Project Structure

```
├── Frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── assets/        # Static assets
│   └── package.json
├── Backend/                # Node.js backend application
│   ├── controller/        # Route controllers
│   ├── models/           # Database models
│   ├── router/           # Express routes
│   └── server.js         # Server configuration
└── package.json
```

## Security Notice

⚠️ **Important:** Before deploying to production:
1. Enable CORS protection
2. Add rate limiting
3. Implement proper session management
4. Consider implementing password hashing

## API Endpoints

- `/api/login` - User authentication
- `/api/store` - Store management
- `/api/product` - Product management
- `/api/purchase` - Purchase management
- `/api/sales` - Sales management
- `/api/stock` - Stock management
- `/api/shipment` - Shipment tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
