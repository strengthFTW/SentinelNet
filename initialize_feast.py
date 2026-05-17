import os
import pandas as pd
import numpy as np

def init_feast():
    # 1. Create Feast Directories
    os.makedirs("feature_store/data", exist_ok=True)
    
    # 2. Convert raw CSV to Feast-compatible Parquet format
    raw_data_path = "Network_Data/phisingData.csv"
    print(f"Reading raw data from {raw_data_path}...")
    df = pd.read_csv(raw_data_path)
    
    # Add unique identifier 'domain_id'
    df["domain_id"] = np.arange(len(df))
    
    # Feast strictly requires an event timestamp column for point-in-time joins
    df["event_timestamp"] = pd.Timestamp.now()
    
    # Save as parquet
    parquet_path = "feature_store/data/phishing_features.parquet"
    df.to_parquet(parquet_path, index=False)
    print(f"Feast offline data store saved to: {parquet_path}")

    # 3. Create feature_store.yaml
    feast_config = """project: network_security
registry: data/registry.db
provider: local
online_store:
  type: sqlite
  path: data/online_store.db
"""
    with open("feature_store/feature_store.yaml", "w") as f:
        f.write(feast_config)
    print("Feast feature_store.yaml generated.")

    # 4. Create definitions.py
    definitions_code = """from datetime import timedelta
from feast import (
    Entity,
    Field,
    FeatureView,
    FileSource,
    ValueType,
)
from feast.types import Int64, Float32

# Declare offline Parquet data source
phishing_source = FileSource(
    name="phishing_source",
    path="D:/PROGRAMMING/PROJECTS/NetworkSecurity/feature_store/data/phishing_features.parquet",
    event_timestamp_column="event_timestamp",
)

# Define our Domain Entity
domain_entity = Entity(
    name="domain_id",
    value_type=ValueType.INT64,
    description="Unique identifier for network domains being analyzed for phishing.",
)

# Map all 30 security features to a Feast Feature View
phishing_feature_view = FeatureView(
    name="phishing_features",
    entities=[domain_entity],
    ttl=timedelta(days=365),
    schema=[
        Field(name="having_IP_Address", dtype=Int64),
        Field(name="URL_Length", dtype=Int64),
        Field(name="Shortining_Service", dtype=Int64),
        Field(name="having_At_Symbol", dtype=Int64),
        Field(name="double_slash_redirecting", dtype=Int64),
        Field(name="Prefix_Suffix", dtype=Int64),
        Field(name="having_Sub_Domain", dtype=Int64),
        Field(name="SSLfinal_State", dtype=Int64),
        Field(name="Domain_registeration_length", dtype=Int64),
        Field(name="Favicon", dtype=Int64),
        Field(name="port", dtype=Int64),
        Field(name="HTTPS_token", dtype=Int64),
        Field(name="Request_URL", dtype=Int64),
        Field(name="URL_of_Anchor", dtype=Int64),
        Field(name="Links_in_tags", dtype=Int64),
        Field(name="SFH", dtype=Int64),
        Field(name="Submitting_to_email", dtype=Int64),
        Field(name="Abnormal_URL", dtype=Int64),
        Field(name="Redirect", dtype=Int64),
        Field(name="on_mouseover", dtype=Int64),
        Field(name="RightClick", dtype=Int64),
        Field(name="popUpWidnow", dtype=Int64),
        Field(name="Iframe", dtype=Int64),
        Field(name="age_of_domain", dtype=Int64),
        Field(name="DNSRecord", dtype=Int64),
        Field(name="web_traffic", dtype=Int64),
        Field(name="Page_Rank", dtype=Int64),
        Field(name="Google_Index", dtype=Int64),
        Field(name="Links_pointing_to_page", dtype=Int64),
        Field(name="Statistical_report", dtype=Int64),
        Field(name="Result", dtype=Int64),
    ],
    online=True,
    source=phishing_source,
)
"""
    with open("feature_store/definitions.py", "w") as f:
        f.write(definitions_code)
    print("Feast definitions.py feature views generated.")

if __name__ == "__main__":
    init_feast()
