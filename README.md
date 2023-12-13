
# Simple Message Board

Simple Message Board is a lightweight, easy-to-use messaging platform built with Svelte. This project allows users to post and view messages in a simple, clean interface.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before setting up the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (preferably the latest version)
- A package manager like [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/) for the database

### Installation

1. Clone the repository to your local machine:
   ```
   git clone https://github.com/your-username/simple-message-board.git
   ```

2. Navigate to the project directory:
   ```
   cd simple-message-board
   ```

3. Install the required dependencies:
   ```
   npm install
   ```

4. Copy the example `.env` file and fill in the values. You'll need to set up an AWS S3 bucket and PostgreSQL database as described below:
   ```
   # Copy this file to '.env' and fill in the values.

   # Database configuration
   DB_USER=your_database_user
   DB_HOST=your_database_host
   DB_NAME=your_database_name
   DB_PASSWORD=your_database_password
   DB_PORT=your_database_port

   # JWT secret key
   JWT_SECRET=your_jwt_secret_key

   # AWS S3 configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=your_aws_region
   S3_BUCKET_NAME=your_s3_bucket_name
   ```

### AWS S3 Bucket Setup

1. Log in to your AWS Management Console and navigate to the S3 service.
2. Click “Create Bucket.” Choose a unique name for your bucket and select the region.
3. Follow the on-screen instructions to create the bucket. Make sure to note down the bucket name, as it will be used in your `.env` file.

### PostgreSQL Database Setup

1. Install PostgreSQL if you haven't already.
2. Open your PostgreSQL client (e.g., pgAdmin or psql).
3. Create a new database for your application.
4. Run the SQL queries found in `migrations/init.sql` to set up the database schema.

5. Set up your PostgreSQL database by running the SQL queries found in `migrations/init.sql`.

### Running the Application

To start the development server, run the following command:

```
npm run dev
```

This will start the server and usually opens the app in a new browser tab. If it doesn't, you can manually visit [http://localhost:3000](http://localhost:3000) to view the application.

## Building for Production

To create a production build of your app, run:

```
npm run build
```

After building, you can preview the production build with:

```
npm run preview
```

> Note: Depending on your deployment target, you may need to set up an [adapter](https://kit.svelte.dev/docs/adapters) as per SvelteKit documentation.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
