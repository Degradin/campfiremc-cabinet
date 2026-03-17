# CampFireMC Player Cabinet

This project contains the source code for the CampFireMC player cabinet, including the backend API and the frontend web application.

- `server/`: Node.js backend (Express, PostgreSQL)
- `client/`: React frontend

## Running the Application

There are two ways to run this project: using Docker (recommended for ease of use) or running the services locally on your machine.

### Running with Docker

**Prerequisites:**
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

**1. Environment Configuration:**

Create a `.env` file in the `server/` directory with the following content. The `DATABASE_URL` is pre-configured for the Docker setup.

```env
DATABASE_URL="postgresql://user:password@db:5432/campfiremc"
PORT=5000
JWT_SECRET="your-super-secret-key-change-me"
```

**2. Start the Application:**

From the root directory, run:

```bash
docker-compose up --build
```

This will build and start the database, server, and client. The database will be initialized on the first run.

### Running Locally (Without Docker)

This setup uses **SQLite** for the database, which is created and initialized automatically. No external database server is required.

**Prerequisites:**
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)

**1. Environment Configuration:**

Create a `.env` file in the `server/` directory. You only need to set the `PORT` and `JWT_SECRET`. The `DATABASE_URL` is not needed for the local SQLite setup.

```env
PORT=5000
JWT_SECRET="your-super-secret-key-change-me"
```

**2. Install & Run:**

From the root directory of the project, run the following commands:

```bash
# Install dependencies for all services
npm run install:all

# Start both server and client concurrently
npm start
```

The first time you run this, a `campfiremc.db` file will be created in the `server/` directory.

### Accessing the Application

- **Frontend (Player Cabinet):** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

## API Endpoints

- **Authentication:** `/auth/register`, `/auth/authenticate`
- **News:** `/news`
- **Textures:** `/textures/:uuid`, `/textures/upload`
