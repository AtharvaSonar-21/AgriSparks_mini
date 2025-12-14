
# 🌱 AgriSparks – Plant Disease Classification System

An **AI-powered plant disease detection system** built using **TensorFlow Lite** and the **MERN stack**.
The application classifies plant leaf images to identify possible diseases and demonstrates a scalable full-stack ML deployment.

---

## 📂 Project Structure

```
AgriSparks_mini/
├── frontend/                    # React frontend (Port 5173)
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
├── backend/                     # Node.js backend (Port 5000)
│   ├── server.js                # Express server
│   ├── inference.py             # Python TFLite inference script
│   ├── routes/
│   │   ├── predict.js           
│   │   └── history.js           
│   ├── models/
│   │   ├── plant_disease_model_int8.tflite
|   |   ├── predictions.js
|   |   └── AgriSparks.ipynb
│   ├── uploads/                 # Temporary image storage
│   ├── middleware/
│   └── package.json
│
└── Documentation/
    ├── QUICK_START.md
    ├── INTEGRATION_STATUS.md
    └── SYSTEM_INTEGRATION_COMPLETE.md
```

---

## 📘 Model Training Notebook

👉 **Open the training notebook in Google Colab:**

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1oG0Q__VzHYfgV_vZyVf4XbhFmlhYO5Bf)

---
## 🛠️ Tech Stack

### Frontend

* **React 19.2.0**
* **Tailwind CSS**
* **Vite**

### Backend

* **Node.js**
* **Express.js**

### Machine Learning / Inference

* **Python 3.11**
* **TensorFlow Lite (INT8 Quantized Model)**
* **NumPy**
  
---

## ⚙️ Setup Instructions

### Backend Setup

```bash
cd backend
npm install
```

Run the backend server:

```bash
npm run dev
```


---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```


---
