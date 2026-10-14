# Township UI

Web application frontend for the Township management system. It connects to the Township API to manage residents, vehicles, visitors, cameras and reports.

## Features

- Login and role-based screens
- Resident / tenant and guest management
- Vehicle registration and entry / exit records
- Live camera view and camera status
- Reports and data tables
- Real-time updates from the API

## Tech Stack

- Angular (TypeScript)
- HTML and SCSS
- Node.js and npm

## Getting Started

**Prerequisites:** Node.js (LTS) and npm

1. Clone the repo:
   ```bash
   git clone https://github.com/prashantpawarids-dot/township-ui.git
   cd township-ui
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Set the Township API URL in the project's environment / config file.
4. Run the app:
   ```bash
   ng serve
   ```
   Then open `http://localhost:4200` in your browser.

## Build

```bash
ng build
```
The build output is created in the `dist/` folder, ready to deploy.

## Project Structure

| Folder | Purpose |
|---|---|
| `src/` | Application source code |
| `views/` | Pages and screens |
| `style/` | Shared styles |
| `backend/` | Backend files |

## Note

Do not commit passwords, API keys or build files (`dist/`, `node_modules/`) to GitHub.

## Author

**Prashant Pawar** - [@prashantpawarids-dot](https://github.com/prashantpawarids-dot)
