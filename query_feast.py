import pandas as pd
from datetime import datetime
from feast import FeatureStore

def query_feast_features():
    # Initialize the Feature Store using the local configuration path
    print("Connecting to Feast Feature Store...")
    store = FeatureStore(repo_path="D:/PROGRAMMING/PROJECTS/NetworkSecurity/feature_store")

    # ==========================================
    # 🧪 1. Offline Feature Retrieval (For Training)
    # ==========================================
    print("\n--- 1. OFFLINE FEATURE RETRIEVAL (Historical Data) ---")
    entity_df = pd.DataFrame(
        {
            "domain_id": [10, 50, 100],
            "event_timestamp": [
                datetime(2026, 5, 17, 12, 0, 0),
                datetime(2026, 5, 17, 12, 0, 0),
                datetime(2026, 5, 17, 12, 0, 0),
            ],
        }
    )
    
    # Request features from Feast
    training_df = store.get_historical_features(
        entity_df=entity_df,
        features=[
            "phishing_features:having_IP_Address",
            "phishing_features:URL_Length",
            "phishing_features:SSLfinal_State",
            "phishing_features:Result"
        ]
    ).to_df()
    
    print("Historical training features retrieved successfully:")
    print(training_df)

    # ==========================================
    # ⚡ 2. Online Feature Serving (For Production Inference)
    # ==========================================
    print("\n--- 2. ONLINE FEATURE SERVING (Sub-millisecond Real-time serving) ---")
    
    # First, let's load/materialize data from our parquet file into the SQLite online store database
    print("Materializing data from Parquet store to SQLite online store...")
    store.materialize(
        start_date=datetime(2026, 5, 16),
        end_date=datetime(2026, 5, 18)
    )
    
    # Define entities to request feature vectors for
    entity_rows = [
        {"domain_id": 10},
        {"domain_id": 100}
    ]
    
    # Fetch feature vectors in real time
    online_features = store.get_online_features(
        features=[
            "phishing_features:having_IP_Address",
            "phishing_features:URL_Length",
            "phishing_features:SSLfinal_State"
        ],
        entity_rows=entity_rows
    ).to_dict()
    
    print("Real-time online feature vectors retrieved successfully:")
    for i in range(len(entity_rows)):
        domain = entity_rows[i]["domain_id"]
        ip = online_features["having_IP_Address"][i]
        length = online_features["URL_Length"][i]
        ssl = online_features["SSLfinal_State"][i]
        print(f"Domain ID: {domain} -> having_IP_Address: {ip}, URL_Length: {length}, SSLfinal_State: {ssl}")

if __name__ == "__main__":
    query_feast_features()
