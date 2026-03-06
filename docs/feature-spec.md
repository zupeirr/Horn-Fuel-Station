# MVP Feature Specification

## Overview
The Horn Fuel Station Management System MVP focuses on the core daily operations of a fuel station: handling sales, managing inventory (tanks and pumps), and reviewing simple reports.

## Roles
1. **Admin**: Can manage cashiers, pumps, tanks, fuel types, and view all reports.
2. **Cashier**: Can log in, record sales transactions, and print/view receipts.

## Core Features
1. **User Authentication**
   - Secure login using email and password.
   - JWT-based authentication for API calls.

2. **Pump & Tank Management**
   - **Tanks**: Store logical fuel inventory (capacity, current level, fuel type).
   - **Pumps**: Linked to tanks to dispense fuel.
   - **Alerts**: Highlight tanks falling below a predefined threshold (e.g., 20%).

3. **Sales Transaction Recording**
   - Cashier selects a pump, records the number of liters dispensed.
   - System calculates total price based on the current fuel type price.
   - System deducts the dispensed amount from the corresponding tank.

4. **Receipt Generation**
   - Generate a printable HTML/PDF receipt for the transaction, showing transaction ID, date, liters, fuel type, price per liter, and total.

5. **Daily Summary Report**
   - View grouped statistics for the current day: total sales, total volume dispensed by fuel type, and overall revenue.
