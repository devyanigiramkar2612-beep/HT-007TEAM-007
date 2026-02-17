// BioSync AI - Personalized Fitness Intelligence System
// JavaScript Engine with Backend API Integration

// Global Application State
const BioSyncAI = {
  userProfile: null,
  currentPlan: null,
  progressHistory: [],
  initialized: false,
  apiBaseUrl: "http://localhost:8080/api/v1",
  currentUserId: null,
};

// DOM Elements Cache
const elements = {
  profileForm: null,
  progressForm: null,
  plansSection: null,
  progressSection: null,
  workoutPlan: null,
  nutritionPlan: null,
  progressStats: null,
  motivationalMessage: null,
};

// Initialize Application
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  // Cache DOM elements
  cacheElements();

  // Attach event listeners
  attachEventListeners();

  // Load saved data
  loadSavedData();

  // Set initial motivational message
  updateMotivationalMessage("welcome");

  BioSyncAI.initialized = true;
  console.log("BioSync AI initialized successfully");
}

function cacheElements() {
  elements.profileForm = document.getElementById("profileForm");
  elements.progressForm = document.getElementById("progressForm");
  elements.plansSection = document.getElementById("plansSection");
  elements.progressSection = document.getElementById("progressSection");
  elements.workoutPlan = document.getElementById("workoutPlan");
  elements.nutritionPlan = document.getElementById("nutritionPlan");
  elements.progressStats = document.getElementById("progressStats");
  elements.motivationalMessage = document.getElementById("motivationalMessage");
}

function attachEventListeners() {
  // Profile form submission
  if (elements.profileForm) {
    elements.profileForm.addEventListener("submit", handleProfileSubmission);
  }

  // Progress form submission
  if (elements.progressForm) {
    elements.progressForm.addEventListener("submit", handleProgressSubmission);
  }
}

// AI Personalization Engine Core Functions

async function handleProfileSubmission(event) {
  event.preventDefault();

  // Show loading state
  showLoading("Creating your profile and generating personalized plan...");

  try {
    // Extract form data
    const formData = new FormData(elements.profileForm);
    const userProfile = extractUserProfile(formData);

    // Validate profile data
    if (!validateProfile(userProfile)) {
      hideLoading();
      showAlert("Please fill in all required fields correctly.", "warning");
      return;
    }

    // Create user account via API
    const response = await fetch(`${BioSyncAI.apiBaseUrl}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userProfile),
    });

    const result = await response.json();

    if (!result.success) {
      hideLoading();
      showAlert(
        result.message || "Registration failed. Please try again.",
        "warning",
      );
      return;
    }

    // Store user data
    BioSyncAI.userProfile = result.data;
    BioSyncAI.currentUserId = result.data.userId;

    // Get AI recommendations
    const recommendationsResponse = await fetch(
      `${BioSyncAI.apiBaseUrl}/users/${BioSyncAI.currentUserId}/recommendations`,
    );
    const recommendationsResult = await recommendationsResponse.json();

    if (recommendationsResult.success) {
      // Generate plans using backend data
      const plans = await generatePersonalizedPlansFromAPI(
        result.data,
        recommendationsResult.data,
      );
      BioSyncAI.currentPlan = plans;

      // Display plans
      displayWorkoutPlan(plans.workout);
      displayNutritionPlan(plans.nutrition);

      // Show plans section
      showSection("plans");
      showSection("progress");

      // Update motivational message
      updateMotivationalMessage("planGenerated", result.data);

      // Save to localStorage
      saveToStorage();

      hideLoading();
      showAlert(
        "Your personalized plan has been generated successfully!",
        "success",
      );

      // Scroll to plans
      document
        .getElementById("plansSection")
        .scrollIntoView({ behavior: "smooth" });
    } else {
      hideLoading();
      showAlert(
        "Profile created but failed to generate recommendations. Please try again.",
        "warning",
      );
    }
  } catch (error) {
    console.error("Error creating profile:", error);
    hideLoading();
    showAlert(
      "Network error. Please check your connection and try again.",
      "warning",
    );
  }
}

function extractUserProfile(formData) {
  return {
    age: parseInt(formData.get("age")),
    gender: formData.get("gender"),
    height: parseInt(formData.get("height")),
    weight: parseFloat(formData.get("weight")),
    fitnessGoal: formData.get("fitnessGoal"),
    fitnessLevel: formData.get("fitnessLevel"),
    workoutDays: parseInt(formData.get("workoutDays")),
    sessionDuration: parseInt(formData.get("sessionDuration")),
    equipmentAccess: formData.get("equipmentAccess"),
    dietaryPreference: formData.get("dietaryPreference"),
    healthLimitations: formData.get("healthLimitations") || "",
    createdAt: new Date().toISOString(),
  };
}

function validateProfile(profile) {
  const required = [
    "age",
    "gender",
    "height",
    "weight",
    "fitnessGoal",
    "fitnessLevel",
    "workoutDays",
    "sessionDuration",
    "equipmentAccess",
    "dietaryPreference",
  ];

  return required.every((field) => profile[field] && profile[field] !== "");
}

// AI Algorithm: BMI and Health Metrics Calculator
function calculateHealthMetrics(profile) {
  const heightM = profile.height / 100;
  const bmi = profile.weight / (heightM * heightM);

  let bmiCategory;
  if (bmi < 18.5) bmiCategory = "underweight";
  else if (bmi < 25) bmiCategory = "normal";
  else if (bmi < 30) bmiCategory = "overweight";
  else bmiCategory = "obese";

  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr;
  if (profile.gender === "male") {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }

  // Activity multiplier based on workout frequency
  const activityMultipliers = {
    3: 1.375, // Light activity
    4: 1.55, // Moderate activity
    5: 1.725, // Heavy activity
    6: 1.9, // Very heavy activity
    7: 1.9, // Extremely active
  };

  const tdee = bmr * (activityMultipliers[profile.workoutDays] || 1.55);

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}

// AI Algorithm: Personalized Plan Generation
function generatePersonalizedPlans(profile) {
  const healthMetrics = calculateHealthMetrics(profile);

  return {
    workout: generateWorkoutPlan(profile, healthMetrics),
    nutrition: generateNutritionPlan(profile, healthMetrics),
    healthMetrics,
  };
}

// AI Algorithm: Workout Plan Generation
function generateWorkoutPlan(profile, healthMetrics) {
  const workoutTemplates = getWorkoutTemplates();
  const template = workoutTemplates[profile.fitnessLevel][profile.fitnessGoal];

  // Adjust for equipment availability
  const exercises = filterExercisesByEquipment(
    template.exercises,
    profile.equipmentAccess,
  );

  // Generate weekly schedule
  const weeklySchedule = generateWeeklySchedule(
    exercises,
    profile.workoutDays,
    profile.sessionDuration,
    profile.fitnessLevel,
  );

  return {
    summary: {
      goal: profile.fitnessGoal,
      level: profile.fitnessLevel,
      frequency: `${profile.workoutDays} days per week`,
      duration: `${profile.sessionDuration} minutes per session`,
      equipment: profile.equipmentAccess,
    },
    schedule: weeklySchedule,
    notes: generateWorkoutNotes(profile),
  };
}

function getWorkoutTemplates() {
  return {
    beginner: {
      fat_loss: {
        exercises: [
          {
            name: "Walking/Treadmill",
            type: "cardio",
            primaryMuscle: "full_body",
          },
          {
            name: "Bodyweight Squats",
            type: "strength",
            primaryMuscle: "legs",
          },
          {
            name: "Push-ups (Modified)",
            type: "strength",
            primaryMuscle: "chest",
          },
          { name: "Plank", type: "core", primaryMuscle: "core" },
          { name: "Jumping Jacks", type: "cardio", primaryMuscle: "full_body" },
        ],
      },
      muscle_gain: {
        exercises: [
          {
            name: "Bodyweight Squats",
            type: "strength",
            primaryMuscle: "legs",
          },
          { name: "Push-ups", type: "strength", primaryMuscle: "chest" },
          { name: "Lunges", type: "strength", primaryMuscle: "legs" },
          {
            name: "Pike Push-ups",
            type: "strength",
            primaryMuscle: "shoulders",
          },
          { name: "Glute Bridges", type: "strength", primaryMuscle: "glutes" },
        ],
      },
      maintenance: {
        exercises: [
          { name: "Brisk Walking", type: "cardio", primaryMuscle: "full_body" },
          {
            name: "Bodyweight Squats",
            type: "strength",
            primaryMuscle: "legs",
          },
          { name: "Wall Push-ups", type: "strength", primaryMuscle: "chest" },
          { name: "Standing Marches", type: "cardio", primaryMuscle: "core" },
        ],
      },
      endurance: {
        exercises: [
          {
            name: "Walking Intervals",
            type: "cardio",
            primaryMuscle: "full_body",
          },
          { name: "Step-ups", type: "cardio", primaryMuscle: "legs" },
          { name: "Arm Circles", type: "cardio", primaryMuscle: "shoulders" },
          {
            name: "Marching in Place",
            type: "cardio",
            primaryMuscle: "full_body",
          },
        ],
      },
      strength: {
        exercises: [
          { name: "Goblet Squats", type: "strength", primaryMuscle: "legs" },
          { name: "Push-ups", type: "strength", primaryMuscle: "chest" },
          { name: "Bent-over Rows", type: "strength", primaryMuscle: "back" },
          {
            name: "Overhead Press",
            type: "strength",
            primaryMuscle: "shoulders",
          },
        ],
      },
    },
    intermediate: {
      fat_loss: {
        exercises: [
          {
            name: "Running/Cycling",
            type: "cardio",
            primaryMuscle: "full_body",
          },
          { name: "Burpees", type: "cardio", primaryMuscle: "full_body" },
          { name: "Squats", type: "strength", primaryMuscle: "legs" },
          { name: "Push-ups", type: "strength", primaryMuscle: "chest" },
          { name: "Mountain Climbers", type: "cardio", primaryMuscle: "core" },
          { name: "Deadlifts", type: "strength", primaryMuscle: "back" },
        ],
      },
      muscle_gain: {
        exercises: [
          { name: "Squats", type: "strength", primaryMuscle: "legs" },
          { name: "Bench Press", type: "strength", primaryMuscle: "chest" },
          { name: "Deadlifts", type: "strength", primaryMuscle: "back" },
          {
            name: "Overhead Press",
            type: "strength",
            primaryMuscle: "shoulders",
          },
          { name: "Pull-ups", type: "strength", primaryMuscle: "back" },
          { name: "Dips", type: "strength", primaryMuscle: "triceps" },
        ],
      },
      maintenance: {
        exercises: [
          {
            name: "Moderate Cardio",
            type: "cardio",
            primaryMuscle: "full_body",
          },
          { name: "Squats", type: "strength", primaryMuscle: "legs" },
          { name: "Push-ups", type: "strength", primaryMuscle: "chest" },
          { name: "Rows", type: "strength", primaryMuscle: "back" },
          { name: "Plank Variations", type: "core", primaryMuscle: "core" },
        ],
      },
      endurance: {
        exercises: [
          {
            name: "Long Distance Running",
            type: "cardio",
            primaryMuscle: "full_body",
          },
          { name: "Cycling Intervals", type: "cardio", primaryMuscle: "legs" },
          { name: "Swimming", type: "cardio", primaryMuscle: "full_body" },
          {
            name: "High-Intensity Intervals",
            type: "cardio",
            primaryMuscle: "full_body",
          },
        ],
      },
      strength: {
        exercises: [
          { name: "Back Squats", type: "strength", primaryMuscle: "legs" },
          { name: "Deadlifts", type: "strength", primaryMuscle: "back" },
          { name: "Bench Press", type: "strength", primaryMuscle: "chest" },
          {
            name: "Overhead Press",
            type: "strength",
            primaryMuscle: "shoulders",
          },
          { name: "Barbell Rows", type: "strength", primaryMuscle: "back" },
        ],
      },
    },
    advanced: {
      fat_loss: {
        exercises: [
          { name: "HIIT Sprints", type: "cardio", primaryMuscle: "full_body" },
          {
            name: "Complex Movements",
            type: "strength",
            primaryMuscle: "full_body",
          },
          {
            name: "Plyometric Exercises",
            type: "cardio",
            primaryMuscle: "full_body",
          },
          {
            name: "Heavy Compound Lifts",
            type: "strength",
            primaryMuscle: "full_body",
          },
        ],
      },
      muscle_gain: {
        exercises: [
          { name: "Heavy Squats", type: "strength", primaryMuscle: "legs" },
          { name: "Heavy Deadlifts", type: "strength", primaryMuscle: "back" },
          {
            name: "Heavy Bench Press",
            type: "strength",
            primaryMuscle: "chest",
          },
          {
            name: "Weighted Pull-ups",
            type: "strength",
            primaryMuscle: "back",
          },
          {
            name: "Advanced Variations",
            type: "strength",
            primaryMuscle: "full_body",
          },
        ],
      },
      maintenance: {
        exercises: [
          {
            name: "Varied Training",
            type: "strength",
            primaryMuscle: "full_body",
          },
          {
            name: "Functional Movements",
            type: "strength",
            primaryMuscle: "full_body",
          },
          {
            name: "Sport-Specific Training",
            type: "cardio",
            primaryMuscle: "full_body",
          },
        ],
      },
      endurance: {
        exercises: [
          {
            name: "Ultra-Endurance Training",
            type: "cardio",
            primaryMuscle: "full_body",
          },
          {
            name: "Advanced Intervals",
            type: "cardio",
            primaryMuscle: "full_body",
          },
          {
            name: "Competition Preparation",
            type: "cardio",
            primaryMuscle: "full_body",
          },
        ],
      },
      strength: {
        exercises: [
          {
            name: "Powerlifting Training",
            type: "strength",
            primaryMuscle: "full_body",
          },
          {
            name: "Olympic Lifts",
            type: "strength",
            primaryMuscle: "full_body",
          },
          {
            name: "Advanced Periodization",
            type: "strength",
            primaryMuscle: "full_body",
          },
        ],
      },
    },
  };
}

function filterExercisesByEquipment(exercises, equipment) {
  const equipmentExercises = {
    minimal: exercises.filter(
      (ex) => ["bodyweight", "minimal"].includes(ex.equipment) || !ex.equipment,
    ),
    home: exercises.concat([
      {
        name: "Dumbbell Rows",
        type: "strength",
        primaryMuscle: "back",
        equipment: "home",
      },
      {
        name: "Dumbbell Press",
        type: "strength",
        primaryMuscle: "chest",
        equipment: "home",
      },
    ]),
    gym: exercises.concat([
      {
        name: "Barbell Squats",
        type: "strength",
        primaryMuscle: "legs",
        equipment: "gym",
      },
      {
        name: "Lat Pulldowns",
        type: "strength",
        primaryMuscle: "back",
        equipment: "gym",
      },
      {
        name: "Cable Exercises",
        type: "strength",
        primaryMuscle: "full_body",
        equipment: "gym",
      },
    ]),
  };

  return equipmentExercises[equipment] || exercises;
}

function generateWeeklySchedule(
  exercises,
  workoutDays,
  sessionDuration,
  fitnessLevel,
) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const schedule = [];

  // Determine workout intensity and volume
  const intensitySettings = {
    beginner: { sets: [2, 3], reps: [8, 12], rest: 60 },
    intermediate: { sets: [3, 4], reps: [6, 10], rest: 45 },
    advanced: { sets: [4, 5], reps: [4, 8], rest: 30 },
  };

  const settings = intensitySettings[fitnessLevel];

  // Distribute workouts across the week
  const workoutPattern = distributeWorkouts(workoutDays);

  days.forEach((day, index) => {
    if (workoutPattern[index]) {
      const dayExercises = selectDayExercises(
        exercises,
        sessionDuration,
        settings,
      );
      schedule.push({
        day: day,
        type: "workout",
        exercises: dayExercises,
        duration: sessionDuration,
      });
    } else {
      schedule.push({
        day: day,
        type: "rest",
        activity: "Rest day or light activity (walking, stretching)",
        duration: 0,
      });
    }
  });

  return schedule;
}

function distributeWorkouts(workoutDays) {
  const patterns = {
    3: [1, 0, 1, 0, 1, 0, 0], // Mon, Wed, Fri
    4: [1, 0, 1, 0, 1, 1, 0], // Mon, Wed, Fri, Sat
    5: [1, 1, 1, 0, 1, 1, 0], // Mon-Wed, Fri, Sat
    6: [1, 1, 1, 1, 1, 1, 0], // Mon-Sat
    7: [1, 1, 1, 1, 1, 1, 1], // Every day
  };

  return patterns[workoutDays] || patterns[3];
}

function selectDayExercises(exercises, duration, settings) {
  // Calculate approximate number of exercises based on duration
  const avgExerciseTime = 8; // minutes per exercise including rest
  const targetExercises = Math.floor(duration / avgExerciseTime);

  // Select exercises (rotate through different muscle groups)
  const selectedExercises = exercises.slice(0, Math.max(3, targetExercises));

  return selectedExercises.map((exercise) => ({
    name: exercise.name,
    type: exercise.type,
    sets:
      settings.sets[0] +
      Math.floor(Math.random() * (settings.sets[1] - settings.sets[0] + 1)),
    reps:
      exercise.type === "cardio"
        ? `${settings.reps[0]}-${settings.reps[1]} minutes`
        : `${settings.reps[0]}-${settings.reps[1]} reps`,
    rest: `${settings.rest}s rest`,
    muscle: exercise.primaryMuscle,
  }));
}

function generateWorkoutNotes(profile) {
  const notes = [];

  if (profile.healthLimitations) {
    notes.push(
      `⚠️ Consider your health limitations: ${profile.healthLimitations}`,
    );
  }

  notes.push("💡 Start with lighter weights and focus on proper form");
  notes.push("📈 Gradually increase intensity as you progress");
  notes.push("💧 Stay hydrated throughout your workout");
  notes.push("🛌 Allow adequate rest between sessions");

  return notes;
}

// AI Algorithm: Nutrition Plan Generation
function generateNutritionPlan(profile, healthMetrics) {
  // Calculate calorie goals based on fitness goal
  const calorieAdjustments = {
    fat_loss: -500, // 500 calorie deficit
    muscle_gain: 300, // 300 calorie surplus
    maintenance: 0, // Maintain TDEE
    endurance: 200, // Slight surplus for performance
    strength: 200, // Slight surplus for recovery
  };

  const targetCalories =
    healthMetrics.tdee + (calorieAdjustments[profile.fitnessGoal] || 0);

  // Calculate macro distribution
  const macros = calculateMacroDistribution(profile, targetCalories);

  // Generate meal suggestions
  const meals = generateMealPlan(profile, macros);

  return {
    summary: {
      calories: Math.round(targetCalories),
      goal: profile.fitnessGoal,
      dietType: profile.dietaryPreference,
    },
    macros: macros,
    meals: meals,
    hydration: calculateHydrationNeeds(profile),
    supplements: generateSupplementRecommendations(profile),
    notes: generateNutritionNotes(profile),
  };
}

function calculateMacroDistribution(profile, calories) {
  // Macro ratios based on fitness goals
  const macroRatios = {
    fat_loss: { protein: 0.35, carbs: 0.3, fats: 0.35 },
    muscle_gain: { protein: 0.3, carbs: 0.45, fats: 0.25 },
    maintenance: { protein: 0.25, carbs: 0.45, fats: 0.3 },
    endurance: { protein: 0.2, carbs: 0.6, fats: 0.2 },
    strength: { protein: 0.3, carbs: 0.4, fats: 0.3 },
  };

  const ratios = macroRatios[profile.fitnessGoal] || macroRatios.maintenance;

  return {
    protein: {
      grams: Math.round((calories * ratios.protein) / 4),
      calories: Math.round(calories * ratios.protein),
      percentage: Math.round(ratios.protein * 100),
    },
    carbs: {
      grams: Math.round((calories * ratios.carbs) / 4),
      calories: Math.round(calories * ratios.carbs),
      percentage: Math.round(ratios.carbs * 100),
    },
    fats: {
      grams: Math.round((calories * ratios.fats) / 9),
      calories: Math.round(calories * ratios.fats),
      percentage: Math.round(ratios.fats * 100),
    },
  };
}

function generateMealPlan(profile, macros) {
  const mealTemplates = {
    omnivore: {
      breakfast: [
        "Oatmeal with berries and protein powder",
        "Eggs with whole grain toast",
        "Greek yogurt with nuts and fruit",
      ],
      lunch: [
        "Grilled chicken with quinoa and vegetables",
        "Salmon with sweet potato",
        "Lean beef with brown rice",
      ],
      dinner: [
        "Baked fish with roasted vegetables",
        "Chicken stir-fry with brown rice",
        "Lean pork with steamed broccoli",
      ],
      snacks: [
        "Apple with almond butter",
        "Protein shake with banana",
        "Mixed nuts and dried fruit",
      ],
    },
    vegetarian: {
      breakfast: [
        "Vegetarian protein smoothie",
        "Tofu scramble with vegetables",
        "Greek yogurt with granola",
      ],
      lunch: [
        "Quinoa bowl with black beans",
        "Lentil soup with whole grain bread",
        "Chickpea salad wrap",
      ],
      dinner: [
        "Vegetarian stir-fry with tofu",
        "Black bean and sweet potato bowl",
        "Eggplant parmesan with side salad",
      ],
      snacks: ["Hummus with vegetables", "Trail mix", "Cheese and crackers"],
    },
    vegan: {
      breakfast: [
        "Plant protein smoothie",
        "Chia pudding with fruits",
        "Oatmeal with plant milk and nuts",
      ],
      lunch: [
        "Buddha bowl with tahini dressing",
        "Lentil and vegetable curry",
        "Quinoa salad with chickpeas",
      ],
      dinner: [
        "Tofu and vegetable stir-fry",
        "Black bean tacos with avocado",
        "Stuffed bell peppers with quinoa",
      ],
      snacks: ["Fruit and nut butter", "Roasted chickpeas", "Smoothie bowl"],
    },
    keto: {
      breakfast: [
        "Eggs with avocado",
        "Keto coffee with MCT oil",
        "Cheese omelet with spinach",
      ],
      lunch: [
        "Grilled chicken salad",
        "Salmon with asparagus",
        "Beef with leafy greens",
      ],
      dinner: [
        "Steak with broccoli",
        "Pork chops with cauliflower",
        "Fish with zucchini noodles",
      ],
      snacks: ["Nuts and seeds", "Cheese cubes", "Avocado with salt"],
    },
    mediterranean: {
      breakfast: [
        "Greek yogurt with olive oil drizzle",
        "Whole grain toast with avocado",
        "Fruit and nut bowl",
      ],
      lunch: [
        "Mediterranean quinoa salad",
        "Grilled fish with vegetables",
        "Hummus and vegetable wrap",
      ],
      dinner: [
        "Baked salmon with herbs",
        "Chicken with roasted vegetables",
        "Lentil stew with whole grains",
      ],
      snacks: ["Olives and cheese", "Fresh fruit", "Nuts and seeds"],
    },
  };

  const templates =
    mealTemplates[profile.dietaryPreference] || mealTemplates.omnivore;

  return {
    breakfast: {
      title: "Breakfast",
      suggestion:
        templates.breakfast[
          Math.floor(Math.random() * templates.breakfast.length)
        ],
      targetCalories: Math.round(
        macros.protein.calories * 0.25 +
          macros.carbs.calories * 0.25 +
          macros.fats.calories * 0.25,
      ),
    },
    lunch: {
      title: "Lunch",
      suggestion:
        templates.lunch[Math.floor(Math.random() * templates.lunch.length)],
      targetCalories: Math.round(
        macros.protein.calories * 0.35 +
          macros.carbs.calories * 0.35 +
          macros.fats.calories * 0.35,
      ),
    },
    dinner: {
      title: "Dinner",
      suggestion:
        templates.dinner[Math.floor(Math.random() * templates.dinner.length)],
      targetCalories: Math.round(
        macros.protein.calories * 0.3 +
          macros.carbs.calories * 0.3 +
          macros.fats.calories * 0.3,
      ),
    },
    snacks: {
      title: "Snacks",
      suggestion:
        templates.snacks[Math.floor(Math.random() * templates.snacks.length)],
      targetCalories: Math.round(
        macros.protein.calories * 0.1 +
          macros.carbs.calories * 0.1 +
          macros.fats.calories * 0.1,
      ),
    },
  };
}

function calculateHydrationNeeds(profile) {
  // Base water needs: 35ml per kg body weight
  const baseWater = profile.weight * 35;

  // Additional water for exercise: 500-750ml per hour of exercise
  const exerciseWater =
    (profile.sessionDuration / 60) * 600 * profile.workoutDays;

  const totalML = baseWater + exerciseWater / 7; // Daily average
  const totalLiters = Math.round((totalML / 1000) * 10) / 10;

  return {
    daily: `${totalLiters}L`,
    notes: "Increase intake on workout days and in hot weather",
  };
}

function generateSupplementRecommendations(profile) {
  const baseSupplements = ["Multivitamin", "Omega-3 fatty acids"];

  if (profile.fitnessGoal === "muscle_gain") {
    baseSupplements.push("Whey protein powder", "Creatine monohydrate");
  }

  if (profile.fitnessGoal === "endurance") {
    baseSupplements.push("Electrolyte supplements");
  }

  if (profile.dietaryPreference === "vegan") {
    baseSupplements.push("Vitamin B12", "Plant protein powder", "Iron");
  }

  return baseSupplements;
}

function generateNutritionNotes(profile) {
  const notes = [];

  notes.push("🥗 Focus on whole, minimally processed foods");
  notes.push("⏰ Eat regular meals to maintain energy levels");
  notes.push("🏋️ Have a protein source with each meal");

  if (profile.fitnessGoal === "fat_loss") {
    notes.push("📉 Create a moderate calorie deficit for sustainable fat loss");
  } else if (profile.fitnessGoal === "muscle_gain") {
    notes.push("📈 Eat in a slight surplus to support muscle growth");
  }

  if (profile.healthLimitations) {
    notes.push("⚠️ Consider your health limitations when planning meals");
  }

  return notes;
}

// Progress Tracking and Adaptive Intelligence
async function handleProgressSubmission(event) {
  event.preventDefault();

  if (!BioSyncAI.currentUserId) {
    showAlert("Please create your profile first.", "warning");
    return;
  }

  try {
    showLoading("Saving your progress...");

    const formData = new FormData(elements.progressForm);
    const progressData = {
      entryDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
      entryType: "WEEKLY",
      currentWeightKg: parseFloat(formData.get("currentWeight")),
      workoutDifficultyRating: mapDifficultyToEnum(
        formData.get("workoutDifficulty"),
      ),
      adherenceLevel: mapAdherenceToEnum(formData.get("adherenceLevel")),
      progressNotes: formData.get("progressNotes") || "",
      energyLevelRating: 7, // Default value
      moodRating: 7, // Default value
      motivationLevel: 7, // Default value
    };

    // Send progress data to backend
    const response = await fetch(
      `${BioSyncAI.apiBaseUrl}/progress/users/${BioSyncAI.currentUserId}/entries`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(progressData),
      },
    );

    const result = await response.json();

    if (result.success) {
      // Add to local progress history
      BioSyncAI.progressHistory.push(result.data);

      // Check if adaptation is needed
      const adaptationResponse = await fetch(
        `${BioSyncAI.apiBaseUrl}/progress/users/${BioSyncAI.currentUserId}/adaptation-check`,
      );
      const adaptationResult = await adaptationResponse.json();

      if (adaptationResult.success && adaptationResult.data.needsAdaptation) {
        showAlert(
          `Plan adaptation recommended: ${adaptationResult.data.recommendations.join(", ")}`,
          "info",
        );
      } else {
        showAlert(
          "Progress recorded successfully! Keep up the great work!",
          "success",
        );
      }

      // Update progress stats display
      await displayProgressStats();

      // Update motivational message
      updateMotivationalMessage("progressUpdated", progressData);

      // Save to storage
      saveToStorage();
    } else {
      showAlert(
        result.message || "Failed to save progress. Please try again.",
        "warning",
      );
    }

    hideLoading();
  } catch (error) {
    console.error("Error saving progress:", error);
    hideLoading();
    showAlert(
      "Network error. Please check your connection and try again.",
      "warning",
    );
  }
}

function analyzeProgressAndAdapt(progressData) {
  const changes = [];
  let adaptedPlan = JSON.parse(JSON.stringify(BioSyncAI.currentPlan));

  // Analyze weight change
  const originalWeight = BioSyncAI.userProfile.weight;
  const weightChange = progressData.currentWeight - originalWeight;
  const weeksPassed = Math.max(1, BioSyncAI.progressHistory.length);
  const weeklyWeightChange = weightChange / weeksPassed;

  // Adjust based on workout difficulty
  if (progressData.workoutDifficulty === "too_easy") {
    // Increase workout intensity
    adaptedPlan.workout.schedule.forEach((day) => {
      if (day.type === "workout") {
        day.exercises.forEach((exercise) => {
          if (exercise.sets) {
            exercise.sets = Math.min(exercise.sets + 1, 6);
            changes.push("Increased workout intensity");
          }
        });
      }
    });
  } else if (progressData.workoutDifficulty === "too_hard") {
    // Decrease workout intensity
    adaptedPlan.workout.schedule.forEach((day) => {
      if (day.type === "workout") {
        day.exercises.forEach((exercise) => {
          if (exercise.sets) {
            exercise.sets = Math.max(exercise.sets - 1, 2);
            changes.push("Reduced workout intensity");
          }
        });
      }
    });
  }

  // Adjust nutrition based on progress and goals
  if (BioSyncAI.userProfile.fitnessGoal === "fat_loss") {
    if (weeklyWeightChange > -0.2) {
      // Not losing weight fast enough
      adaptedPlan.nutrition.summary.calories -= 100;
      changes.push("Reduced daily calories");
    } else if (weeklyWeightChange < -1) {
      // Losing too fast
      adaptedPlan.nutrition.summary.calories += 100;
      changes.push("Increased daily calories");
    }
  } else if (BioSyncAI.userProfile.fitnessGoal === "muscle_gain") {
    if (weeklyWeightChange < 0.2) {
      // Not gaining enough
      adaptedPlan.nutrition.summary.calories += 150;
      changes.push("Increased daily calories");
    }
  }

  // Adjust based on adherence
  if (progressData.adherenceLevel === "poor") {
    // Suggest easier alternatives
    changes.push("Modified plan for better adherence");
  }

  return {
    plan: adaptedPlan,
    changes: [...new Set(changes)], // Remove duplicates
  };
}

// UI Display Functions
function displayWorkoutPlan(workoutPlan) {
  const container = elements.workoutPlan;

  let html = `
        <div class="plan-summary">
            <h4>Workout Overview</h4>
            <p><strong>Goal:</strong> ${capitalizeFirst(workoutPlan.summary.goal.replace("_", " "))}</p>
            <p><strong>Level:</strong> ${capitalizeFirst(workoutPlan.summary.level)}</p>
            <p><strong>Frequency:</strong> ${workoutPlan.summary.frequency}</p>
            <p><strong>Duration:</strong> ${workoutPlan.summary.duration}</p>
            <p><strong>Equipment:</strong> ${capitalizeFirst(workoutPlan.summary.equipment)}</p>
        </div>

        <div class="weekly-schedule">
            <h4>Your Weekly Schedule</h4>
    `;

  workoutPlan.schedule.forEach((day) => {
    if (day.type === "workout") {
      html += `
                <div class="day-workout">
                    <div class="day-title">${day.day} - Workout (${day.duration} min)</div>
                    <ul class="exercise-list">
            `;

      day.exercises.forEach((exercise) => {
        html += `
                    <li class="exercise-item">
                        <div class="exercise-name">${exercise.name}</div>
                        <div class="exercise-details">
                            ${exercise.sets} sets × ${exercise.reps} | Rest: ${exercise.rest}
                        </div>
                    </li>
                `;
      });

      html += `
                    </ul>
                </div>
            `;
    } else {
      html += `
                <div class="day-workout">
                    <div class="day-title">${day.day} - Rest Day</div>
                    <p style="margin: 10px 0; color: #7f8c8d;">${day.activity}</p>
                </div>
            `;
    }
  });

  html += `</div>`;

  // Add workout notes
  if (workoutPlan.notes && workoutPlan.notes.length > 0) {
    html += `
            <div class="workout-notes" style="margin-top: 20px;">
                <h4>Important Notes:</h4>
                <ul style="margin-left: 20px;">
        `;
    workoutPlan.notes.forEach((note) => {
      html += `<li style="margin-bottom: 5px;">${note}</li>`;
    });
    html += `
                </ul>
            </div>
        `;
  }

  container.innerHTML = html;
}

function displayNutritionPlan(nutritionPlan) {
  const container = elements.nutritionPlan;

  let html = `
        <div class="nutrition-summary">
            <h4>Nutrition Overview</h4>
            <p><strong>Daily Calories:</strong> ${nutritionPlan.summary.calories}</p>
            <p><strong>Goal:</strong> ${capitalizeFirst(nutritionPlan.summary.goal.replace("_", " "))}</p>
            <p><strong>Diet Type:</strong> ${capitalizeFirst(nutritionPlan.summary.dietType)}</p>
        </div>

        <div class="macro-breakdown">
            <div class="macro-item">
                <div class="macro-value">${nutritionPlan.macros.protein.grams}g</div>
                <div class="macro-label">Protein</div>
                <div class="macro-label">${nutritionPlan.macros.protein.percentage}%</div>
            </div>
            <div class="macro-item">
                <div class="macro-value">${nutritionPlan.macros.carbs.grams}g</div>
                <div class="macro-label">Carbs</div>
                <div class="macro-label">${nutritionPlan.macros.carbs.percentage}%</div>
            </div>
            <div class="macro-item">
                <div class="macro-value">${nutritionPlan.macros.fats.grams}g</div>
                <div class="macro-label">Fats</div>
                <div class="macro-label">${nutritionPlan.macros.fats.percentage}%</div>
            </div>
        </div>

        <div class="meal-plan">
            <h4>Sample Meal Plan</h4>
    `;

  Object.values(nutritionPlan.meals).forEach((meal) => {
    html += `
            <div class="meal-item">
                <div class="meal-title">${meal.title}</div>
                <div class="meal-description">${meal.suggestion}</div>
                <div class="meal-calories" style="font-size: 0.9rem; color: #7f8c8d; margin-top: 5px;">
                    Target: ~${meal.targetCalories} calories
                </div>
            </div>
        `;
  });

  html += `</div>`;

  // Add hydration info
  html += `
        <div class="hydration-info" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h4>💧 Daily Hydration</h4>
            <p><strong>Target:</strong> ${nutritionPlan.hydration.daily}</p>
            <p style="font-size: 0.9rem; color: #7f8c8d;">${nutritionPlan.hydration.notes}</p>
        </div>
    `;

  // Add supplement recommendations
  if (nutritionPlan.supplements && nutritionPlan.supplements.length > 0) {
    html += `
            <div class="supplements-info" style="margin-top: 20px;">
                <h4>💊 Supplement Recommendations</h4>
                <ul style="margin-left: 20px;">
        `;
    nutritionPlan.supplements.forEach((supplement) => {
      html += `<li style="margin-bottom: 5px;">${supplement}</li>`;
    });
    html += `</ul></div>`;
  }

  // Add nutrition notes
  if (nutritionPlan.notes && nutritionPlan.notes.length > 0) {
    html += `
            <div class="nutrition-notes" style="margin-top: 20px;">
                <h4>Important Notes:</h4>
                <ul style="margin-left: 20px;">
        `;
    nutritionPlan.notes.forEach((note) => {
      html += `<li style="margin-bottom: 5px;">${note}</li>`;
    });
    html += `</ul></div>`;
  }

  container.innerHTML = html;
}

function displayProgressStats() {
  if (!BioSyncAI.progressHistory.length) return;

  const container = elements.progressStats;
  const latestProgress =
    BioSyncAI.progressHistory[BioSyncAI.progressHistory.length - 1];
  const originalWeight = BioSyncAI.userProfile.weight;
  const weightChange = latestProgress.currentWeight - originalWeight;
  const weeksPassed = BioSyncAI.progressHistory.length;

  let html = `
        <div class="stat-item">
            <div class="stat-value">${weeksPassed}</div>
            <div class="stat-label">Weeks</div>
        </div>
        <div class="stat-item">
            <div class="stat-value ${weightChange >= 0 ? "text-success" : "text-danger"}">${weightChange >= 0 ? "+" : ""}${weightChange.toFixed(1)}kg</div>
            <div class="stat-label">Weight Change</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${latestProgress.currentWeight}kg</div>
            <div class="stat-label">Current Weight</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${calculateAdherence()}%</div>
            <div class="stat-label">Avg Adherence</div>
        </div>
    `;

  container.innerHTML = html;
}

function calculateAdherence() {
  if (!BioSyncAI.progressHistory.length) return 0;

  const adherenceMap = {
    excellent: 95,
    good: 80,
    fair: 60,
    poor: 40,
  };

  const totalAdherence = BioSyncAI.progressHistory.reduce((sum, progress) => {
    return sum + (adherenceMap[progress.adherenceLevel] || 0);
  }, 0);

  return Math.round(totalAdherence / BioSyncAI.progressHistory.length);
}

// Motivational Message System
function updateMotivationalMessage(type, data = null) {
  const container = elements.motivationalMessage;
  let message = "";

  switch (type) {
    case "welcome":
      message = `
                <h3>Welcome to BioSync AI! 🚀</h3>
                <p>Start by creating your profile to receive your personalized fitness and nutrition plan powered by AI.</p>
            `;
      break;

    case "planGenerated":
      const goal = data.fitnessGoal.replace("_", " ");
      message = `
                <h3>Your Plan is Ready! 💪</h3>
                <p>We've created a personalized ${goal} plan just for you. Follow your schedule and track your progress for optimal results!</p>
            `;
      break;

    case "progressUpdated":
      const motivationalQuotes = [
        "Great job tracking your progress! Consistency is key to success. 🌟",
        "Every step forward is progress, no matter how small! Keep going! 💯",
        "Your dedication is inspiring! Results come to those who persist. 🔥",
        "Progress isn't always visible, but it's always happening. Stay strong! 💪",
        "You're building not just muscle, but discipline. Well done! 🏆",
      ];
      const randomQuote =
        motivationalQuotes[
          Math.floor(Math.random() * motivationalQuotes.length)
        ];
      message = `
                <h3>Progress Updated! 📊</h3>
                <p>${randomQuote}</p>
            `;
      break;

    default:
      message = `
                <h3>Keep Going! 💪</h3>
                <p>Your fitness journey is unique. Trust the process and celebrate small wins!</p>
            `;
  }

  container.innerHTML = message;
  container.classList.add("fade-in");
}

// Utility Functions
function showSection(sectionName) {
  const sectionMap = {
    plans: elements.plansSection,
    progress: elements.progressSection,
  };

  const section = sectionMap[sectionName];
  if (section) {
    section.style.display = "block";
    section.classList.add("fade-in");
  }
}

function showLoading(message = "Processing...") {
  // Create loading overlay
  const loadingOverlay = document.createElement("div");
  loadingOverlay.id = "loadingOverlay";
  loadingOverlay.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.7); display: flex; align-items: center;
                    justify-content: center; z-index: 9999; color: white;">
            <div style="text-align: center;">
                <div class="loading"></div>
                <p style="margin-top: 15px; font-size: 1.1rem;">${message}</p>
            </div>
        </div>
    `;
  document.body.appendChild(loadingOverlay);
}

function hideLoading() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

function showAlert(message, type = "info") {
  // Remove existing alerts
  const existingAlerts = document.querySelectorAll(".alert");
  existingAlerts.forEach((alert) => alert.remove());

  // Create new alert
  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.textContent = message;

  // Insert at the top of main content
  const main = document.querySelector("main");
  main.insertBefore(alert, main.firstChild);

  // Auto remove after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);

  // Scroll to alert
  alert.scrollIntoView({ behavior: "smooth" });
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper Functions for API Integration
function mapDifficultyToEnum(difficulty) {
  const mapping = {
    too_easy: "TOO_EASY",
    just_right: "JUST_RIGHT",
    challenging: "CHALLENGING",
    too_hard: "TOO_HARD",
  };
  return mapping[difficulty] || "JUST_RIGHT";
}

function mapAdherenceToEnum(adherence) {
  const mapping = {
    excellent: "EXCELLENT",
    good: "GOOD",
    fair: "FAIR",
    poor: "POOR",
  };
  return mapping[adherence] || "GOOD";
}

async function generatePersonalizedPlansFromAPI(userProfile, recommendations) {
  // Generate workout plan using backend recommendations
  const workoutPlan = {
    summary: {
      goal: userProfile.fitnessGoal.replace("_", " ").toLowerCase(),
      level: userProfile.fitnessLevel.toLowerCase(),
      frequency: `${userProfile.workoutDaysPerWeek} days per week`,
      duration: `${userProfile.sessionDurationMinutes} minutes per session`,
      equipment: userProfile.equipmentAccess.toLowerCase(),
    },
    schedule: generateWeeklySchedule(
      getExercisesForUser(userProfile),
      userProfile.workoutDaysPerWeek,
      userProfile.sessionDurationMinutes,
      userProfile.fitnessLevel,
    ),
    notes: generateWorkoutNotes(userProfile),
  };

  // Generate nutrition plan using backend recommendations
  const nutritionPlan = {
    summary: {
      calories: recommendations.targetCalories,
      goal: userProfile.fitnessGoal.replace("_", " ").toLowerCase(),
      dietType: userProfile.dietaryPreference.toLowerCase(),
    },
    macros: calculateMacroDistribution(
      userProfile,
      recommendations.targetCalories,
    ),
    meals: generateMealPlan(userProfile, null),
    hydration: {
      daily: `${recommendations.dailyWaterIntakeLiters}L`,
      notes: "Increase intake on workout days and in hot weather",
    },
    supplements: generateSupplementRecommendations(userProfile),
    notes: generateNutritionNotes(userProfile),
  };

  return { workout: workoutPlan, nutrition: nutritionPlan };
}

async function displayProgressStats() {
  if (!BioSyncAI.currentUserId) return;

  try {
    const response = await fetch(
      `${BioSyncAI.apiBaseUrl}/progress/users/${BioSyncAI.currentUserId}/analytics`,
    );
    const result = await response.json();

    if (result.success && result.data) {
      const container = elements.progressStats;
      const analytics = result.data;

      let html = `
        <div class="stat-item">
          <div class="stat-value">${BioSyncAI.progressHistory.length}</div>
          <div class="stat-label">Total Entries</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${analytics.currentWeight || "N/A"}</div>
          <div class="stat-label">Current Weight</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${analytics.totalWeightChange ? (analytics.totalWeightChange >= 0 ? "+" : "") + analytics.totalWeightChange.toFixed(1) + "kg" : "N/A"}</div>
          <div class="stat-label">Weight Change</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${analytics.averageWeeklyScore ? Math.round(analytics.averageWeeklyScore) + "%" : "N/A"}</div>
          <div class="stat-label">Avg Progress Score</div>
        </div>
      `;

      container.innerHTML = html;
    }
  } catch (error) {
    console.error("Error loading progress stats:", error);
  }
}

// Data Persistence Functions
function saveToStorage() {
  try {
    const data = {
      userProfile: BioSyncAI.userProfile,
      currentPlan: BioSyncAI.currentPlan,
      progressHistory: BioSyncAI.progressHistory,
      currentUserId: BioSyncAI.currentUserId,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem("biosyncai_data", JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data:", error);
  }
}

async function loadSavedData() {
  try {
    const savedData = localStorage.getItem("biosyncai_data");
    if (savedData) {
      const data = JSON.parse(savedData);
      BioSyncAI.userProfile = data.userProfile;
      BioSyncAI.currentPlan = data.currentPlan;
      BioSyncAI.progressHistory = data.progressHistory || [];
      BioSyncAI.currentUserId = data.currentUserId;

      // If data exists, display it
      if (
        BioSyncAI.userProfile &&
        BioSyncAI.currentPlan &&
        BioSyncAI.currentUserId
      ) {
        // Populate form with saved profile
        populateProfileForm(BioSyncAI.userProfile);

        // Display saved plans
        displayWorkoutPlan(BioSyncAI.currentPlan.workout);
        displayNutritionPlan(BioSyncAI.currentPlan.nutrition);

        // Show sections
        showSection("plans");
        showSection("progress");

        // Load fresh progress data from backend
        await loadProgressFromBackend();

        // Display progress stats
        await displayProgressStats();

        // Update motivational message
        updateMotivationalMessage("planGenerated", BioSyncAI.userProfile);
      }
    }
  } catch (error) {
    console.error("Failed to load saved data:", error);
  }
}

async function loadProgressFromBackend() {
  if (!BioSyncAI.currentUserId) return;

  try {
    const response = await fetch(
      `${BioSyncAI.apiBaseUrl}/progress/users/${BioSyncAI.currentUserId}/entries`,
    );
    const result = await response.json();

    if (result.success && result.data) {
      BioSyncAI.progressHistory = result.data;
    }
  } catch (error) {
    console.error("Error loading progress from backend:", error);
  }
}

function populateProfileForm(profile) {
  const form = elements.profileForm;
  if (!form || !profile) return;

  Object.keys(profile).forEach((key) => {
    const input = form.querySelector(`[name="${key}"]`);
    if (input && profile[key] !== undefined) {
      input.value = profile[key];
    }
  });
}

// Export functions for testing (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    BioSyncAI,
    calculateHealthMetrics,
    generatePersonalizedPlans,
    analyzeProgressAndAdapt,
  };
}

// API Health Check
async function checkBackendConnection() {
  try {
    const response = await fetch(
      `${BioSyncAI.apiBaseUrl.replace("/api/v1", "")}/actuator/health`,
    );
    if (response.ok) {
      console.log("✅ Backend connection successful!");
    } else {
      console.warn("⚠️ Backend health check failed");
    }
  } catch (error) {
    console.warn("⚠️ Backend not available:", error.message);
  }
}

// Check backend connection on load
checkBackendConnection();

console.log(
  "🚀 BioSync AI script loaded successfully with backend integration!",
);