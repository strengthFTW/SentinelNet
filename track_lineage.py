import uuid
from datetime import datetime
from openlineage.client import OpenLineageClient
from openlineage.client.run import RunEvent, RunState, Job, Run, Dataset
from openlineage.client.serde import Serde

def track_sentinel_lineage():
    print("Connecting to OpenLineage Client (Marquez local host on port 5000)...")
    
    # Configure the client to talk to the local Marquez server
    # Marquez runs at http://localhost:5000/api/v1
    client = OpenLineageClient.from_url("http://localhost:5000")
    namespace = "sentinelnet_pipeline"

    # ==========================================
    # 📥 1. Step 1: Data Ingestion Lineage
    # ==========================================
    print("Registering Data Ingestion lineage...")
    ingestion_job = Job(namespace=namespace, name="data_ingestion")
    ingestion_run = Run(runId=str(uuid.uuid4()))
    
    # Define Ingestion Inputs & Outputs
    raw_dataset = Dataset(namespace=namespace, name="Network_Data/phisingData.csv")
    train_dataset = Dataset(namespace=namespace, name="Artifacts/data_ingestion/train.csv")
    test_dataset = Dataset(namespace=namespace, name="Artifacts/data_ingestion/test.csv")

    # Start Event
    client.emit(
        RunEvent(
            eventType=RunState.START,
            eventTime=datetime.utcnow().isoformat() + "Z",
            run=ingestion_run,
            job=ingestion_job,
            inputs=[raw_dataset],
            producer="sentinelnet_pipeline_producer"
        )
    )

    # Complete Event
    client.emit(
        RunEvent(
            eventType=RunState.COMPLETE,
            eventTime=datetime.utcnow().isoformat() + "Z",
            run=ingestion_run,
            job=ingestion_job,
            inputs=[raw_dataset],
            outputs=[train_dataset, test_dataset],
            producer="sentinelnet_pipeline_producer"
        )
    )
    print("Ingestion lineage registered successfully.")

    # ==========================================
    # 🔍 2. Step 2: Data Validation Lineage
    # ==========================================
    print("Registering Data Validation lineage...")
    validation_job = Job(namespace=namespace, name="data_validation")
    validation_run = Run(runId=str(uuid.uuid4()))
    
    # Outputs are drift report and evidently dashboard
    drift_report = Dataset(namespace=namespace, name="Artifacts/data_validation/drift_report.yaml")
    evidently_html = Dataset(namespace=namespace, name="Artifacts/data_validation/evidently_drift_report.html")

    client.emit(
        RunEvent(
            eventType=RunState.START,
            eventTime=datetime.utcnow().isoformat() + "Z",
            run=validation_run,
            job=validation_job,
            inputs=[train_dataset, test_dataset],
            producer="sentinelnet_pipeline_producer"
        )
    )

    client.emit(
        RunEvent(
            eventType=RunState.COMPLETE,
            eventTime=datetime.utcnow().isoformat() + "Z",
            run=validation_run,
            job=validation_job,
            inputs=[train_dataset, test_dataset],
            outputs=[drift_report, evidently_html],
            producer="sentinelnet_pipeline_producer"
        )
    )
    print("Validation lineage registered successfully.")

    # ==========================================
    # 🏋️ 3. Step 3: Model Training Lineage
    # ==========================================
    print("Registering Model Training lineage...")
    training_job = Job(namespace=namespace, name="model_training")
    training_run = Run(runId=str(uuid.uuid4()))
    
    # Output is final trained model saved in model registry (MLflow)
    trained_model = Dataset(namespace=namespace, name="final_model/model.pkl")

    client.emit(
        RunEvent(
            eventType=RunState.START,
            eventTime=datetime.utcnow().isoformat() + "Z",
            run=training_run,
            job=training_job,
            inputs=[train_dataset],
            producer="sentinelnet_pipeline_producer"
        )
    )

    client.emit(
        RunEvent(
            eventType=RunState.COMPLETE,
            eventTime=datetime.utcnow().isoformat() + "Z",
            run=training_run,
            job=training_job,
            inputs=[train_dataset],
            outputs=[trained_model],
            producer="sentinelnet_pipeline_producer"
        )
    )
    print("Model Training lineage registered successfully.")
    print("\n✅ All SentinelNet data lineage maps successfully registered to Marquez!")

if __name__ == "__main__":
    try:
        track_sentinel_lineage()
    except Exception as e:
        print(f"\n⚠️ Lineage emission failed: {e}")
        print("Note: Ensure you have started the Marquez server via Docker Compose first!")
