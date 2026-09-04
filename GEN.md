Design a complete Owner/Admin-style dashboard UI for my sports ground booking web 


==================================================
1. OWNER DASHBOARD LAYOUT
==================================================

Create a persistent dashboard layout consisting of:

LEFT SIDEBAR:
- Slotify logo
- Dashboard
- My Grounds
- Resources
- Availability
- Bookings
- Earnings
- Payment Details
- Profile
- Logout

TOP NAVBAR:
- Page title
- Notification bell
- Owner avatar
- Owner name
- Small role label: "Owner"

The sidebar should clearly indicate the active page.

On mobile:
- Convert sidebar into a hamburger/drawer navigation.
- Keep the top navigation clean.

==================================================
2. OWNER DASHBOARD
==================================================

Create a dashboard homepage with:

Header:
"Good morning, [Owner Name]"
Subtitle:
"Here's what's happening with your sports facilities."

STATISTICS CARDS:
1. Total Bookings
2. Upcoming Bookings
3. Completed Bookings
4. Total Revenue

Example values:
- Total Bookings: 128
- Upcoming: 12
- Completed: 110
- Revenue: ₹1,24,500

Below the statistics:

RECENT BOOKINGS section

Display a clean table with:
- Booking ID
- Customer
- Ground
- Resource
- Date
- Time
- Amount
- Status
- View button

Example:
#1024 | Rahul Patel | Victory Sports Complex | Football Ground A | Sep 04, 2026 | 06:00 PM - 07:30 PM | ₹2,250 | CONFIRMED

Use status badges:
- PENDING
- CONFIRMED
- COMPLETED
- CANCELLED

MY GROUNDS section:
Show ground cards containing:
- Ground image
- Ground name
- Location
- Number of resources
- Status
- Manage button

MOST BOOKED RESOURCE section:
Show a simple visual summary of the most booked resource.
Do not create overly complex analytics.

==================================================
3. MY GROUNDS PAGE
==================================================

Header:
"My Grounds"

Right side:
"+ Add Ground" primary button

Display ground cards/grid.

Each card should contain:
- Ground image
- Ground name
- Location
- Supported sports
- Facilities
- Number of resources
- ACTIVE/INACTIVE status
- View
- Edit

Example:

Victory Sports Complex
Prahladnagar, Ahmedabad

Football • Cricket

Parking • Flood Lights • Washroom

4 Resources
ACTIVE

[View] [Edit]

Include an empty state:
"No grounds added yet"
"Create your first sports ground to start accepting bookings."

==================================================
4. ADD / EDIT GROUND PAGE
==================================================

Create a clean form.

Fields:

Ground Name
Description
Location
City

Supported Sports:
- Football
- Cricket
- Badminton
- Tennis
etc.

Facilities:
- Parking
- Flood Lights
- Washroom
- Drinking Water

Ground Images:
- Upload multiple images
- Image preview
- Remove image option

Status:
- Active
- Inactive

Buttons:
Cancel
Create Ground / Save Changes

The form should be divided into logical sections:

Basic Information
Location
Sports & Facilities
Images
Status

==================================================
5. GROUND DETAILS / MANAGE GROUND
==================================================

Create a detailed ground management page.

Show:
- Large ground image
- Ground name
- Location
- Description
- Supported sports
- Facilities
- Status

Then:

"Resources"

Display resource cards.

Example:

Football Ground A
Football
₹1,500 / hour
06:00 AM - 11:00 PM
ACTIVE

[Manage Resource]

Add:
"+ Add Resource"

==================================================
6. RESOURCES PAGE
==================================================

Header:
"Resources"

Button:
"+ Add Resource"

Include a Ground filter dropdown.

Display resources in a clean table/card layout.

Each resource contains:
- Resource name
- Ground
- Sport type
- Price per hour
- Opening time
- Closing time
- Status
- Edit
- Activate/Deactivate

Example:

Football Ground A
Victory Sports Complex
Football
₹1,500/hour
06:00 AM - 11:00 PM
ACTIVE

==================================================
7. ADD / EDIT RESOURCE
==================================================

Form fields:

Ground
Resource Name
Sport Type
Price Per Hour
Opening Time
Closing Time
Resource Images
Status

Use time inputs that display human-friendly 12-hour format such as:
06:00 AM
11:00 PM

Buttons:
Cancel
Create Resource / Save Changes

==================================================
8. AVAILABILITY PAGE
==================================================

Create a schedule/availability management interface.

Header:
"Availability"

Controls:
- Select Ground
- Select Resource
- Select Date

Show:

Operating Hours:
06:00 AM - 11:00 PM

Then show a visual daily schedule/timeline.

Example:

06:00 AM  AVAILABLE
07:00 AM  AVAILABLE
08:00 AM  BOOKED
09:00 AM  BOOKED
10:00 AM  AVAILABLE
11:00 AM  AVAILABLE
...

Use different visual states for:
- Available
- Booked
- Blocked

Buttons:
"+ Block Time"
"+ Block Date"

BLOCK TIME modal/form:

Date
Start Time
End Time
Reason

Example reason:
Maintenance

BLOCK DATE modal/form:

Date
Reason

Example:
Private Event

Make this interface easy for an owner to understand at a glance.

==================================================
9. BOOKINGS PAGE
==================================================

Header:
"Bookings"

Tabs/filters:
- All
- Pending
- Confirmed
- Completed
- Cancelled

Filters:
- Date
- Ground
- Resource

Display bookings in a professional table.

Columns:
Booking ID
Customer
Ground
Resource
Date
Time
Amount
Payment
Status
Action

Example:

#1024
Rahul Patel
Victory Sports Complex
Football Ground A
Sep 04, 2026
06:00 PM - 07:30 PM
₹2,250
ONLINE / PAID
CONFIRMED
View Details

==================================================
10. BOOKING DETAILS PAGE
==================================================

Create a detailed booking view.

Header:
"Booking #1024"

Large status badge:
CONFIRMED

CUSTOMER:
Rahul Patel
Email
Phone

GROUND:
Victory Sports Complex
Prahladnagar, Ahmedabad

RESOURCE:
Football Ground A
Football

BOOKING:
Date: September 04, 2026
Time: 06:00 PM - 07:30 PM
Duration: 1.5 Hours

PAYMENT:
Method: ONLINE
Payment Status: PAID
Amount: ₹2,250

BOOKING STATUS:
CONFIRMED

Actions:
- Mark Completed
- Cancel Booking where appropriate

For CASH bookings:
Show:
Payment Method: CASH
Payment Status: UNPAID

Provide:
"Mark as Paid"

Do not show unnecessary customer information.

==================================================
11. EARNINGS PAGE
==================================================

Header:
"Earnings"

Statistics:

Total Revenue
₹1,45,000

Pending Settlement
₹25,000

Settled Amount
₹1,20,000

Then:

PAYMENT HISTORY

Columns:
Booking
Customer
Amount
Payment Method
Payment Status
Settlement Status
Date

Example:

#1024 | Rahul Patel | ₹2,250 | ONLINE | PAID | SETTLED
#1025 | Amit Shah | ₹1,500 | ONLINE | PAID | PENDING
#1026 | Jay Patel | ₹1,000 | CASH | PAID | —

For online payments:
Settlement status can be:
PENDING
SETTLED

For cash:
Show settlement as "—" because cash is paid directly to the owner.

==================================================
12. PAYMENT DETAILS PAGE
==================================================

Header:
"Payment Details"

Explain briefly:
"These details are used for owner settlement information."

Fields:

UPI ID
Payment Instructions

Example:
UPI ID:
owner@upi

Payment Instructions:
"Please settle payments to the above UPI ID."

Button:
Save Changes

Keep this page very simple.

==================================================
13. OWNER PROFILE PAGE
==================================================

Create a profile page similar to a modern account settings page.

Show:
- Avatar
- Name
- Email
- Phone

Personal Information section:
Name
Email
Phone

Change Password section:
Current Password
New Password
Confirm Password

Buttons:
Save Changes
Update Password
Logout

==================================================
14. DESIGN SYSTEM
==================================================

Keep ALL pages visually consistent.

Cards:
- Rounded corners
- Thin subtle borders
- Minimal shadows
- Comfortable spacing

Buttons:
Primary button
Secondary button
Danger button

Status badges:
PENDING
CONFIRMED
COMPLETED
CANCELLED
ACTIVE
INACTIVE
PAID
UNPAID
SETTLED

Tables:
- Clean header
- Comfortable row spacing
- Hover state
- Responsive behavior

Forms:
- Clear labels
- Helpful placeholders
- Proper spacing
- Required field indicators where appropriate

==================================================
15. IMPORTANT UX RULES
==================================================

Do NOT add:
- Social feed
- Chat system
- Reviews
- Ratings
- Player management
- Complex financial charts
- Subscription plans
- Unnecessary CRM features
- Fake statistics beyond the example UI
- Features unrelated to sports ground management

The Owner UI should feel like a real operational dashboard.

Prioritize:
1. Managing grounds
2. Managing resources
3. Managing availability
4. Managing bookings
5. Tracking payments and settlements
6. Basic dashboard analytics

Use realistic Indian currency formatting:
₹1,500
₹2,250
₹1,24,500

Use 12-hour time format in the UI:
06:00 AM
07:30 PM

Use September 04, 2026 style dates.

Make the entire Owner section look like ONE coherent Slotify product rather than separate generated pages.