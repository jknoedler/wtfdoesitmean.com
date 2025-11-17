# Soundope Backend API

Backend API for Soundope, migrated from Base44 to DigitalOcean.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your DigitalOcean credentials
   ```

3. **Set up database:**
   - Create a PostgreSQL database on DigitalOcean
   - Run the schema:
     ```bash
     psql -h your-db-host -U your-user -d soundope -f database/schema.sql
     ```

4. **Import user data:**
   ```bash
   npm run import
   ```

5. **Start the server:**
   ```bash
   npm start
   # Or for development:
   npm run dev
   ```

## Environment Variables

See `env.example` for all required environment variables.

## API Endpoints

The API will be available at `http://localhost:3000/api` (or your configured port).

### Planned Endpoints:
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/me` - Update current user
- `GET /api/tracks` - List tracks
- `POST /api/tracks` - Create track
- `GET /api/feedback` - List feedback
- `POST /api/feedback` - Create feedback
- `POST /api/upload` - Upload file

## Database

Uses PostgreSQL on DigitalOcean. The schema is in `database/schema.sql`.

## File Storage

Uses DigitalOcean Spaces (S3-compatible) for file uploads.

## Next Steps

1. Implement authentication routes
2. Implement entity CRUD routes
3. Set up file upload to DigitalOcean Spaces
4. Add rate limiting
5. Add request validation
6. Set up error logging

