# HT-007TEAM-007
# BioSync AI - Personalized Fitness Intelligence System

A comprehensive AI-powered web application that generates personalized workout and nutrition plans with real-time progress tracking and adaptive plan modifications.

## 🚀 Features

### Frontend (Pure JavaScript)
- **Responsive Design**: Modern, mobile-first UI with card-based layout
- **AI Profile Assessment**: Comprehensive user profiling with health metrics calculation
- **Personalized Plan Generation**: Custom workout and nutrition plans based on user goals
- **Progress Tracking**: Daily/weekly progress monitoring with visual analytics
- **Adaptive Intelligence**: Plans automatically adjust based on user feedback
- **Real-time Analytics**: BMI, BMR, TDEE calculations with progress trends

### Backend (Java Spring Boot)
- **RESTful API**: Complete REST endpoints for all functionality
- **AI Algorithms**: Advanced fitness and nutrition calculations
- **Microsoft SQL Server**: Robust database with comprehensive schema
- **Progress Analytics**: Detailed progress analysis and trend detection
- **Plan Adaptation**: AI-driven plan modifications based on user progress
- **Data Persistence**: Comprehensive tracking of user journey and metrics

## 📋 Prerequisites

### Frontend Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies required

### Backend Requirements
- **Java 17** or higher
- **Maven 3.8+**
- **Microsoft SQL Server 2019** or higher
- **IDE**: IntelliJ IDEA, Eclipse, or VS Code

## 🛠️ Installation & Setup

### 1. Database Setup (Microsoft SQL Server)

#### Install SQL Server
1. Download Microsoft SQL Server 2019 or later
2. Install with default settings
3. Enable SQL Server Authentication
4. Set SA password (e.g., `YourPassword123`)

#### Create Database
1. Open SQL Server Management Studio (SSMS)
2. Connect to your SQL Server instance
3. Run the database initialization script:
```sql
-- Navigate to: HEALTH CARE\database_init.sql
-- Execute the entire script to create database and tables
```

#### Verify Database Setup
```sql
USE biosyncai_db;
SELECT COUNT(*) FROM users; -- Should return 3 (sample users)
```

### 2. Backend Setup (Java Spring Boot)

#### Navigate to Backend Directory
```bash
cd "HEALTH CARE\backend"
```

#### Configure Database Connection
Edit `src\main\resources\application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=biosyncai_db;trustServerCertificate=true;encrypt=false
    username: sa
    password: YourPassword123  # Replace with your SA password
```

#### Install Dependencies & Run
```bash
# Install dependencies
mvn clean install

# Run the application
mvn spring-boot:run
```

#### Verify Backend is Running
- Backend API: http://localhost:8080/api/v1
- Health Check: http://localhost:8080/api/v1/actuator/health
- API Documentation: http://localhost:8080/api/v1/swagger-ui.html

### 3. Frontend Setup

#### Option 1: Direct File Opening
1. Navigate to `HEALTH CARE` folder
2. Right-click on `index.html`
3. Open with your preferred web browser

#### Option 2: Local Server (Recommended)
```bash
# Using Python
cd "HEALTH CARE"
python -m http.server 8000

# Using Node.js (if installed)
npx http-server -p 8000

# Access at: http://localhost:8000
```

#### Option 3: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Open `HEALTH CARE` folder in VS Code
3. Right-click `index.html` → "Open with Live Server"

## 🎯 Usage Guide

### 1. Create Your Profile
1. Open the application in your browser
2. Fill out the comprehensive profile form:
   - Personal information (age, height, weight, gender)
   - Fitness goals (fat loss, muscle gain, maintenance, etc.)
   - Experience level (beginner, intermediate, advanced)
   - Workout preferences (frequency, duration, equipment)
   - Dietary preferences and health limitations

### 2. Get Your AI-Generated Plan
- Click "Generate My AI Plan"
- The system will:
  - Calculate your BMI, BMR, and TDEE
  - Generate personalized workout routines
  - Create nutrition recommendations
  - Provide hydration and supplement advice

### 3. Track Your Progress
- Use the "Track Your Progress" section
- Input weekly metrics:
  - Current weight
  - Workout difficulty rating
  - Adherence level
  - Notes and observations

### 4. Adaptive Plan Updates
- The AI analyzes your progress automatically
- Plans adapt based on:
  - Adherence patterns
  - Difficulty feedback
  - Progress rate
  - Goal achievement

## 🔧 API Endpoints

### User Management
```
POST   /api/v1/users/register              - Register new user
GET    /api/v1/users/{userId}              - Get user profile
PUT    /api/v1/users/{userId}              - Update user profile
GET    /api/v1/users/{userId}/recommendations - Get AI recommendations
```

### Progress Tracking
```
POST   /api/v1/progress/users/{userId}/entries     - Create progress entry
GET    /api/v1/progress/users/{userId}/entries     - Get progress entries
GET    /api/v1/progress/users/{userId}/analytics   - Get progress analytics
POST   /api/v1/progress/users/{userId}/quick-update - Quick progress update
```

### Health Calculations
```
GET    /api/v1/users/{userId}/bmr                  - Calculate BMR
GET    /api/v1/users/{userId}/tdee                 - Calculate TDEE
GET    /api/v1/users/{userId}/target-calories      - Get target calories
GET    /api/v1/users/{userId}/ideal-weight         - Get ideal weight range
```

## 🏗️ Architecture

### Frontend Architecture
```
HEALTH CARE/
├── index.html          # Main HTML structure
├── style.css          # Responsive CSS styling
├── script.js          # JavaScript with AI algorithms
└── README.md          # This file
```

### Backend Architecture
```
backend/
├── src/main/java/com/biosyncai/
│   ├── BioSyncAiApplication.java    # Main Spring Boot application
│   ├── controller/                   # REST API controllers
│   ├── entity/                      # JPA entities
│   ├── repository/                  # Data access layer
│   ├── service/                     # Business logic
│   └── config/                      # Configuration classes
├── src/main/resources/
│   ├── application.yml              # Application configuration
│   └── database_init.sql           # Database schema
└── pom.xml                         # Maven dependencies
```

### Database Schema
- **users**: User profiles and account information
- **user_profiles**: Historical profile changes
- **progress_entries**: Daily/weekly progress tracking
- **workout_plans**: AI-generated workout plans
- **workout_sessions**: Individual workout sessions
- **nutrition_plans**: Personalized nutrition plans
- **meal_entries**: Daily nutrition tracking

## 🔬 AI Algorithms

### Health Metrics
- **BMI Calculation**: Body Mass Index with category classification
- **BMR Calculation**: Basal Metabolic Rate using Mifflin-St Jeor equation
- **TDEE Calculation**: Total Daily Energy Expenditure with activity multipliers

### Plan Generation
- **Workout Algorithm**: Exercise selection based on goals, level, and equipment
- **Nutrition Algorithm**: Macro distribution based on fitness goals
- **Progression Logic**: Automatic difficulty and volume adjustments

### Adaptation Intelligence
- **Progress Analysis**: Multi-factor progress scoring
- **Pattern Recognition**: Adherence and difficulty pattern detection
- **Plan Modification**: Automatic plan adjustments based on feedback

## 🧪 Testing

### Test User Accounts
```
Username: admin
Email: admin@biosyncai.com
Password: admin123

Username: john_doe  
Email: john@example.com
Password: password123

Username: jane_smith
Email: jane@example.com
Password: password123
```

### API Testing
Use the Swagger UI at http://localhost:8080/api/v1/swagger-ui.html for interactive API testing.

## 🚨 Troubleshooting

### Backend Issues
1. **Database Connection Failed**
   - Verify SQL Server is running
   - Check connection string in `application.yml`
   - Ensure database `biosyncai_db` exists

2. **Port 8080 Already in Use**
   - Change port in `application.yml`: `server.port: 8081`
   - Update frontend API URL in `script.js`

3. **Maven Build Fails**
   - Ensure Java 17+ is installed
   - Run `mvn clean install -U` to force update

### Frontend Issues
1. **CORS Errors**
   - Use local server instead of file:// protocol
   - Verify backend CORS configuration

2. **API Connection Failed**
   - Ensure backend is running on localhost:8080
   - Check browser console for network errors

## 🔒 Security Features

- Password encryption using BCrypt
- Input validation on all endpoints
- SQL injection prevention with JPA
- XSS protection with proper escaping
- CORS configuration for secure frontend integration

## 📊 Performance Features

- Database indexing for optimal query performance
- Connection pooling with HikariCP
- Lazy loading for entity relationships
- Efficient SQL queries with JPA Criteria
- Frontend caching with localStorage

## 🎨 Customization

### Frontend Theming
Modify `style.css` to customize:
- Color schemes
- Layout components
- Animation effects
- Responsive breakpoints

### Backend Configuration
Adjust `application.yml` for:
- Database settings
- Logging levels
- Security configurations
- API documentation

## 📈 Future Enhancements

- Mobile app integration
- Machine learning model integration
- Advanced nutrition database
- Social features and community
- Wearable device integration
- Professional trainer dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Follow code style guidelines

## 📜 License

This project is licensed under the MIT License. See LICENSE file for details.

## 👥 Team

**BioSync AI Development Team**
- Full-stack development
- AI algorithm implementation  
- Database design and optimization
- UI/UX design and testing

## 🆘 Support

For technical support or questions:
- Check the troubleshooting section
- Review API documentation at `/swagger-ui.html`
- Inspect browser console for frontend issues
- Check backend logs for server-side problems

---

**🎉 Congratulations! You now have a fully functional AI-powered fitness intelligence system running locally with comprehensive backend data persistence and real-time progress tracking!**