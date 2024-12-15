# HCM-IU Schedule System

This project is a scheduling system for HCM-IU students, providing functionalities to fetch course schedules, exam schedules, and manage user authentication.

## Features

- **Course Fetcher**: Fetches and displays available courses.
- **Exam Schedule**: Fetches and displays exam schedules.
- **Timetable Management**: Allows users to create and manage their timetables.
- **Google Calendar Integration**: Generates Google Calendar links for courses and exams.
- **User Authentication**: Authenticates users using Edusoft and Blackboard credentials.

## Frontend

The frontend is built with React, TypeScript, and Vite. It uses Tailwind CSS for styling and Radix UI for components.

### Installation

1. Navigate to the `frontend` directory:
    ```sh
    cd hcm-iu-schedule-system/frontend
    ```
2. Install dependencies:
    ```sh
    npm install
    ```
3. Start the development server:
    ```sh
    npm run dev
    ```

## Backend

The backend is built with Node.js, Express, and Puppeteer. It scrapes data from Edusoft and Blackboard.

### Installation

1. Navigate to the `backend` directory:
    ```sh
    cd hcm-iu-schedule-system/backend
    ```
2. Install dependencies:
    ```sh
    npm install
    ```
3. Start the server:
    ```sh
    npm start
    ```

## Configuration

Create a `.env` file in the `backend` directory with the following content:
```
PORT=3001
```

## Usage

1. Start the backend server.
2. Start the frontend development server.
3. Access the application at `http://localhost:3000`.

## License

This project is licensed under the MIT License.