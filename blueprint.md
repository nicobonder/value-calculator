
# Project Blueprint: MBA Stock Valuation Tool

## 1. Overview

This project is a sophisticated financial analysis application designed to provide users with robust tools for stock valuation. Built with React, it offers multiple valuation methodologies presented in a clean, modern, and intuitive dark-themed interface. The primary goal is to empower users to make informed investment decisions by calculating and comparing stock values based on different financial models.

## 2. Project Outline & Implemented Features

This section details the current architecture, design system, and features implemented in the application.

### 2.1. Core Technologies

*   **Frontend Framework:** React (using Vite for an efficient development experience).
*   **Routing:** `react-router-dom` for seamless client-side navigation between valuation pages.
*   **Styling:** Plain CSS with a centralized design system using CSS variables.

### 2.2. Application Structure

The project is organized into the following key directories:

*   `src/pages`: Contains the main top-level components for each distinct valuation tool.
    *   `ExitMultiple.jsx`: A valuation model based on exit multiples.
    *   `DCF.jsx`: A detailed Discounted Cash Flow (DCF) valuation model.
    *   `IsItCheap.jsx`: A tool to compare a stock's current price against a target price.
*   `src/components`: Houses all reusable UI components used across different pages.
    *   `Navbar.jsx`: The main navigation bar, centrally located, with the logo positioned to the left.
    *   `Footer.jsx`: A persistent footer at the bottom of the page.
    *   `HelpModal.jsx` & `HelpModalDCF.jsx`: Reusable and specialized modals providing context-sensitive help to the user. They feature a custom-styled, discreet scrollbar.
    *   `DataEntry.jsx`: Component for user input in the Exit Multiple model.
    *   `ScenarioSection.jsx`: Displays different valuation scenarios.
    *   `ResultsGrid.jsx`: Shows the results of the valuation calculations.
    *   `GrowthChart.jsx`: A visual component to display growth projections.
*   `src/hooks`: Contains custom React hooks that encapsulate the core business logic.
    *   `useValuation.js`: Logic for the Exit Multiple valuation.
    *   `useDcfValuation.js`: Logic for the DCF valuation model.
*   `src/services`: Manages API interactions, such as fetching financial data.
    *   `api.js`: Contains the function to fetch data from a backend service.
*   `src/styles`: Global and component-specific stylesheets.
    *   `App.css`: The core stylesheet defining the design system (CSS variables), global styles, and layout rules.
    *   `HelpModal.css`: Specific styles for the help modals, including the custom scrollbar.
*   `src/assets`: Static assets like images (e.g., `mba_logo.png`).

### 2.3. Design System & Styling

The application employs a modern, dark-themed aesthetic defined in `App.css` using CSS variables (`:root`) for consistency and easy maintenance.

*   **Color Palette:**
    *   `--bg-dark`: `#121212` (Main background)
    *   `--card-dark`: `#1e1e1e` (Card and modal backgrounds)
    *   `--primary-green`: `#2c735f` (Primary accent for buttons, links, highlights, and borders)
    *   `--text-main`: `#ffffff` (Primary text color)
*   **Typography:** The `Inter` font family is used for a clean and readable text.
*   **Layout:** The main layout is managed by the `.container` class, which centers the content with an `80%` width. The navigation bar (`.navbar-container`) now features a full-width bottom border and a perfectly centered navigation menu.
*   **Components:** Cards (`.card`), buttons (`.btn-*`), and modals are styled to conform to this dark, professional theme.

### 2.4. Navigation

Client-side routing is handled by `react-router-dom`. The `Navbar` component contains `NavLink` elements that direct the user to the three main pages of the application:

*   `/`: **Exit Multiple** (Home Page)
*   `/dcf`: **DCF Valuation**
*   `/isitcheap`: **Is It Cheap?**

An `active` class (`.nav-link.active`) highlights the current page the user is on, using the `--primary-green` color.
