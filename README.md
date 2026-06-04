# 🌱 AgriSparks – AI-Powered Plant Disease Classification System

An AI-powered plant disease detection platform built using **TensorFlow Lite**, **React**, **Node.js**, and **Express.js**. AgriSparks enables users to upload plant leaf images and receive instant disease predictions through a lightweight machine learning model deployed in a scalable full-stack architecture.

## 🚀 Live Demo

🔗 https://plant-disease-frontend-li4y.onrender.com/

---

## 📌 Overview

AgriSparks leverages a TensorFlow Lite INT8-quantized model to identify plant diseases from leaf images. The system combines machine learning inference with a modern web interface, making plant disease diagnosis accessible and efficient.

### Key Features

* 🌿 Upload plant leaf images for analysis
* 🤖 AI-powered disease prediction using TensorFlow Lite
* ⚡ Fast inference with INT8 quantized model
* 📊 Prediction history tracking
* 📱 Responsive and modern UI
* 🔄 Full-stack MERN-based architecture
* ☁️ Cloud deployment on Render

---

## 📂 Project Structure

```text
AgriSparks/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── hooks/
│   │   │   └── useTFLiteModel.js
│   │   └── utils/
│   │       └── tfliteModel.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── server.js
│   ├── inference.py
│   ├── routes/
│   │   ├── predict.js
│   │   └── history.js
│   ├── models/
│   │   ├── plant_disease_model_int8.tflite
│   │   ├── predictions.js
│   │   └── AgriSparks.ipynb
│   ├── uploads/
│   ├── middleware/
│   └── package.json
│
└── Documentation/
    ├── QUICK_START.md
    ├── INTEGRATION_STATUS.md
    └── SYSTEM_INTEGRATION_COMPLETE.md
```

---

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js
* REST API

### Machine Learning

* Python 3.11
* TensorFlow Lite
* NumPy
* INT8 Quantized Model

### Deployment

* Render (Frontend & Backend)

---

## 📘 Model Training Notebook

Open the training notebook in Google Colab:

https://colab.research.google.com/drive/1oG0Q__VzHYfgV_vZyVf4XbhFmlhYO5Bf

---

## ⚙️ Local Setup

### Clone Repository

```bash
git clone https://github.com/AtharvaSonar-21/Agrisparks.git
cd Agrisparks
```

---

### Backend Setup

```bash
cd backend
npm install
```

Start the backend server:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 📡 API Endpoints

### Predict Disease

```http
POST /api/predict
```

Uploads an image and returns the predicted plant disease.

### Prediction History

```http
GET /api/history
```

Retrieves previously generated predictions.

---

## 🎯 Project Objectives

* Demonstrate practical integration of Machine Learning with Full-Stack Development
* Deploy TensorFlow Lite models in production-ready environments
* Provide an accessible tool for plant disease diagnosis
* Showcase scalable AI-powered web application architecture

---

## 📈 Future Enhancements

* Multi-language support
* Mobile application integration
* Disease treatment recommendations
* User authentication and dashboards
* Expanded plant disease dataset
* Confidence score visualization

---

## 👨‍💻 Author

**Atharva Sonar**

---

## 📄 License

This project is developed for educational and research purposes.
