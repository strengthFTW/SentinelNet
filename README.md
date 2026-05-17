# SentinelNet: Automated Network Security and Phishing Domain Classification

SentinelNet is an end-to-end machine learning operations (MLOps) platform built to classify network threats and detect phishing domains. The system includes a FastAPI backend for prediction, an automated training pipeline using scikit-learn ensembles, and an interactive React web dashboard.

---

## MLOps Pipeline Flow

The training pipeline runs automatically in 6 modular stages:

1. **01 / Data Ingestion** (`data_ingestion.py`): Connects to MongoDB, extracts threat records, and exports training and testing data splits.
2. **02 / Data Validation** (`data_validation.py`): Performs column schema validations with Great Expectations and checks for dataset drift using Evidently AI.
3. **03 / Data Transformation** (`data_transformation.py`): Standardizes and cleans threat metrics using a scikit-learn pipeline with KNNImputer.
4. **04 / Model Trainer** (`model_trainer.py`): Automatically trains and evaluates 5 different classifier ensembles (Random Forest, Decision Tree, Gradient Boosting, Logistic Regression, AdaBoost) to select the best predictor.
5. **05 / Model Registry** (`mlflow`): Logs model metrics and parameters, then registers the best-performing model to the MLflow repository.
6. **06 / Deployment** (`k8s` / `ArgoCD`): Sets up declarative GitOps configurations to manage containerized replicas on a Kubernetes cluster via ArgoCD.

---

## Quick Start Guide

### 1. Run the Backend API and Training Pipeline

To configure the backend, install the packages, run the training pipeline, and start the API server:

```bash
# Install backend dependencies
pip install -r requirements.txt

# Run the full training pipeline
python main.py

# Launch the FastAPI REST API server
python app.py
```

* **Interactive Swagger API Documentation**: http://localhost:8000/docs
* **FastAPI Server Telemetry Metrics**: http://localhost:8000/metrics

---

### 2. Launch the Web Dashboard

To start the interactive frontend dashboard, run these commands in a new terminal:

```bash
# Navigate to the frontend directory
cd frontend

# Install package dependencies
npm install

# Start the local development server
npm run dev
```

Open your browser and navigate to:
http://localhost:5173/
