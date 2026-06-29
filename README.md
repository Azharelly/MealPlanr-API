# MealPlanr API

The backend REST API for MealPlanr a meal planning app with NLP-powered recipe extraction. Built with NestJS and TypeScript, deployed on Railway.

## Overview

MealPlanr API handles authentication, recipe management, meal calendar, shopping lists, and nutritional analysis. It also acts as a bridge to the [NLP microservice](https://github.com/Azharelly/meal-planr-nlp), routing recipe extraction requests from PDFs, images, and URLs.


## Architecture

```
React Native App (Expo)
        ↓ HTTPS / JSON + JWT
   MealPlanr API  ←──────────────────┐
   NestJS + TypeORM                  │
        ↓                            │
   PostgreSQL          NLP Microservice
   (Railway)           Python + FastAPI + spaCy
```


## Features

- **JWT Authentication** - register, login, token refresh with Passport.js
- **Recipe management** - full CRUD, with image upload via Multer
- **NLP recipe import** - proxy to the NLP microservice for photo and URL imports
- **Meal calendar** - plan meals by day and slot (breakfast, lunch, dinner, snack)
- **Meal tracking** - mark meals as consumed, skipped, or partial
- **Shopping list** - auto-generated from planned meals
- **Nutritional analysis** - weekly adherence, behaviour patterns, streak tracking
- **Input validation** - class-validator + class-transformer on all DTOs


## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 + TypeScript |
| ORM | TypeORM + PostgreSQL |
| Auth | JWT + Passport.js + bcrypt |
| File uploads | Multer |
| HTTP client | Axios (NLP microservice calls) |
| Testing | Jest + Supertest |
| Deployment | Railway |


## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- NLP microservice running (see [meal-planr-nlp](https://github.com/Azharelly/meal-planr-nlp))

### Installation

```bash
npm install
```

### Environment variables

```env
DATABASE_URL=postgresql://user:password@host:5432/mealplanr
JWT_SECRET=your_jwt_secret
NLP_SERVICE_URL=http://localhost:8000
```

### Running the app

```bash
# development
npm run start:dev

# production
npm run start:prod
```

### Running tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```


## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login and get JWT |

### Recipes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/recipes` | Get all user recipes |
| POST | `/recipes` | Create recipe manually |
| POST | `/recipes/import/photo` | Import from image (NLP) |
| POST | `/recipes/import/url` | Import from URL (NLP) |
| PATCH | `/recipes/:id` | Update recipe |
| DELETE | `/recipes/:id` | Delete recipe |

### Calendar
| Method | Endpoint | Description |
|---|---|---|
| GET | `/calendar` | Get weekly meal plan |
| POST | `/calendar` | Add meal to slot |
| PATCH | `/calendar/:id` | Mark as consumed/skipped/partial |

### Analysis
| Method | Endpoint | Description |
|---|---|---|
| GET | `/analysis` | Weekly adherence + behaviour patterns |


## Project Structure

```
src/
├── auth/           # JWT strategy, guards, login/register
├── recipes/        # Recipe CRUD + NLP import proxy
├── calendar/       # Meal planning and tracking
├── analysis/       # Adherence stats and recommendations
├── shopping/       # Shopping list generation
└── common/         # DTOs, guards, interceptors
```


## Related Repositories

- [meal-planr-nlp](https://github.com/Azharelly/meal-planr-nlp) — NLP microservice (Python + spaCy + FastAPI)
- MealPlanr App — React Native frontend (Expo)

## Context

Developed as the backend for the MealPlanr final year project at Dublin Business School (BSc Computing, 2025–2026).
