# Goefence - Frontend Web Application

This project is a React-based application built with Vite and TailwindCSS for tracking sales personnel geographically using Geofences.

## 🚀 Application Project Flow

The frontend application features Role-Based Access Control and interacts directly with our custom Node.js Backend API, as well as Firebase Cloud Messaging (FCM). 

### 1. Application Entry & Routing (`App.jsx`)
The application relies on `react-router-dom` for navigation, exposing three primary routes. If a user tries to access a route that doesn't exist, they are automatically redirected to the `/login` page:
*   `/login`: The authentication entry point.
*   `/admin`: The dashboard restricted to administrators.
*   `/sales`: The dashboard restricted to sales personnel.

### 2. User Authentication (`Login.jsx`)
*   Users input their email and password to sign in.
*   The application sends a `POST` request to the backend standard login endpoint (`http://localhost:5000/api/auth/login`).
*   If the credentials are valid, the backend responds with the user's data and role. This information is saved locally in the browser's `localStorage`.
*   Depending on their role (`admin` vs `sales`), the user is immediately routed to their respective dashboard.

### 3. Salesperson Flow (`SalesDashboard.jsx`)
*   **Authorization Check:** Upon entering, the component checks `localStorage` to ensure a user is logged in. If not, it redirects them back to the login page.
*   **Location Tracking:** It requests permission to use the browser's Geolocation API. If granted, it invokes `navigator.geolocation.watchPosition()` to continuously track the salesperson's real-time device movement.
*   **Real-time Updates:** Every time their location changes, it automatically fires off a `PUT` request (`/api/auth/location/:id`) to the backend to continually update their coordinates in the database.

### 4. Administrator Flow (`AdminDashboard.jsx`)
*   **Geofence Map:** The Admin Dashboard loads an interactive Leaflet map using `react-leaflet`. It fetches all currently saved active regions from the backend (`GET /api/zones`) and displays them as colored circles on the map.
*   **Zone Management:** Admins can click anywhere on the map to drop a pin. Using a sidebar menu, they can adjust a radius slider to define a new geofence bubble around that pin. These can be saved (`POST`), updated (`PUT`), or deleted (`DELETE`) via the backend APIs.
*   **Push Notifications (Firebase FCM):** When the component mounts, it asks the admin for browser Notification permissions. It then securely fetches a Firebase Cloud Messaging (FCM) token via `firebase-messaging-sw.js` and registers it with the backend (`POST /api/auth/fcm-token/:id`). 
*   **Alerts:** If the backend detects a salesperson crossing a geofence, it pushes an FCM notification. The Admin Dashboard intercepts these foreground payload messages and alerts the Admin in real-time.

## 🛠️ Technology Stack
- **React 19**
- **Vite** (Build Tool)
- **React-Router-Dom** (Routing)
- **Tailwind CSS** (Styling framework via Vite+PostCSS config)
- **Lucide-React** (Icons)
- **Leaflet & React-Leaflet** (Map Visualization)
- **Firebase v12** (Cloud Messaging & Push Notifications)
- **Axios** (API Requests)
