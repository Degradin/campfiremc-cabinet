# CampFireMC Player Cabinet

This project contains the source code for the CampFireMC player cabinet, including the backend API and the frontend web application.

- `server/`: Node.js backend (Express, PostgreSQL)
- `client/`: React frontend

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

### 1. Environment Configuration

Before running the application, you need to configure the environment variables.

**Backend:**

Create a `.env` file in the `server/` directory and add the following content. Replace the placeholder values with your actual database credentials and a secure JWT secret.

```env
DATABASE_URL="postgresql://user:password@db:5432/campfiremc"
PORT=5000
JWT_SECRET="your-super-secret-key-change-me"
```

**Note:** The `docker-compose.yml` file uses `user`, `password`, and `campfiremc` for the PostgreSQL service. If you change them in `docker-compose.yml`, make sure to update the `DATABASE_URL` here and in `docker-compose.yml` accordingly.

### 2. Running the Application

Once the environment is configured, you can start all the services using Docker Compose.

From the root directory of the project, run the following command:

```bash
docker-compose up --build
```

This command will:
- Build the Docker images for the `server` and `client` applications.
- Start the containers for the database, backend, and frontend.
- Initialize the database with the required tables on the first run.

### 3. Accessing the Application

- **Frontend (Player Cabinet):** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

## API Endpoints

- **Authentication:** `/auth/register`, `/auth/authenticate`
- **News:** `/news`
- **Textures:** `/textures/:uuid`, `/textures/upload`
