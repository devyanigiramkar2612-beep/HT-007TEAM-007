-- BioSync AI Database Initialization Script
-- Microsoft SQL Server Database Schema

-- Create Database
CREATE DATABASE biosyncai_db;
GO

USE biosyncai_db;
GO

-- Create Users Table
CREATE TABLE users (
    user_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    age INT NOT NULL CHECK (age >= 13 AND age <= 100),
    gender NVARCHAR(20) NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    height_cm DECIMAL(5,2) NOT NULL CHECK (height_cm >= 120 AND height_cm <= 250),
    weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg >= 30 AND weight_kg <= 300),
    fitness_goal NVARCHAR(20) NOT NULL CHECK (fitness_goal IN ('FAT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE', 'ENDURANCE', 'STRENGTH')),
    fitness_level NVARCHAR(20) NOT NULL CHECK (fitness_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    workout_days_per_week INT NOT NULL CHECK (workout_days_per_week >= 1 AND workout_days_per_week <= 7),
    session_duration_minutes INT NOT NULL CHECK (session_duration_minutes >= 15 AND session_duration_minutes <= 180),
    equipment_access NVARCHAR(20) NOT NULL CHECK (equipment_access IN ('HOME', 'GYM', 'MINIMAL')),
    dietary_preference NVARCHAR(20) NOT NULL CHECK (dietary_preference IN ('OMNIVORE', 'VEGETARIAN', 'VEGAN', 'KETO', 'MEDITERRANEAN')),
    health_limitations NTEXT,
    is_active BIT NOT NULL DEFAULT 1,
    email_verified BIT NOT NULL DEFAULT 0,
    role NVARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'TRAINER')),
    timezone NVARCHAR(50) DEFAULT 'UTC',
    preferred_units NVARCHAR(20) DEFAULT 'METRIC' CHECK (preferred_units IN ('METRIC', 'IMPERIAL')),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    last_login_at DATETIME2
);

-- Create User Profiles Table (Historical tracking)
CREATE TABLE user_profiles (
    profile_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    age INT NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    height_cm DECIMAL(5,2) NOT NULL,
    fitness_goal NVARCHAR(20) NOT NULL,
    fitness_level NVARCHAR(20) NOT NULL,
    workout_days_per_week INT NOT NULL,
    session_duration_minutes INT NOT NULL,
    equipment_access NVARCHAR(20) NOT NULL,
    dietary_preference NVARCHAR(20) NOT NULL,
    health_limitations NTEXT,
    bmi DECIMAL(5,2),
    bmi_category NVARCHAR(20),
    bmr DECIMAL(8,2),
    tdee DECIMAL(8,2),
    profile_version INT NOT NULL DEFAULT 1,
    change_reason NVARCHAR(500),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Progress Entries Table
CREATE TABLE progress_entries (
    progress_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    entry_date DATE NOT NULL,
    entry_type NVARCHAR(20) NOT NULL CHECK (entry_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'MILESTONE')),

    -- Physical Metrics
    current_weight_kg DECIMAL(5,2) CHECK (current_weight_kg >= 30 AND current_weight_kg <= 300),
    body_fat_percentage DECIMAL(5,2) CHECK (body_fat_percentage >= 5 AND body_fat_percentage <= 50),
    muscle_mass_percentage DECIMAL(5,2) CHECK (muscle_mass_percentage >= 30 AND muscle_mass_percentage <= 70),
    waist_circumference_cm DECIMAL(5,2),

    -- Workout Metrics
    workout_difficulty_rating NVARCHAR(20) CHECK (workout_difficulty_rating IN ('TOO_EASY', 'JUST_RIGHT', 'CHALLENGING', 'TOO_HARD', 'OVERWHELMING')),
    adherence_level NVARCHAR(20) CHECK (adherence_level IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'VERY_POOR')),
    workouts_completed_this_week INT CHECK (workouts_completed_this_week >= 0 AND workouts_completed_this_week <= 7),
    planned_workouts_this_week INT CHECK (planned_workouts_this_week >= 0 AND planned_workouts_this_week <= 7),
    average_workout_duration_minutes INT,
    energy_level_rating INT CHECK (energy_level_rating >= 1 AND energy_level_rating <= 10),
    sleep_quality_rating INT CHECK (sleep_quality_rating >= 1 AND sleep_quality_rating <= 10),
    sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 4 AND sleep_hours <= 12),

    -- Nutrition Metrics
    calories_consumed INT,
    protein_grams DECIMAL(6,2),
    carbs_grams DECIMAL(6,2),
    fats_grams DECIMAL(6,2),
    water_intake_liters DECIMAL(3,1) CHECK (water_intake_liters >= 0.5 AND water_intake_liters <= 8),
    nutrition_adherence_rating INT CHECK (nutrition_adherence_rating >= 1 AND nutrition_adherence_rating <= 10),

    -- Mood and Motivation
    mood_rating INT CHECK (mood_rating >= 1 AND mood_rating <= 10),
    motivation_level INT CHECK (motivation_level >= 1 AND motivation_level <= 10),
    stress_level INT CHECK (stress_level >= 1 AND stress_level <= 10),

    -- Progress Notes
    progress_notes NTEXT,
    challenges_faced NTEXT,
    goals_achieved NTEXT,
    next_week_goals NTEXT,

    -- Calculated Fields
    weight_change_from_start DECIMAL(5,2),
    weight_change_from_last_entry DECIMAL(5,2),
    adherence_percentage DECIMAL(5,2),
    weekly_progress_score DECIMAL(5,2),

    -- System Fields
    week_number INT,
    month_number INT,
    year INT,
    is_milestone BIT NOT NULL DEFAULT 0,
    trigger_plan_adaptation BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Workout Plans Table
CREATE TABLE workout_plans (
    plan_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_name NVARCHAR(200) NOT NULL,
    plan_description NTEXT,
    fitness_goal NVARCHAR(20) NOT NULL,
    fitness_level NVARCHAR(20) NOT NULL,
    equipment_access NVARCHAR(20) NOT NULL,
    workout_days_per_week INT NOT NULL CHECK (workout_days_per_week >= 1 AND workout_days_per_week <= 7),
    session_duration_minutes INT NOT NULL CHECK (session_duration_minutes >= 15 AND session_duration_minutes <= 180),
    plan_difficulty NVARCHAR(20) NOT NULL CHECK (plan_difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    plan_phase NVARCHAR(20) NOT NULL DEFAULT 'FOUNDATION' CHECK (plan_phase IN ('FOUNDATION', 'STRENGTH', 'POWER', 'PEAK', 'RECOVERY', 'DELOAD')),
    start_date DATE NOT NULL,
    end_date DATE,
    duration_weeks INT CHECK (duration_weeks >= 1 AND duration_weeks <= 52),
    current_week INT DEFAULT 1,
    is_active BIT NOT NULL DEFAULT 1,
    plan_status NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (plan_status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'ARCHIVED')),
    version_number INT NOT NULL DEFAULT 1,
    previous_plan_id BIGINT,
    adaptation_reason NVARCHAR(500),

    -- Workout Data (JSON)
    weekly_schedule NTEXT,
    exercise_library NTEXT,
    progression_rules NTEXT,

    -- Performance Metrics
    total_sessions_planned INT,
    sessions_completed INT DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.0,
    average_session_rating DECIMAL(3,2),
    total_volume_kg INT DEFAULT 0,
    total_calories_burned INT DEFAULT 0,

    -- AI Configuration
    ai_adaptation_enabled BIT NOT NULL DEFAULT 1,
    auto_progression_enabled BIT NOT NULL DEFAULT 1,
    difficulty_auto_adjust BIT NOT NULL DEFAULT 1,
    last_adaptation_date DATE,
    adaptations_count INT DEFAULT 0,

    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Workout Sessions Table
CREATE TABLE workout_sessions (
    session_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    workout_plan_id BIGINT,
    session_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_minutes INT CHECK (duration_minutes >= 5 AND duration_minutes <= 300),
    actual_duration_minutes INT CHECK (actual_duration_minutes >= 5 AND actual_duration_minutes <= 300),
    session_type NVARCHAR(20) NOT NULL CHECK (session_type IN ('STRENGTH', 'CARDIO', 'HIIT', 'FLEXIBILITY', 'MOBILITY', 'RECOVERY', 'MIXED', 'SPORT_SPECIFIC')),
    session_category NVARCHAR(20) CHECK (session_category IN ('UPPER_BODY', 'LOWER_BODY', 'FULL_BODY', 'PUSH', 'PULL', 'LEGS', 'CORE', 'CONDITIONING')),
    session_name NVARCHAR(200) NOT NULL,
    session_description NTEXT,

    -- Exercise Data (JSON)
    exercises_performed NTEXT,
    planned_exercises NTEXT,

    -- Performance Metrics
    exercises_completed INT DEFAULT 0,
    total_exercises_planned INT,
    completion_percentage DECIMAL(5,2) DEFAULT 0.0,
    total_volume_kg INT DEFAULT 0,
    total_sets INT DEFAULT 0,
    total_reps INT DEFAULT 0,
    calories_burned INT CHECK (calories_burned >= 0 AND calories_burned <= 2000),
    average_heart_rate DECIMAL(5,2) CHECK (average_heart_rate >= 0 AND average_heart_rate <= 250),
    max_heart_rate DECIMAL(5,2) CHECK (max_heart_rate >= 0 AND max_heart_rate <= 250),

    -- User Feedback
    difficulty_rating INT CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
    energy_level_before INT CHECK (energy_level_before >= 1 AND energy_level_before <= 10),
    energy_level_after INT CHECK (energy_level_after >= 1 AND energy_level_after <= 10),
    satisfaction_rating INT CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 10),
    perceived_exertion NVARCHAR(20) CHECK (perceived_exertion IN ('VERY_LIGHT', 'LIGHT', 'MODERATE', 'SOMEWHAT_HARD', 'HARD', 'VERY_HARD', 'EXTREMELY_HARD')),
    session_notes NTEXT,
    challenges_faced NTEXT,
    improvements_noted NTEXT,

    -- Session Status
    session_status NVARCHAR(20) NOT NULL DEFAULT 'PLANNED' CHECK (session_status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'CANCELLED', 'RESCHEDULED')),
    was_skipped BIT NOT NULL DEFAULT 0,
    skip_reason NVARCHAR(500),
    was_modified BIT NOT NULL DEFAULT 0,
    modification_reason NVARCHAR(500),

    -- Context Data
    location_type NVARCHAR(20) CHECK (location_type IN ('HOME', 'GYM', 'OUTDOOR', 'OFFICE', 'HOTEL', 'OTHER')),
    workout_partner BIT NOT NULL DEFAULT 0,
    music_used BIT NOT NULL DEFAULT 0,
    motivation_level INT CHECK (motivation_level >= 1 AND motivation_level <= 10),
    weather_conditions NVARCHAR(100),
    equipment_used NTEXT,

    -- Recovery Metrics
    muscle_soreness_next_day INT CHECK (muscle_soreness_next_day >= 1 AND muscle_soreness_next_day <= 10),
    recovery_time_hours INT,
    sleep_quality_night_after INT,

    -- AI Data
    ai_recommendation_followed BIT NOT NULL DEFAULT 1,
    deviation_from_plan NTEXT,
    triggers_adaptation BIT NOT NULL DEFAULT 0,
    adaptation_suggestions NTEXT,

    -- System Fields
    week_number INT,
    session_number_in_week INT,
    session_number_overall INT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    completed_at DATETIME2,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(plan_id) ON DELETE SET NULL
);

-- Create Nutrition Plans Table
CREATE TABLE nutrition_plans (
    plan_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_name NVARCHAR(200) NOT NULL,
    plan_description NTEXT,
    fitness_goal NVARCHAR(20) NOT NULL,
    dietary_preference NVARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    duration_weeks INT CHECK (duration_weeks >= 1 AND duration_weeks <= 52),
    current_week INT DEFAULT 1,
    is_active BIT NOT NULL DEFAULT 1,
    plan_status NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (plan_status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'ARCHIVED')),
    version_number INT NOT NULL DEFAULT 1,
    previous_plan_id BIGINT,
    adaptation_reason NVARCHAR(500),

    -- Calorie and Macro Targets
    daily_calories_target INT NOT NULL CHECK (daily_calories_target >= 800 AND daily_calories_target <= 5000),
    bmr DECIMAL(8,2),
    tdee DECIMAL(8,2),
    calorie_adjustment INT NOT NULL DEFAULT 0,
    protein_grams_target DECIMAL(6,2) NOT NULL CHECK (protein_grams_target >= 50),
    carbs_grams_target DECIMAL(6,2) NOT NULL CHECK (carbs_grams_target >= 50),
    fats_grams_target DECIMAL(6,2) NOT NULL CHECK (fats_grams_target >= 20),
    fiber_grams_target DECIMAL(5,2),
    protein_percentage DECIMAL(5,2) NOT NULL CHECK (protein_percentage >= 10 AND protein_percentage <= 50),
    carbs_percentage DECIMAL(5,2) NOT NULL CHECK (carbs_percentage >= 10 AND carbs_percentage <= 70),
    fats_percentage DECIMAL(5,2) NOT NULL CHECK (fats_percentage >= 15 AND fats_percentage <= 50),

    -- Hydration and Supplements
    daily_water_target_liters DECIMAL(3,1) NOT NULL CHECK (daily_water_target_liters >= 1 AND daily_water_target_liters <= 8),
    supplement_recommendations NTEXT,

    -- Meal Planning
    meals_per_day INT NOT NULL DEFAULT 3 CHECK (meals_per_day >= 3 AND meals_per_day <= 8),
    meal_plan_template NTEXT,
    food_preferences NTEXT,
    food_restrictions NTEXT,

    -- Performance Tracking
    days_followed INT DEFAULT 0,
    total_days_planned INT,
    adherence_percentage DECIMAL(5,2) DEFAULT 0.0,
    average_daily_calories DECIMAL(8,2),
    average_protein_grams DECIMAL(6,2),
    average_carbs_grams DECIMAL(6,2),
    average_fats_grams DECIMAL(6,2),
    average_water_intake DECIMAL(3,1),

    -- AI Configuration
    ai_adaptation_enabled BIT NOT NULL DEFAULT 1,
    auto_calorie_adjustment BIT NOT NULL DEFAULT 1,
    macro_flexibility_enabled BIT NOT NULL DEFAULT 1,
    last_adaptation_date DATE,
    adaptations_count INT DEFAULT 0,

    -- Special Considerations
    has_allergies BIT NOT NULL DEFAULT 0,
    allergy_list NVARCHAR(500),
    cooking_skill_level NVARCHAR(20) DEFAULT 'INTERMEDIATE' CHECK (cooking_skill_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    meal_prep_time_available INT,
    budget_level NVARCHAR(20) DEFAULT 'MODERATE' CHECK (budget_level IN ('LOW', 'MODERATE', 'HIGH', 'UNLIMITED')),

    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Meal Entries Table
CREATE TABLE meal_entries (
    entry_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    nutrition_plan_id BIGINT,
    entry_date DATE NOT NULL,
    meal_time TIME,
    meal_type NVARCHAR(20) NOT NULL CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'PRE_WORKOUT', 'POST_WORKOUT', 'LATE_NIGHT')),
    meal_name NVARCHAR(200) NOT NULL,
    meal_description NTEXT,

    -- Food Data (JSON)
    food_items NTEXT,
    recipe_details NTEXT,

    -- Nutritional Content
    total_calories INT CHECK (total_calories >= 0 AND total_calories <= 5000),
    protein_grams DECIMAL(6,2) CHECK (protein_grams >= 0 AND protein_grams <= 500),
    carbs_grams DECIMAL(6,2) CHECK (carbs_grams >= 0 AND carbs_grams <= 1000),
    fats_grams DECIMAL(6,2) CHECK (fats_grams >= 0 AND fats_grams <= 300),
    fiber_grams DECIMAL(5,2) CHECK (fiber_grams >= 0 AND fiber_grams <= 100),
    sugar_grams DECIMAL(5,2) CHECK (sugar_grams >= 0 AND sugar_grams <= 300),
    sodium_mg DECIMAL(7,2) CHECK (sodium_mg >= 0 AND sodium_mg <= 10000),
    cholesterol_mg DECIMAL(6,2) CHECK (cholesterol_mg >= 0 AND cholesterol_mg <= 1000),

    -- Micronutrients
    vitamin_c_mg DECIMAL(6,2),
    vitamin_d_iu DECIMAL(6,2),
    calcium_mg DECIMAL(6,2),
    iron_mg DECIMAL(5,2),

    -- Hydration
    water_intake_liters DECIMAL(3,1) CHECK (water_intake_liters >= 0 AND water_intake_liters <= 5),

    -- Context and Quality
    meal_source NVARCHAR(20) CHECK (meal_source IN ('HOME_COOKED', 'RESTAURANT', 'FAST_FOOD', 'CAFETERIA', 'DELIVERY', 'PREPARED_MEAL', 'OTHER')),
    preparation_method NVARCHAR(20) CHECK (preparation_method IN ('RAW', 'BOILED', 'STEAMED', 'GRILLED', 'BAKED', 'FRIED', 'ROASTED', 'SAUTEED', 'MICROWAVED', 'OTHER')),
    cooking_time_minutes INT,
    eating_location NVARCHAR(100),
    ate_with_others BIT NOT NULL DEFAULT 0,
    hunger_level_before INT CHECK (hunger_level_before >= 1 AND hunger_level_before <= 10),
    hunger_level_after INT CHECK (hunger_level_after >= 1 AND hunger_level_after <= 10),
    satisfaction_rating INT CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 10),
    energy_level_after_eating INT CHECK (energy_level_after_eating >= 1 AND energy_level_after_eating <= 10),

    -- Portion Information
    total_weight_grams DECIMAL(7,2) CHECK (total_weight_grams >= 0 AND total_weight_grams <= 5000),
    portion_size NVARCHAR(20) CHECK (portion_size IN ('VERY_SMALL', 'SMALL', 'MEDIUM', 'LARGE', 'VERY_LARGE', 'EXTRA_LARGE')),
    portion_accuracy NVARCHAR(20) DEFAULT 'ESTIMATED' CHECK (portion_accuracy IN ('MEASURED', 'ESTIMATED', 'GUESSED')),

    -- Compliance
    fits_dietary_preference BIT NOT NULL DEFAULT 1,
    fits_nutrition_plan BIT NOT NULL DEFAULT 1,
    was_planned_meal BIT NOT NULL DEFAULT 0,
    deviation_reason NVARCHAR(500),

    -- Additional Context
    meal_notes NTEXT,
    ingredients_list NTEXT,
    allergen_warnings NVARCHAR(500),
    meal_cost DECIMAL(6,2),
    photo_url NVARCHAR(500),

    -- Calculated Fields
    calories_from_protein INT,
    calories_from_carbs INT,
    calories_from_fats INT,
    protein_percentage DECIMAL(5,2),
    carbs_percentage DECIMAL(5,2),
    fats_percentage DECIMAL(5,2),
    macro_balance_score DECIMAL(5,2),

    -- System Fields
    entry_method NVARCHAR(20) DEFAULT 'MANUAL' CHECK (entry_method IN ('MANUAL', 'BARCODE_SCAN', 'PHOTO_RECOGNITION', 'VOICE_INPUT', 'API_IMPORT')),
    data_source NVARCHAR(100),
    verified_by_nutritionist BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (nutrition_plan_id) REFERENCES nutrition_plans(plan_id) ON DELETE SET NULL
);

-- Create Indexes for Performance
CREATE INDEX IX_users_username ON users(username);
CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_fitness_goal ON users(fitness_goal);
CREATE INDEX IX_users_created_at ON users(created_at);

CREATE INDEX IX_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IX_user_profiles_created_at ON user_profiles(created_at);

CREATE INDEX IX_progress_entries_user_id ON progress_entries(user_id);
CREATE INDEX IX_progress_entries_entry_date ON progress_entries(entry_date);
CREATE INDEX IX_progress_entries_entry_type ON progress_entries(entry_type);
CREATE INDEX IX_progress_entries_user_date ON progress_entries(user_id, entry_date);

CREATE INDEX IX_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX IX_workout_plans_is_active ON workout_plans(is_active);
CREATE INDEX IX_workout_plans_start_date ON workout_plans(start_date);

CREATE INDEX IX_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IX_workout_sessions_session_date ON workout_sessions(session_date);
CREATE INDEX IX_workout_sessions_plan_id ON workout_sessions(workout_plan_id);

CREATE INDEX IX_nutrition_plans_user_id ON nutrition_plans(user_id);
CREATE INDEX IX_nutrition_plans_is_active ON nutrition_plans(is_active);

CREATE INDEX IX_meal_entries_user_id ON meal_entries(user_id);
CREATE INDEX IX_meal_entries_entry_date ON meal_entries(entry_date);
CREATE INDEX IX_meal_entries_meal_type ON meal_entries(meal_type);

-- Insert Sample Data for Testing
INSERT INTO users (username, email, password, first_name, last_name, age, gender, height_cm, weight_kg,
                   fitness_goal, fitness_level, workout_days_per_week, session_duration_minutes,
                   equipment_access, dietary_preference) VALUES
('admin', 'admin@biosyncai.com', '$2a$10$example.hash', 'Admin', 'User', 30, 'MALE', 175.0, 75.0,
 'MAINTENANCE', 'INTERMEDIATE', 4, 60, 'GYM', 'OMNIVORE'),
('john_doe', 'john@example.com', '$2a$10$example.hash', 'John', 'Doe', 28, 'MALE', 180.0, 80.0,
 'MUSCLE_GAIN', 'BEGINNER', 3, 45, 'HOME', 'OMNIVORE'),
('jane_smith', 'jane@example.com', '$2a$10$example.hash', 'Jane', 'Smith', 25, 'FEMALE', 165.0, 60.0,
 'FAT_LOSS', 'INTERMEDIATE', 5, 60, 'GYM', 'VEGETARIAN');

PRINT 'BioSync AI Database initialized successfully!';