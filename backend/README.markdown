# Veriffyvista Backend

This is the backend for the Veriffyvista web application, built with Node.js, Express, and TypeScript. It provides API endpoints (`/api/signup` and `/api/signin`) to handle user authentication, connecting to an existing MySQL database (`veriffyvista_db`) with a `users` table for storing and verifying user credentials securely using bcrypt.

## Prerequisites

- **Node.js**: Version 16 or higher (LTS recommended).
- **MySQL**: Running with the `veriffyvista_db` database and `users` table already created.
- **TypeScript**: For compiling `.ts` files.
- **Frontend**: The Veriffyvista frontend (React/Vite) running on `http://localhost:5173` (or your configured URL).

## Project Structure

```
backend/
├── server.ts          # Main Express server with API endpoints
├── .env              # Environment variables (not tracked in Git)
├── package.json      # Node.js dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── node_modules/     # Installed dependencies
```

## Setup Instructions

### 1. Initialize the Project
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Initialize a Node.js project (if not already done):
   ```bash
   npm init -y
   ```

### 2. Install Dependencies
Install the required packages:
```bash
npm install express mysql2 bcryptjs cors dotenv
npm install --save-dev typescript ts-node @types/express @types/bcryptjs @types/cors
```
Initialize TypeScript configuration (if not already present):
```bash
npx tsc --init
```
Ensure `tsconfig.json` includes `"target": "ESNext"` and `"module": "CommonJS"`.

### 3. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=veriffyvista_db
VITE_FRONTEND_URL=http://localhost:5173
PORT=3000
```
- Replace `your_mysql_user` and `your_mysql_password` with your MySQL credentials.
- Set `VITE_FRONTEND_URL` to the frontend’s URL (e.g., `http://localhost:5173` for Vite).
- Add `.env` to `.gitignore`:
  ```
  .env
  node_modules/
  ```

### 4. Verify MySQL Database
The backend assumes the `veriffyvista_db` database and `users` table already exist with the schema:
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- Ensure MySQL is running and the credentials in `.env` can access `veriffyvista_db`.
- If the table schema differs, update the backend queries in `server.ts` accordingly.

### 5. Configure Frontend Proxy
To allow the frontend (e.g., `http://localhost:5173`) to communicate with the backend (`http://localhost:3000`), add a proxy to the frontend’s `vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```
This proxies `/api/*` requests (e.g., `/api/signup`) to the backend.

### 6. Run the Backend
Start the server:
```bash
ts-node server.ts
```
- The server runs on `http://localhost:3000` (or the port in `.env`).
- It connects to the MySQL `users` table for authentication.

### 7. Run the Frontend
In a separate terminal, navigate to the frontend directory (e.g., `frontend/`) and start the Vite server:
```bash
cd ../frontend
npm run dev
```
The frontend typically runs on `http://localhost:5173`.

### 8. Test Authentication
The backend automatically checks the `users` table for sign-up and sign-in:
- **Sign-Up**:
  1. Open `http://localhost:5173` and navigate to the sign-up form.
  2. Enter a full name, email, and password (minimum 6 characters).
  3. Submit the form. The backend:
     - Validates input (missing fields, email format, password length).
     - Checks if the email exists in the `users` table.
     - If unique, hashes the password with bcrypt and inserts the user.
     - Returns `{ "message": "Sign up successful. Please sign in." }`.
- **Sign-In**:
  1. Switch to sign-in mode, enter a registered email and password, and submit.
  2. The backend:
     - Checks if the email exists in the `users` table.
     - Verifies the password against the stored hash.
     - Returns user data (`id`, `full_name`, `email`) or an error.
- The frontend displays success or error messages.

## API Endpoints

- **POST `/api/signup`**:
  - **Body**: `{ "full_name": string, "email": string, "password": string }`
  - **Response**:
    - `201`: `{ "message": "Sign up successful. Please sign in." }`
    - `400`: `{ "message": "Error message" }` (e.g., invalid email, duplicate email)
    - `500`: `{ "message": "Failed to create account. Please try again." }`
  - Automatically checks for duplicate emails and stores new users.
- **POST `/api/signin`**:
  - **Body**: `{ "email": string, "password": string }`
  - **Response**:
    - `200`: `{ "message": "Sign in successful.", "user": { "id": number, "full_name": string, "email": string } }`
    - `401`: `{ "message": "Invalid email or password." }`
    - `500`: `{ "message": "Failed to sign in. Please try again." }`
  - Automatically verifies credentials against the `users` table.

## Updating Frontend for Sign-In
The frontend’s `signin.tsx` has a placeholder for `/api/signin`. Update the `handleSignIn` function:
```tsx
const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.email || !formData.password) {
    setError('Email and password are required.');
    return;
  }

  try {
    const response = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.message || 'An error occurred during sign in.');
      return;
    }

    setSuccess('Sign in successful! Welcome back.');
    setFormData({ fullName: '', email: '', password: '' });
    // Optional: Store user data or redirect
    // localStorage.setItem('user', JSON.stringify(data.user));
    // window.location.href = '/dashboard';
  } catch (err) {
    setError('Failed to connect to the server. Please try again.');
  }
};
```

## Troubleshooting

- **Database Connection Errors**:
  - Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.env`.
  - Ensure MySQL is running and the credentials can access `veriffyvista_db`.
- **CORS Errors**:
  - Confirm `VITE_FRONTEND_URL` matches the frontend’s URL (e.g., `http://localhost:5173`).
  - Check the Vite proxy in `vite.config.ts`.
- **API Not Found**:
  - Ensure the backend is running (`ts-node server.ts`) and the Vite proxy is configured.
- **Sign-In Fails**:
  - Verify the `handleSignIn` function is updated in `signin.tsx`.
  - Check the `users` table for correct data (e.g., hashed passwords).

## Deployment Notes
- **Development**: Run backend and frontend locally as described.
- **Production**:
  - Deploy the backend to a Node.js host (e.g., Render, Heroku, AWS).
  - Deploy the frontend to a static host (e.g., Vercel, Netlify).
  - Update `VITE_FRONTEND_URL` in `backend/.env` to the frontend’s production URL.
  - Remove the Vite proxy and update API URLs in `signin.tsx` to the backend’s production URL (e.g., `fetch('https://your-backend.com/api/signup')`).
- **Security**: Ensure `.env` is not exposed in Git. Use environment variables on your hosting platform.

## Next Steps
- Add JWT authentication for session management.
- Extend the API (e.g., password reset, Google OAuth server-side validation).
- Contact the developer for assistance.

npm install --save-dev ts-node
npx ts-node server.ts


npm install express mysql2 bcryptjs jsonwebtoken cors dotenv
npm install --save-dev @types/express @types/jsonwebtoken @types/cors