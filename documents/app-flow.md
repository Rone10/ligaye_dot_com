App Flow Document for Job Board Platform for Gambia
This App Flow Document outlines the user journeys, key interactions, and screen flows for the Job Board Platform for Gambia. It is designed to provide a clear, intuitive, and efficient navigation experience for all users, aligning with the functional and non-functional requirements of the platform. Below, we detail the primary personas, their journeys, and the corresponding screen flows.
1. User Personas
Job Seeker: Individuals seeking job opportunities in Gambia.
Employer: Companies or individuals posting job openings and managing applications.
Admin: Platform administrators responsible for managing payments, activating job postings, and overseeing user accounts.
2. Primary User Journeys
Job Seeker Journey
Registration and Login
User visits the homepage and clicks "Register."
Completes a registration form (email, password, role: job seeker).
Receives a confirmation email and verifies the account.
Logs in using credentials.
Profile Creation
After login, user is redirected to the job seeker dashboard.
Clicks "Complete Profile" to enter personal information, education, experience, skills, and upload a resume.
Saves the profile.
Job Search and Application
From the dashboard, uses the search bar (keywords, location, job type) to find jobs.
Views search results listing available jobs.
Selects a job to see details and clicks "Apply" to submit an application.
Receives a confirmation notification.
Save Jobs
On a job listing or detail page, clicks "Save Job."
Views saved jobs in the dashboard under "Saved Jobs."
Notifications
Receives email notifications for new job postings matching criteria and updates on application status.
Employer Journey
Registration and Login
User visits the homepage and clicks "Register."
Completes a registration form (company name, email, password, role: employer).
Verifies account via email and logs in.
Company Profile Creation
After login, user is redirected to the employer dashboard.
Clicks "Create Company Profile" to enter company details (name, description, logo).
Saves the profile.
Post a Job
From the dashboard, clicks "Post a Job."
Fills in job details (title, description, requirements, location) and selects job duration (e.g., 1 month).
Chooses payment method:
Stripe: Redirects to payment gateway; job is posted immediately upon successful payment.
Cash: Job posting is saved as pending, awaiting admin approval after payment confirmation.
Receives a notification of job posting status.
Manage Applicants
From the dashboard, views "My Job Postings."
Selects a job to see a list of applicants, their profiles, and application details.
Updates application status (e.g., reviewed, shortlisted).
Analytics (Optional)
Views performance metrics for job postings (views, applications, etc.).
Admin Journey
Login
Accesses the admin login page and enters credentials.
Redirected to the admin dashboard.
Manage Payments
Views a list of pending cash payments for job postings.
Confirms payment receipt, activates job postings, and notifies employers.
User Management
Views and manages user accounts (job seekers and employers).
Resolves account issues or disputes.
3. Screen Flows
Job Seeker Screen Flow
Homepage
Purpose: Entry point to the platform.
Key Elements: Search bar, "Register" link, "Login" link.
Registration Page
Purpose: Create a new job seeker account.
Key Elements: Form (email, password, role: job seeker), "Submit" button.
Login Page
Purpose: Authenticate user.
Key Elements: Form (email, password), "Submit" button.
Job Seeker Dashboard
Purpose: Central hub for job seeker activities.
Key Elements: Profile completeness indicator, "Saved Jobs" section, "Applied Jobs" section, navigation to "Search Jobs," "Profile," "Notifications."
Profile Page
Purpose: Manage personal and professional details.
Key Elements: Editable sections (personal info, education, experience, skills, resume upload), "Save" button.
Job Search Results
Purpose: Display available jobs.
Key Elements: Job cards (title, company, location, date), search filters, "Save Job" and "Apply" buttons.
Job Detail Page
Purpose: Provide detailed job information.
Key Elements: Job description, requirements, company info, "Apply" and "Save Job" buttons.
Application Confirmation
Purpose: Confirm successful application submission.
Key Elements: Confirmation message (modal or page).
Employer Screen Flow
Homepage
Purpose: Entry point to the platform.
Key Elements: "Register" link, "Login" link.
Registration Page
Purpose: Create a new employer account.
Key Elements: Form (company name, email, password, role: employer), "Submit" button.
Login Page
Purpose: Authenticate user.
Key Elements: Form (email, password), "Submit" button.
Employer Dashboard
Purpose: Central hub for employer activities.
Key Elements: "Company Profile" section, "My Job Postings" section, "Applicants" section, navigation to "Post a Job," "Analytics."
Company Profile Page
Purpose: Manage company details.
Key Elements: Form (name, description, logo), "Save" button.
Post a Job Page
Purpose: Create a new job listing.
Key Elements: Form (job details), job duration dropdown, payment method selection (Stripe or Cash), "Submit" button.
Payment Processing (Stripe)
Purpose: Handle online payments.
Key Elements: Redirect to Stripe gateway, payment confirmation page.
Job Posting Confirmation
Purpose: Confirm job posting status.
Key Elements: Message (job live for Stripe, pending for Cash).
Manage Applicants Page
Purpose: Review and manage job applicants.
Key Elements: Applicant list per job, links to profiles, status update options.
Admin Screen Flow
Admin Login Page
Purpose: Authenticate admin user.
Key Elements: Form (email, password), "Submit" button.
Admin Dashboard
Purpose: Central hub for admin tasks.
Key Elements: "Pending Payments" section, "User Management" section, navigation to detailed views.
Pending Payments Page
Purpose: Manage cash payment approvals.
Key Elements: List of pending job postings, "Confirm Payment" button.
User Management Page
Purpose: Oversee user accounts.
Key Elements: User list, search/filter options, actions to view/edit details.
4. Functional Requirements Integration
User Authentication: Secure registration and login with role-based access (job seeker, employer, admin).
Profile Management: Comprehensive forms for job seekers (personal info, resume) and employers (company details).
Job Posting and Payment: Seamless job posting with Stripe (immediate) and Cash (pending admin approval) options.
Search and Application: Efficient job search with filters and a simple application process.
Notifications: Automated emails for job postings, application statuses, and payment updates.
5. Non-Functional Requirements
Performance: Fast load times for search results and profile pages.
Security: Encrypted data transmission/storage, secure payment processing via Stripe.
Usability: Intuitive navigation, clear calls to action, responsive design for mobile and desktop.
6. Visualization of Flows
Job Seeker Flow
[Homepage] → [Register] → [Registration Page] → [Email Verification] → [Login Page] → [Job Seeker Dashboard]
                                                                                 ↓
                                                                         [Complete Profile] → [Profile Page]
                                                                                 ↓
                                                                         [Search Jobs] → [Job Search Results] → [Job Detail Page] → [Apply] → [Application Confirmation]
                                                                                 ↓
                                                                         [Save Job] → [Saved Jobs List]
Employer Flow
[Homepage] → [Register] → [Registration Page] → [Email Verification] → [Login Page] → [Employer Dashboard]
                                                                                 ↓
                                                                         [Create Company Profile] → [Company Profile Page]
                                                                                 ↓
                                                                         [Post a Job] → [Job Posting Form] → [Payment Selection] → [Stripe Payment] → [Job Live]
                                                                                                             → [Cash Payment] → [Pending Approval]
                                                                                 ↓
                                                                         [Manage Applicants] → [Applicants List] → [Applicant Profile]
Admin Flow
[Admin Login Page] → [Admin Dashboard] → [Pending Payments] → [Confirm Payment] → [Job Activated]
                                              ↓
                                              [User Management] → [User List] → [User Details]
Conclusion
This App Flow Document provides a comprehensive guide for the Job Board Platform for Gambia, detailing the user experience for job seekers, employers, and admins. The flows are designed to be intuitive and efficient, ensuring alignment with the platform’s requirements and setting a clear path for development and implementation.