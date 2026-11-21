# MediFlow Healthcare ERP - Frontend Setup Guide

## Quick Start: Frontend Development Environment

This guide provides step-by-step instructions for setting up and running the MediFlow Healthcare ERP frontend application.

## Prerequisites

### Required Software
- **Node.js**: Version 18+ (LTS)
- **npm**: Version 9+ (comes with Node.js)
- **Internet Connection**: For installing dependencies

### Additional Tools (Optional but Recommended)
- **VS Code**: For code editing
- **Git**: For version control
- **Docker**: For containerized deployment (optional)

## Installation Steps

### 1. Project Structure

The MediFlow frontend is located in the `mediflow-frontend` directory:

```
C:\Users\trana\OneDrive\Desktop\aspnet-core
├── mediflow-frontend                    # Frontend project
│   ├── src/                           # React application source
│   ├── public/                       # Static assets
│   ├── package.json                  # Project configuration
│   ├── vite.config.ts                # Vite build tool configuration
│   └── README_FRONTEND_SETUP.md      # This setup guide
└── src/                               # Backend application
    ├── MediFlow.HttpApi.Host           # Main API service
    ├── MediFlow.Application             # Application layer
    └── ...                           # Other backend modules
```

### 2. Install Dependencies

Open your terminal and navigate to the `mediflow-frontend` directory:

```bash
cd /path/to/aspnet-core/mediflow-frontend
```

Install all required Node.js packages:

```bash
npm install
```

**What this does:**
- Downloads all dependencies from `package.json`
- Installs React, Ant Design, Axios, and other required packages
- Sets up the Node.js environment for the project

### 3. Environment Configuration

Before running the frontend, ensure your backend is running:

**Option A: Local Development**
1. Start the backend API server on port 44396:
   ```bash
   cd /path/to/aspnet-core
   dotnet run --project src/MediFlow.HttpApi.Host
   ```

**Option B: Docker Development**
```bash
docker-compose up -d
```

**Environment Variables (if needed):**
Set these in your `.env` file if required:
```env
VITE_FRONTEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:44396/api/app
```

### 4. Run the Frontend Development Server

Start the Vite development server:

```bash
npm run dev
```

**What this does:**
- Starts the React development server
- Enables hot module replacement (HMR)
- Opens the default browser automatically
- Provides real-time updates during development

### 5. Access the Application

After starting the development server, open your web browser and navigate to:

```
http://localhost:3000
```

## Key Features and Configuration

### Frontend Configuration Files

#### `package.json`
```json
{
  "name": "mediflow-frontend",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@ant-design/icons": "^6.3.4",
    "antd": "^6.6.5",
    "axios": "^1.20.0",
    "qrcode.react": "^4.2.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.4"
  }
}
```

#### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: 'localhost'
  }
})
```

### Project Structure Overview

#### Main Application Components
- **`src/`**: React application source code
- **`src/components/`**: Reusable UI components
- **`src/pages/`**: Individual page components
- **`src/services/`**: API service integrations
- **`src/layouts/`**: Application layouts (Admin, Pharmacy, etc.)
- **`src/assets/`**: Static assets and images

#### Key Features Implemented
1. **Role-Based Access Control**: Admin, Pharmacy, Supplier, Warehouse, Sales
2. **Burgundy Theme**: Custom design with `#800020` color scheme
3. **Ant Design Integration**: Modern UI components
4. **API Integration**: Real backend communication with JWT auth
5. **Responsive Design**: Mobile-friendly interfaces
6. **Routing**: React Router for navigation between modules

### Development Workflow

#### Typical Development Steps
1. **Start Backend**: Ensure MediFlow API is running on port 44396
2. **Start Frontend**: Run `npm run dev` in the frontend directory
3. **Develop**: Make changes to React components
4. **Test**: Use browser developer tools
5. **Build**: Run `npm run build` for production deployment

#### Hot Reload Features
- **Changes to components**: Automatic reload without page refresh
- **CSS updates**: Styles updated in real-time
- **API modifications**: Backend communication tested live

### Troubleshooting

#### Common Issues and Solutions

**Issue 1: "npm is not recognized"**
```bash
# On Windows, open PowerShell as Administrator and run:
# Set-ExecutionPolicy RemoteSigned -Scope Process
# Then run npm commands again
```

**Issue 2: Port 3000 Already in Use**
```bash
# Check what's running on port 3000:
lsof -i :3000

# Stop the process if it's not needed:
pkill $(lsof -t -i:3000)
```

**Issue 3: Missing Dependencies**
```bash
# Clear npm cache and reinstall
clean-install:
npm cache clean --force
npm install
```

**Issue 4: Build Errors**
```bash
# Check for TypeScript errors
npm run lint

# For detailed errors, run:
npx tsc --noEmit
```

### Production Deployment

#### Build for Production
```bash
cd mediflow-frontend
npm run build
```

The production build will create a `dist/` folder with optimized static files ready for deployment.

#### Deploy to Production Server
```bash
# Upload the contents of /mediflow-frontend/dist/ to your web server
# Configure your web server to serve static files
# Update environment variables if needed
```

### Advanced Configuration

#### Environment Variables
Create a `.env` file in the `mediflow-frontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:44396/api/app
VITE_AUTH_URL=http://localhost:44396/api/account

# App Configuration
VITE_APP_NAME=MediFlow ERP
VITE_APP_DESCRIPTION=Healthcare & Supply Chain Management System

# Feature Flags
VITE_FEATURE_AUTH=true
VITE_FEATURE_BILLING=true
VITE_FEATURE_INVENTORY=true
```

#### Customizing the Build
Edit `vite.config.ts` to customize:
- **Base URL**: For deployment to subdirectories
- **Proxy settings**: For API proxy configuration
- **Static asset handling**: For custom file processing

### Final Steps

#### After Setting Up
1. **Test Backend**: Ensure the API server is running on port 44396
2. **Test Frontend**: Navigate to `http://localhost:3000`
3. **Login**: Test with demo credentials:
   - **Admin**: `mehmutzortmaz` / `Admin123!`
   - **Pharmacy**: `eczane_ahmet` / `Pharmacy123!`
   - **Supplier**: `tedarikci_mustafa` / `Supplier123!`
   - **Warehouse**: `depo_ bê` / `Warehouse123!`
   - **Sales**: `sales_cemal` / `Sales123!`
4. **Explore**: Navigate through different role-specific dashboards

#### Next Steps
- **Learn more**: Study the React documentation
- **Customize**: Modify components to meet your needs
- **Deploy**: Set up production hosting
- **Maintain**: Set up monitoring and backup procedures

## Summary

The MediFlow Healthcare ERP frontend is a modern React application using Ant Design components with JWT authentication and role-based access control. It provides a comprehensive interface for healthcare and pharmaceutical supply chain management operations.

**Key Features**:
- ✅ Role-based authentication (5 user roles)
- ✅ Responsive design with Burgundy theme
- ✅ Real API integration with backend
- ✅ Hot reload development experience
- ✅ Production-ready build configuration
- ✅ Comprehensive documentation

**Quick Start**: Simply run `cd mediflow-frontend && npm install && npm run dev` and you're ready to start developing or testing the MediFlow Healthcare ERP frontend application!