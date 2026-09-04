
==================================================
1. ADMIN LAYOUT
==================================================

Create a persistent admin dashboard layout.

LEFT SIDEBAR:

Slotify logo

Navigation:

Dashboard
Users
Grounds
Resources
Bookings
Payments
Settlements
Profile
Logout

Each navigation item should have a simple modern icon.

The active page should be clearly highlighted.

TOP NAVBAR:

- Page title
- Notification bell
- Admin avatar
- Admin name
- Small label: "Administrator"

Example:

Slotify                         🔔     Admin Name    AD

On mobile:
- Sidebar becomes a hamburger/drawer
- Top navigation remains visible
- Content becomes responsive

==================================================
2. ADMIN DASHBOARD
==================================================

Create a platform overview dashboard.

Header:

"Admin Dashboard"

Subtitle:

"Monitor and manage the Slotify platform."

STATISTICS CARDS:

1. Total Users
2. Total Grounds
3. Total Resources
4. Total Bookings
5. Total Revenue

Example values:

Total Users
1,248

Total Grounds
86

Total Resources
214

Total Bookings
3,842

Total Revenue
₹18,45,000

Do not make the dashboard overly complicated.

Below statistics:

RECENT BOOKINGS

Table:

Booking ID
Customer
Ground
Resource
Date
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
₹2,250
ONLINE / PAID
CONFIRMED
View

Then:

RECENT USERS

Show:

Name
Email
Role
Status
Joined
Action

Example:

Rahul Patel
rahul@email.com
CUSTOMER
ACTIVE
Sep 02, 2026

Owner example:

Amit Shah
amit@email.com
OWNER
ACTIVE
Aug 28, 2026

Then a simple:

PLATFORM ACTIVITY

Show small summary cards such as:
- Active Users
- Active Grounds
- Active Resources
- Pending Payments
- Pending Settlements

Do NOT create complicated analytics unless needed.

==================================================
3. USERS PAGE
==================================================

Header:

"Users"

Provide:

Search users
Filter by role
Filter by status

Role filters:

All
Customer
Owner
Admin

Status filters:

All
Active
Blocked

Display a clean table.

Columns:

User
Email
Phone
Role
Status
Joined
Action

Example:

Rahul Patel
rahul@email.com
9876543210
CUSTOMER
ACTIVE
Sep 02, 2026
View

Amit Shah
amit@email.com
9876543211
OWNER
ACTIVE
Aug 28, 2026
View

Admin users should also appear.

==================================================
4. USER DETAILS
==================================================

Create a user detail page/modal.

Show:

User avatar
Name
Email
Phone
Role
Status
Joined date

For OWNER:
Show:
- Number of grounds
- Number of resources
- Booking activity

For CUSTOMER:
Show:
- Number of bookings
- Booking activity

Actions:

Block User
Activate User

Use confirmation modal before blocking/activating.

Example:

"Are you sure you want to block this user?"

[Cancel] [Block User]

Do not allow an admin to accidentally remove critical information.

==================================================
5. GROUNDS MANAGEMENT
==================================================

Header:

"Grounds"

Search:
Search by ground name

Filters:

Status
Owner
City

Statuses:

ACTIVE
INACTIVE

Display a table or card/table hybrid.

Columns:

Ground
Owner
Location
City
Resources
Status
Created
Action

Example:

Victory Sports Complex
Amit Shah
Prahladnagar
Ahmedabad
4 Resources
ACTIVE
Sep 01, 2026

Actions:

View
Activate
Deactivate

Admin should be able to change ground status.

==================================================
6. GROUND DETAILS
==================================================

Create a detailed admin ground view.

Show:

Ground image
Ground name
Owner
Location
City
Description
Facilities
Supported sports
Status
Created date

Then:

RESOURCES

Show all resources belonging to the ground.

Example:

Football Ground A
Football
₹1,500/hour
06:00 AM - 11:00 PM
ACTIVE

Cricket Turf A
Cricket
₹1,000/hour
07:00 AM - 10:00 PM
ACTIVE

Admin actions:

Activate Ground
Deactivate Ground

The Admin is monitoring/managing the platform, not editing every owner field unnecessarily.

==================================================
7. RESOURCES MANAGEMENT
==================================================

Header:

"Resources"

Filters:

Ground
Sport
Status

Display table:

Resource
Ground
Owner
Sport
Price/hour
Operating Hours
Status
Action

Example:

Football Ground A
Victory Sports Complex
Amit Shah
Football
₹1,500/hour
06:00 AM - 11:00 PM
ACTIVE

Actions:

View
Activate
Deactivate

==================================================
8. RESOURCE DETAILS
==================================================

Show:

Resource Name
Ground
Owner
Sport Type
Price Per Hour
Opening Time
Closing Time
Photos
Status

Admin can:

Activate Resource
Deactivate Resource

Use confirmation modal.

==================================================
9. BOOKINGS MANAGEMENT
==================================================

Header:

"Bookings"

Filters:

Status
Payment Status
Payment Method
Date
Ground
Resource

Status:

All
Pending
Confirmed
Completed
Cancelled

Payment:

Paid
Unpaid
Failed

Payment Method:

Online
Cash

Display table:

Booking ID
Customer
Ground
Resource
Date
Time
Amount
Payment
Booking Status
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
View

==================================================
10. BOOKING DETAILS
==================================================

Create detailed booking information.

Header:

"Booking #1024"

Status:
CONFIRMED

CUSTOMER

Name
Email
Phone

GROUND

Ground Name
Location

RESOURCE

Resource Name
Sport

BOOKING

Date
Start Time
End Time
Duration

PAYMENT

Amount
Payment Method
Payment Status
Paid At

BOOKING STATUS

Current status

Show a simple status timeline:

PENDING
   ↓
CONFIRMED
   ↓
COMPLETED

Or:

PENDING
   ↓
CANCELLED

Keep it simple.

Admin should be able to manage booking status where appropriate.

==================================================
11. PAYMENTS PAGE
==================================================

Header:

"Payments"

This page is for monitoring all payments.

Statistics:

Total Payments
₹18,45,000

Paid
₹17,20,000

Pending
₹1,25,000

Then:

PAYMENT TABLE

Columns:

Payment ID
Booking
Customer
Owner
Amount
Method
Payment Status
Settlement Status
Date
Action

Example:

PAY-1001
#1024
Rahul Patel
Amit Shah
₹2,250
ONLINE
PAID
PENDING
Sep 04, 2026

Payment methods:

ONLINE
CASH

Payment statuses:

CREATED
PAID
FAILED

Settlement statuses:

PENDING
SETTLED

For CASH payments:
Settlement status should display:
—

Because cash is paid directly to the owner.

==================================================
12. PAYMENT DETAILS
==================================================

When admin opens a payment:

Show:

Payment ID
Booking ID
Customer
Owner
Amount
Currency
Payment Method
Razorpay Order ID
Razorpay Payment ID
Payment Status
Paid At
Settlement Status

Do not expose sensitive Razorpay secrets.

For online payments, show appropriate payment identifiers as read-only information.

==================================================
13. SETTLEMENTS PAGE
==================================================

This is an important Admin page.

Header:

"Settlements"

Explain briefly:

"Manage owner settlements for completed online payments."

Statistics:

Pending Settlement
₹25,000

Settled Amount
₹1,20,000

Then table:

Payment
Booking
Owner
Amount
Payment Status
Settlement Status
Date
Action

Example:

PAY-1001
#1024
Amit Shah
₹2,250
PAID
PENDING
Sep 04, 2026

Action:

[Mark as Settled]

When clicked:

Confirmation modal:

"Mark ₹2,250 as settled for Amit Shah?"

[Cancel] [Confirm Settlement]

After settlement:

SETTLED

For CASH payments:
Do not show "Mark as Settled".

Display:

Settlement:
—

==================================================
14. ADMIN PROFILE
==================================================

Create a simple account settings page.

Profile:

Avatar
Name
Email
Phone

Personal Information:

Name
Email
Phone

Change Password:

Current Password
New Password
Confirm Password

Buttons:

Save Changes
Update Password
Logout

Keep the design consistent with the Owner profile.

==================================================
15. STATUS BADGES
==================================================

Use consistent badges across the Admin interface.

User status:
ACTIVE
BLOCKED

Ground/resource status:
ACTIVE
INACTIVE

Booking status:
PENDING
CONFIRMED
COMPLETED
CANCELLED

Payment status:
CREATED
PAID
FAILED
UNPAID

Settlement status:
PENDING
SETTLED

Use clear visual differences but do not rely only on color.

==================================================
16. TABLE DESIGN
==================================================

Tables should be clean and professional.

Use:

- Rounded container
- Subtle border
- Clear header
- Comfortable row height
- Hover state
- Pagination
- Search/filter controls
- Action button/menu

On mobile:
Convert tables into responsive cards or horizontally scrollable tables.

==================================================
17. MODALS
==================================================

Use confirmation modals for destructive/status-changing actions.

Examples:

Block User

Deactivate Ground

Deactivate Resource

Cancel Booking

Mark Settlement as Settled

Example:

"Are you sure you want to deactivate this ground?"

[Cancel] [Deactivate]

Do not immediately perform destructive actions without confirmation.

==================================================
18. EMPTY STATES
==================================================

Every major list should have an empty state.

Example:

No users found
"No users match your current filters."

No grounds found
"No grounds have been registered yet."

No bookings found
"No bookings match your current filters."

No payments found
"No payment records found."

Use simple illustrations/icons, not huge decorative graphics.

==================================================
19. RESPONSIVE DESIGN
==================================================

Desktop:
- Sidebar visible
- Tables and dashboard cards in full layout

Tablet:
- Sidebar can collapse
- Cards become smaller
- Tables remain readable

Mobile:
- Hamburger sidebar
- Cards stack vertically
- Tables become responsive
- Forms become one column
- Buttons remain touch-friendly

==================================================
20. IMPORTANT ADMIN UX RULES
==================================================

The Admin should have platform-wide visibility.

Admin can manage:

Users
Grounds
Resources
Bookings
Payments
Settlements

Do NOT add:

- Social media
- Chat
- Reviews
- Ratings
- Player management
- Subscription plans
- CRM
- Marketing campaigns
- Complex accounting
- Complex financial forecasting
- Unnecessary analytics
- Fake features

The Admin dashboard should focus on operational control.

==================================================
21. OVERALL NAVIGATION
==================================================

Final Admin sidebar:

SLOTIFY

Dashboard

Users

Grounds

Resources

Bookings

Payments

Settlements

Profile

Logout

==================================================
22. FINAL DESIGN REQUIREMENT
==================================================

All pages must look like they belong to the same Slotify application.

The Customer UI is the booking experience.

The Owner UI is the facility management experience.

The Admin UI is the platform management experience.

Keep the Admin interface visually consistent with Slotify while making it clearly more administrative and data-oriented.

Use realistic Indian names, Ahmedabad locations, INR currency, and 12-hour time format.

Example:

₹2,250

₹1,24,500

06:00 PM - 07:30 PM

September 04, 2026

Do not generate fake functionality that is not represented by the UI.

Generate a complete, polished Admin dashboard design with all the screens described above.