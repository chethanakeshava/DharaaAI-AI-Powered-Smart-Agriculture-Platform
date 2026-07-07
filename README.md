# DharaaAI

📌 **Overview**

DharaaAI is an AI-powered agricultural decision-support system designed to assist farmers in making intelligent, data-driven farming decisions. The platform provides:

- 🌱 Crop recommendation based on soil and climate
- 🧪 Fertilizer optimization suggestions
- 🔁 Sustainable crop rotation planning
- 📊 Market insights and profitability analysis
- 🌦️ Real-time weather updates
- 💬 Community discussion forum
- 🤖 Chatbot-based farming assistance

DharaaAI bridges the gap between traditional farming knowledge and modern digital agriculture using Machine Learning and Web Technologies.

---

## 🚜 Problem Statement

Farmers often rely on traditional knowledge and experience to select crops and fertilizers. However, due to:

- Changing soil conditions
- Climate variability
- Lack of region-specific data
- Limited access to scientific advisory systems

They may face:

- Low crop yields
- Soil degradation
- Financial instability

DharaaAI provides an intelligent AI-based system to support sustainable and profitable farming decisions.

---

## 🎯 Objectives

1. Recommend suitable crops using soil & climate data
2. Suggest optimized fertilizers based on nutrient gaps
3. Promote sustainable crop rotation planning
4. Integrate market and weather insights
5. Provide a user-friendly digital platform for farmers
6. Encourage data-driven and sustainable agriculture

---

## 🏗️ System Architecture

DharaaAI follows a multi-layer architecture:

1️⃣ **Frontend Layer**
   - React.js
   - Vite
   - Responsive and mobile-friendly UI

2️⃣ **Backend Layer**
   - Node.js
   - Express.js
   - REST API integration
   - Authentication & business logic

3️⃣ **Machine Learning Layer**
   - FastAPI
   - Decision Tree (Crop Recommendation)
   - Random Forest (Fertilizer Recommendation)
   - GridSearchCV for model optimization

4️⃣ **Database Layer**
   - Supabase (PostgreSQL)
   - User data
   - Community posts
   - Feedback storage

---

## 🤖 Machine Learning Models Used

### 🌱 Crop Recommendation
- **Algorithm**: Decision Tree Classifier
- **Inputs**:
  - Nitrogen (N)
  - Phosphorus (P)
  - Potassium (K)
  - pH
  - Temperature
  - Rainfall
  - Humidity
- **Output**: Best suitable crop

### 🧪 Fertilizer Recommendation
- **Algorithm**: Random Forest Classifier
- **Input**:
  - Soil nutrient levels
  - Crop type
  - Environmental conditions
- **Output**: Recommended fertilizer

### ⚙ Model Optimization
- GridSearchCV used for hyperparameter tuning
- Prevents overfitting and improves accuracy

---

## 🛠️ Technologies Used

### 💻 Programming Language
- Python

### 🌐 Web Technologies
- React.js
- Node.js
- Express.js
- FastAPI

### 🧠 ML Libraries
- Scikit-learn
- TensorFlow
- XGBoost
- Pandas
- NumPy

### 🗄 Database
- Supabase (PostgreSQL)

### 🔗 External APIs
- OpenWeatherMap API
- Agmarknet API (Market prices)
- News API

### 🧩 Version Control
- Git & GitHub

---


## 📂 Project Structure

```
/ (project root)
├── client/                # React SPA frontend
├── server/                # Express API backend and ml_api service
│   ├── api/               # server-side endpoints
│   ├── ml_api/            # FastAPI machine learning service
│   │   ├── main.py
│   │   ├── models/        # trained models used by Python service
│   │   └── requirements.txt
│   └── routes/            # Express route handlers
├── shared/                # Shared types and utilities
├── netlify/               # Netlify deployment config & functions
├── public/                # Static assets
├── dist/                  # build outputs
├── .venv/                 # Python virtual env (ignored)
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

1️⃣ **Clone the Repository**
```bash
git clone https://github.com/yourusername/DharaaAI.git
cd DharaaAI
```

2️⃣ **Backend Setup**
```bash
cd backend
npm install
npm start
```

3️⃣ **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4️⃣ **ML Service Setup**
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app:app --reload
```

---

## 🚀 Features

✔ User Authentication
✔ Crop Recommendation System
✔ Fertilizer Optimization
✔ Crop Rotation Planning
✔ Real-Time Weather Updates
✔ Market Price Insights
✔ Community Discussion Forum
✔ Chatbot Assistance
✔ Agricultural News Module
✔ Admin Control Panel

---

## 📊 Performance

- Recommendation generated in 2–4 seconds
- High classification accuracy
- Optimized database queries
- Supports multiple concurrent users

---

## 🔮 Future Scope

- IoT-based real-time soil monitoring
- Satellite image integration
- Pest & disease detection using CNN
- Voice-based multilingual support
- Mobile app deployment
- Government scheme integration

---

## 🌍 Impact

DharaaAI helps:

- Increase crop productivity
- Improve fertilizer efficiency
- Reduce financial risk
- Promote sustainable agriculture
- Support small and marginal farmers

---

## 👩‍💻 Team Members

- Chethana Keshava Shettigar
- Dyna Pemmaiah K
- Sanjana K S
- Shashmitha V

---

## 🎓 Academic Information

Department of Artificial Intelligence & Data Science
Srinivas Institute of Technology
Visvesvaraya Technological University
2025–2026

---

## 📄 License

This project is developed for academic purposes. For further usage or collaboration, contact the authors.

---

## 💡 Final Note

DharaaAI demonstrates how Artificial Intelligence can transform traditional agriculture into a smart, sustainable, and profitable ecosystem.


# DharaaAI
