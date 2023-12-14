
# Simple Message Board

Simple Message Board is a user-friendly and efficient forum platform developed with SvelteKit. It's designed to support community interactions and discussions in an organized manner. By integrating TypeScript, the project gains enhanced code clarity and reliability, contributing to a more manageable development process.

The platform utilizes PostgreSQL for robust and structured data management, which accommodates various features essential for a forum, such as user profiles, permissions, and discussion threads. The interface, styled with Tailwind CSS, offers a clean and responsive layout, making it accessible and easy to navigate for users.

Simple Message Board aims to provide a straightforward yet effective solution for online communities to engage, discuss, and share ideas in a collaborative space.

## Getting Started

These instructions will guide you through getting a copy of the project up and running on your local machine for development and testing purposes, as well as deploying it to Heroku.

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

4. Copy the example `.env` file and fill in the values:

### AWS S3 Bucket Setup

1. Log in to your AWS Management Console and navigate to the S3 service.
2. Click “Create Bucket.” Choose a unique name for your bucket and select the region.
3. Follow the on-screen instructions to create the bucket. Make sure to note down the bucket name, as it will be used in your `.env` file.

### PostgreSQL Database Setup

1. Install PostgreSQL if you haven't already.
2. Open your PostgreSQL client (e.g., pgAdmin or psql).
3. Create a new database for your application.
4. Run the SQL queries found in `migrations/init.sql` to set up the database schema.
5. For seeding the database, execute the SQL scripts in `migrations/seeds/`.

### Running the Application

To start the development server, run the following command:

```
npm run dev
```

This will start the server and usually opens the app in a new browser tab. If it doesn't, you can manually visit [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

To create a production build of your app, run:

```
npm run build
```

After building, you can preview the production build with:

```
npm run preview
```

### Deploying to Heroku

1. Ensure you have the Heroku CLI installed and are logged in.
2. Create a Heroku app with `heroku create`.
3. Set up environment variables on Heroku using `heroku config:set`.
4. Deploy your application using `git push heroku master`.
5. Run database migrations on Heroku as needed.

> Note: For specific Heroku deployment steps and configurations, refer to the deployment section of the SvelteKit documentation.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
