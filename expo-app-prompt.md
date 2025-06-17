# Codebase Analysis Prompt: Next.js to React Native (Expo) Migration

## Objective
Analyze the existing Next.js job board platform codebase and create a comprehensive summary and implementation plan for developing a React Native (Expo) mobile application specifically for job seekers in the Gambian market.

## Context
- **Source Platform**: Next.js web application - comprehensive job board platform for Gambian market
- **Target Platform**: React Native (Expo) mobile app
- **Target Users**: Job seekers only (excludes employer functionality)
- **Reference Document**: `documents/base-knowledge.md` (contains navigation guide and candidate features overview)

## Analysis Requirements

### 1. Architecture Overview
Provide a detailed analysis of:
- **Project Structure**: Document the current folder structure, key directories, and file organization
- **Tech Stack**: List all technologies, frameworks, libraries, and dependencies used
- **Design Patterns**: Identify architectural patterns, state management solutions, and code organization principles
- **Configuration**: Document build tools, environment variables, and deployment configurations

### 2. Database Analysis
Create comprehensive documentation of:
- **Schema Structure**: Complete database schema with all tables, relationships, and constraints
- **Data Models**: Document all entity relationships and data flow patterns
- **Job Seeker Related Tables**: Focus on tables that impact candidate functionality
- **API Endpoints**: Map all relevant API routes and their purposes
- **Data Validation**: Document validation rules and business logic

### 3. Job Seeker Feature Inventory
Analyze and document all candidate-facing features:
- **Authentication & Profile Management**: Registration, login, profile creation/editing
- **Job Search & Discovery**: Search functionality, filters, categories, location-based features
- **Application Process**: Job application workflow, document uploads, application tracking
- **Notifications**: Alert systems, job recommendations, application status updates
- **User Dashboard**: Profile management, application history, saved jobs
- **Communication**: Messaging systems, interview scheduling, employer interaction
- **Local Market Features**: Gambian-specific functionality, payment integrations, local preferences

### 4. UI/UX Component Analysis
Document the design system:
- **Component Library**: Reusable components and their props
- **Styling Approach**: CSS framework, theming, responsive design patterns
- **User Flows**: Critical user journeys for job seekers
- **Form Handling**: Input validation, error handling, submission processes
- **Navigation Structure**: Routing patterns and navigation hierarchy

### 5. Integration Points
Map external services and integrations:
- **Payment Systems**: Local payment methods and processing
- **File Storage**: Document/resume upload and management
- **Email Services**: Notification and communication systems
- **Third-party APIs**: Any external service integrations
- **Authentication Providers**: Social login options

### 6. Business Logic Extraction
Document core business rules:
- **Job Matching Algorithms**: How jobs are recommended to candidates
- **Application Business Rules**: Eligibility, restrictions, validation logic
- **User Permissions**: Role-based access control for job seekers
- **Notification Logic**: When and how users receive alerts
- **Local Market Considerations**: Gambian-specific business requirements

## Implementation Plan Requirements

### 1. Mobile App Architecture
Design a comprehensive architecture for the Expo app:
- **Navigation Structure**: React Navigation setup with appropriate navigators
- **State Management**: Recommend and design state management solution (Redux Toolkit, Zustand, etc.)
- **Component Architecture**: Design system adapted for mobile interfaces
- **File Structure**: Proposed folder organization for the mobile app
- **Performance Considerations**: Optimization strategies for mobile performance

### 2. Feature Implementation Roadmap
Create a prioritized development plan:
- **Phase 1 (MVP)**: Core features for initial release
- **Phase 2 (Enhanced)**: Secondary features and improvements
- **Phase 3 (Advanced)**: Advanced features and optimizations
- **Dependencies**: Map feature dependencies and development order

### 3. Technical Implementation Details
Provide specific technical guidance:
- **API Integration**: How to connect with existing backend APIs
- **Data Synchronization**: Offline capabilities and data sync strategies
- **Authentication Flow**: Mobile-specific auth implementation
- **File Upload Handling**: Mobile file selection and upload processes
- **Push Notifications**: Implementation strategy for mobile notifications
- **Local Storage**: Data persistence and caching strategies

### 4. UI/UX Adaptation Strategy
Guide the mobile interface design:
- **Component Mapping**: How web components translate to mobile
- **Screen Designs**: Key screen layouts and navigation patterns
- **Mobile-Specific Patterns**: Touch interactions, gestures, mobile UX best practices
- **Responsive Considerations**: Handling different screen sizes and orientations
- **Accessibility**: Mobile accessibility requirements and implementation

### 5. Development Environment Setup
Provide setup instructions:
- **Expo Configuration**: Project initialization and configuration
- **Development Tools**: Required tools, IDEs, and debugging setup
- **Environment Variables**: Mobile app environment configuration
- **Build Process**: Development, testing, and production build processes
- **Deployment Strategy**: App store deployment considerations

### 6. Testing Strategy
Outline comprehensive testing approach:
- **Unit Testing**: Component and utility function testing
- **Integration Testing**: API integration and data flow testing
- **User Acceptance Testing**: Key user journey validation
- **Device Testing**: Cross-device and cross-platform testing strategy
- **Performance Testing**: Mobile performance benchmarking

## Deliverable Format

Create a comprehensive markdown document (`MOBILE_APP_IMPLEMENTATION_GUIDE.md`) in the project root containing:

1. **Executive Summary** (500 words)
2. **Current Architecture Analysis** (detailed technical overview)
3. **Database Schema Documentation** (complete with relationships)
4. **Feature Specifications** (job seeker features only)
5. **Mobile App Architecture Design** 
6. **Implementation Roadmap** (phased development plan)
7. **Technical Specifications** (APIs, integrations, configurations)
8. **UI/UX Guidelines** (mobile design patterns)
9. **Development Setup Guide** (step-by-step instructions)
10. **Testing & Quality Assurance Plan**
11. **Deployment & Maintenance Guidelines**
12. **Appendices** (code examples, configuration templates, troubleshooting)

## Key Focus Areas

- **Gambian Market Specifics**: Preserve all local market features and considerations
- **Mobile-First Approach**: Adapt web features for optimal mobile experience
- **Performance Optimization**: Ensure smooth performance on various mobile devices
- **Offline Capabilities**: Consider connectivity challenges in the target market
- **User Experience**: Prioritize intuitive mobile interface design
- **Data Efficiency**: Optimize for mobile data usage and storage
- **Security**: Maintain security standards for mobile environment

## Analysis Instructions

1. **Start by reading** `documents/base-knowledge.md` to understand the codebase structure and candidate features
2. **Systematically explore** the codebase following the structure outlined in the base knowledge document
3. **Document everything** relevant to job seeker functionality while excluding employer-specific features
4. **Create detailed mappings** between existing web features and proposed mobile implementations
5. **Provide specific code examples** and configuration snippets where helpful
6. **Consider mobile-specific challenges** and provide solutions for common issues
7. **Ensure completeness** - the resulting guide should enable an AI agent to build the entire mobile app

The final document should serve as a complete blueprint for developing the React Native (Expo) job seeker mobile application, enabling efficient and accurate implementation by an AI development agent.