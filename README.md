# stach-buster
Stash Buster – A yarn and pattern organization web app for knitters and crocheters
# Stash Buster

A web application for knitters and crocheters to manage yarn stashes and pattern collections.

## Tech Stack
- React (frontend)
- Node.js + Express (backend)
- MongoDB (database)

## Core Features
- Yarn stash inventory
- Pattern library
- Yarn-to-pattern matching
- User authentication

## Project Status
CSC 520 Capstone – In Development

## Features

### Backend (Node.js + Express + MongoDB)
- User registration and login with JWT authentication
- Secure password hashing with bcrypt
- Full CRUD operations for Yarn Stash (protected by user ownership)
- Pattern model and protected CRUD routes
- MongoDB Atlas integration with Mongoose

### Frontend (React + Vite)
- Responsive login interface
- React Router for navigation
- Axios API service with automatic JWT token handling
- Protected routes setup

## Current Status (March 30, 2026)

- Backend foundation complete (Auth + Yarn Stash + Patterns)
- Frontend structure set up and running
- Login page fully functional and connected to backend
- Ready for Yarn Stash and Pattern UI development

## Tech Stack

- **Frontend**: React, Vite, React Router, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- **Database**: MongoDB Atlas

## How to Run (Development)

### 1. Clone the repository
```bash
git clone https://github.com/Merry567/stach-buster.git
cd stach-buster