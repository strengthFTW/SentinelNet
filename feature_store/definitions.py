from datetime import timedelta
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
