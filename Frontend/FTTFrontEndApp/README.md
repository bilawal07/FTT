# Family Task Tracker (FTT) - Frontend

Lightweight, mobile-first Angular Standalone application with Tailwind CSS and Angular Material/CDK for task delegation, mutual accountability, and real-time collaboration across multiple workspaces.

## Getting Started

1. **Start Development Server**:
   ```bash
   npm start
   # or
   npm start -- -o
   ```
   Opens browser at `http://localhost:4200/`.

2. **Build for Production**:
   ```bash
   npm run build
   ```
   Compiles optimized production bundles into `dist/FTTFrontEndApp`.

3. **Backend API Connection**:
   API endpoint is configured in `src/environments/environment.ts` pointing to `http://localhost:5224/api`.
