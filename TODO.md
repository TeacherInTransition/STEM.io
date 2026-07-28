# STEM.io Project Roadmap & Backend Enhancements

## 1. Backend Architecture & API Enhancements
- [x] **Standardize API Envelopes:** Wrap all REST responses (e.g., `/api/gemini/generate`) in a consistent JSON response structure (`{ success, data, error }`).
- [x] **Input Validation:** Introduce runtime schema validation (e.g., Zod) for API request payloads.
- [x] **Environment Variable Validation:** Validate required environment variables (e.g., `GEMINI_API_KEY`) during server initialization.
- [x] **Modular Route Structure:** Separate API route definitions from `server.ts` into a dedicated `server/routes/` directory.
- [x] **Centralized Error Middleware:** Implement global Express error handling middleware to handle uncaught exceptions consistently.

## 2. Code Refactoring & Maintainability
- [x] **Firebase Client Submodules:** Separate authentication helpers, Firestore queries, and Classroom integration in `src/lib/firebase.ts` into dedicated modules.
- [x] **Type Definition Consolidation:** Expand `src/types.ts` to eliminate residual `any` castings across UI components.
- [x] **Package Manager Alignment:** Choose a single lockfile (`package-lock.json` or `bun.lock`) and standardize dependency management.
- [x] **Component Decomposition:** Break down monolithic UI components (e.g., `LessonBuilder.tsx`, `ResourcesPage.tsx`) into smaller reusable components.

## 3. Feature Roadmap & Enhancements
- [x] **Lesson Persistence Sync:** Synchronize lesson draft state from `LessonBuilder` directly to Firestore.
- [x] **Teacher Analytics Aggregation:** Add backend route handlers to aggregate student completion data and quest progress for the Teacher Dashboard.
- [x] **Role-Based Access Control:** Synchronize user role state (student vs. teacher) across frontend navigation and backend handlers.
- [x] **Caching Layer:** Cache curriculum data locally to reduce redundant network calls and improve load performance.

## 4. Google Classroom Integration Setup
- [x] **Classroom API Service Module:** Created `src/lib/classroom.ts` providing typed helpers (`listCourses`, `listCourseWork`, `createCourseWork`) for Google Classroom REST API v1.
- [x] **Classroom Express Routes:** Added `/api/classroom/courses` and `/api/classroom/courses/:courseId/coursework` endpoints with Bearer token authentication in `src/server/routes/classroom.ts`.
- [x] **Classroom Route Integration Tests:** Added unit test coverage for Classroom endpoint auth verification in `test/server.test.ts`.

## 5. CI/CD & Containerization
- [x] **GitHub Actions Workflow:** Created `.github/workflows/ci.yml` for automated linting, testing, and production build checks.
- [x] **Container Deployment Setup:** Added multi-stage `Dockerfile` and `.dockerignore` for containerized production deployment.
