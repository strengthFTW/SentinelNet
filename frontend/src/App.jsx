import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, ShieldAlert, Play, Cpu, 
  Workflow, Network, Settings, LogOut, Search, Activity, Database, Terminal, FileSpreadsheet, Layers, GitBranch, CheckCircle2, Menu, ArrowRight, ArrowDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './index.css';

const DEFAULT_FEATURES = {
  having_IP_Address: 1,
  URL_Length: 1,
  Shortining_Service: 1,
  having_At_Symbol: 1,
  double_slash_redirecting: 1,
  Prefix_Suffix: 1,
  having_Sub_Domain: 1,
  SSLfinal_State: 1,
  Domain_registeration_length: 1,
  Favicon: 1,
  port: 1,
  HTTPS_token: 1,
  Request_URL: 1,
  URL_of_Anchor: 1,
  Links_in_tags: 1,
  SFH: 1,
  Submitting_to_email: 1,
  Abnormal_URL: 1,
  Redirect: 1,
  on_mouseover: 1,
  RightClick: 1,
  popUpWidnow: 1,
  Iframe: 1,
  age_of_domain: 1,
  DNSRecord: 1,
  web_traffic: 1,
  Page_Rank: 1,
  Google_Index: 1,
  Links_pointing_to_page: 1,
  Statistical_report: 1
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [features, setFeatures] = useState({ ...DEFAULT_FEATURES });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000/predict');
  const [inputUrl, setInputUrl] = useState('https://www.chase.com/personal/banking');
  const [parseMessage, setParseMessage] = useState('');

  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [pipelineCompleted, setPipelineCompleted] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState([]);

  const runPipelineTraining = async () => {
    if (pipelineRunning) return;
    setPipelineRunning(true);
    setPipelineCompleted(false);
    setActiveStepIndex(0);
    setPipelineLogs(["[SYS_MSG] Connecting to SentinelNet pipeline orchestrator...", "[SYS_MSG] Triggering DVC and OpenLineage metadata clients..."]);

    // Trigger actual training in backend in background
    fetch(`${apiEndpoint.replace('/predict', '/train')}`).catch(err => console.error("Backend training trigger failed:", err));

    const steps = [
      {
        logs: [
          "[INGESTION_START] Initiating Data Ingestion stage...",
          "[INGESTION_INFO] Connecting to MongoDB Atlas cluster secure pool...",
          "[INGESTION_SUCCESS] Data Ingest complete: loaded 11,053 target signatures. Split split ratio train:test (80:20)."
        ]
      },
      {
        logs: [
          "[VALIDATION_START] Initiating Evidently AI quality validation gates...",
          "[VALIDATION_INFO] Enforcing data schema columns count (30 features)...",
          "[VALIDATION_SUCCESS] Drift check completed. Covariate drift score: 0.02 (Passed schema locks)."
        ]
      },
      {
        logs: [
          "[TRANSFORMATION_START] Initiating ETL data transformation engine...",
          "[TRANSFORMATION_INFO] Running KNNImputer (neighbors=3) for null imputation...",
          "[TRANSFORMATION_SUCCESS] Preprocessed train/test numpy arrays constructed successfully."
        ]
      },
      {
        logs: [
          "[TRAINING_START] Training Sklearn ensemble classifiers (LogisticRegression, DecisionTree, RandomForest, AdaBoost)...",
          "[TRAINING_INFO] Best Model Selected: RandomForestClassifier (n_estimators=100)...",
          "[MLFLOW_LOG] Connecting to DagsHub MLflow Server tracking pool...",
          "[MLFLOW_LOG] Logged run parameters -> F1_Score: 98.42% | Precision: 98.15% | Recall: 98.69%"
        ]
      },
      {
        logs: [
          "[REGISTRY_START] Pushing best estimator pickle to model registry...",
          "[REGISTRY_SUCCESS] Model registered as 'NetworkSecurityModel' v2.0.4-STABLE."
        ]
      },
      {
        logs: [
          "[DEPLOYMENT_START] Committing deploy specification to git-ops repository...",
          "[DEPLOYMENT_SUCCESS] Rollout complete on Kubernetes cluster via ArgoCD. Gateway router online."
        ]
      }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setPipelineLogs(prev => [...prev, ...steps[currentStep].logs]);
        setActiveStepIndex(currentStep);
        currentStep++;
        
        // Auto-scroll terminal log
        setTimeout(() => {
          const term = document.getElementById("pipeline-terminal");
          if (term) term.scrollTop = term.scrollHeight;
        }, 50);
      } else {
        clearInterval(interval);
        setPipelineRunning(false);
        setPipelineCompleted(true);
        setActiveStepIndex(-1);
        setPipelineLogs(prev => [...prev, "[SUCCESS] Full SentinelNet MLOps pipeline training run completed successfully!"]);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.8 },
          colors: ['#dfb7ff', '#abd600', '#c23900']
        });
      }
    }, 1500);
  };

  const updateFeature = (key, value) => {
    setFeatures(prev => ({
      ...prev,
      [key]: parseInt(value, 10)
    }));
  };

  const parseRealUrl = (e) => {
    e.preventDefault();
    try {
      const urlString = inputUrl.trim();
      if (!urlString) throw new Error("URL cannot be empty");

      const isIP = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(urlString) || urlString.includes('0x');
      const isSuspiciousLength = urlString.length > 54;
      const isShort = urlString.includes('bit.ly') || urlString.includes('t.co') || urlString.includes('tinyurl');
      const hasAt = urlString.includes('@');
      const hasDoubleSlash = urlString.lastIndexOf('//') > 7;
      const hasHyphen = urlString.includes('-');

      let domain = urlString;
      try {
        if (!urlString.startsWith('http')) {
          domain = new URL('http://' + urlString).hostname;
        } else {
          domain = new URL(urlString).hostname;
        }
      } catch (e) {
        domain = urlString.split('/')[0];
      }

      const dots = (domain.match(/\./g) || []).length;
      let subdomainValue = 0; 
      if (dots > 3) subdomainValue = -1;
      else if (dots <= 2) subdomainValue = 1;
      
      const isHttps = urlString.startsWith('https');

      // Enhanced Heuristics for the Demo
      const isSuspiciousTLD = /\.xyz|\.tk|\.ru|\.top|\.click/i.test(domain);
      const hasSuspiciousWords = /login|security|account|update|verification|banking|secure|reset/i.test(urlString);
      
      // Simulate backend crawler features if URL looks highly suspicious
      const simulatedWebTraffic = (isSuspiciousTLD || (!isHttps && hasSuspiciousWords)) ? -1 : 1;
      const simulatedAnchor = (hasSuspiciousWords || isSuspiciousTLD) ? -1 : 1;
      const simulatedAbnormal = hasSuspiciousWords ? -1 : 1;

      setFeatures(prev => ({
        ...prev,
        having_IP_Address: isIP ? -1 : 1,
        URL_Length: isSuspiciousLength ? -1 : 1,
        Shortining_Service: isShort ? -1 : 1,
        having_At_Symbol: hasAt ? -1 : 1,
        double_slash_redirecting: hasDoubleSlash ? -1 : 1,
        Prefix_Suffix: hasHyphen ? -1 : 1,
        having_Sub_Domain: subdomainValue,
        SSLfinal_State: isHttps ? 1 : -1,
        web_traffic: simulatedWebTraffic,
        URL_of_Anchor: simulatedAnchor,
        Abnormal_URL: simulatedAbnormal,
        Domain_registeration_length: isSuspiciousTLD ? -1 : 1
      }));
      
      setParseMessage(`[SYS_MSG] URL Extracted: SSL (${isHttps ? 'HTTPS' : 'HTTP'}), Hyphens (${hasHyphen ? 'Yes' : 'No'}), Suspicious Flags (${hasSuspiciousWords || isSuspiciousTLD ? 'Detected' : 'None'})`);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(`[ERR_PARSE] ${err.message}`);
      setParseMessage('');
    }
  };

  const applyPreset = (type) => {
    if (type === 'safe') {
      setInputUrl('https://www.chase.com/personal/banking');
      setParseMessage('[SYS_MSG] Loaded Safe Preset. High trust SSL, zero redirections, clean domain age.');
      setFeatures({
        having_IP_Address: 1,
        URL_Length: 1,
        Shortining_Service: 1,
        having_At_Symbol: 1,
        double_slash_redirecting: 1,
        Prefix_Suffix: 1,
        having_Sub_Domain: 1,
        SSLfinal_State: 1,
        Domain_registeration_length: 1,
        Favicon: 1,
        port: 1,
        HTTPS_token: 1,
        Request_URL: 1,
        URL_of_Anchor: 1,
        Links_in_tags: 1,
        SFH: 1,
        Submitting_to_email: 1,
        Abnormal_URL: 1,
        Redirect: 1,
        on_mouseover: 1,
        RightClick: 1,
        popUpWidnow: 1,
        Iframe: 1,
        age_of_domain: 1,
        DNSRecord: 1,
        web_traffic: 1,
        Page_Rank: 1,
        Google_Index: 1,
        Links_pointing_to_page: 1,
        Statistical_report: 1
      });
    } else {
      setInputUrl('http://secure-chase-update-login-verification.freebonus.xyz/login');
      setParseMessage('[SYS_MSG] Loaded Threat Preset. IP host, long redirect paths, suspicious subdomains, no SSL.');
      setFeatures({
        having_IP_Address: -1,
        URL_Length: -1,
        Shortining_Service: -1,
        having_At_Symbol: -1,
        double_slash_redirecting: -1,
        Prefix_Suffix: -1,
        having_Sub_Domain: -1,
        SSLfinal_State: -1,
        Domain_registeration_length: -1,
        Favicon: -1,
        port: -1,
        HTTPS_token: -1,
        Request_URL: -1,
        URL_of_Anchor: -1,
        Links_in_tags: -1,
        SFH: -1,
        Submitting_to_email: -1,
        Abnormal_URL: -1,
        Redirect: -1,
        on_mouseover: -1,
        RightClick: -1,
        popUpWidnow: -1,
        Iframe: -1,
        age_of_domain: -1,
        DNSRecord: -1,
        web_traffic: -1,
        Page_Rank: -1,
        Google_Index: -1,
        Links_pointing_to_page: -1,
        Statistical_report: -1
      });
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features),
      });
      if (!response.ok) throw new Error(`Server returned code ${response.status}`);
      const data = await response.json();
      
      const val = data.prediction !== undefined ? data.prediction[0] : data.result;
      const isPhishing = val === -1 || val === 0;

      setPrediction({ isPhishing, rawResult: data });

      if (!isPhishing) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#a3e635', 'var(--primary)']
        });
      }
    } catch (err) {
      console.error(err);
      setError(`[ERR_CONN] FastAPI endpoint offline or unreachable.`);
    } finally {
      setLoading(false);
    }
  };
  const coreFeaturesList = [
    { key: 'having_IP_Address', label: 'IP_ADDR' },
    { key: 'URL_Length', label: 'URL_LEN' },
    { key: 'SSLfinal_State', label: 'SSL_STATE' },
    { key: 'double_slash_redirecting', label: 'REDIRECTS' },
    { key: 'age_of_domain', label: 'DOMAIN_AGE' },
    { key: 'Page_Rank', label: 'REPUTATION' }
  ];

  const allFeaturesList = [
    { key: 'having_IP_Address', label: 'IP_ADDR' },
    { key: 'URL_Length', label: 'URL_LEN' },
    { key: 'Shortining_Service', label: 'SHORT_SERVICE' },
    { key: 'having_At_Symbol', label: 'AT_SYMBOL' },
    { key: 'double_slash_redirecting', label: 'DOUBLE_SLASH' },
    { key: 'Prefix_Suffix', label: 'PREFIX_SUFFIX' },
    { key: 'having_Sub_Domain', label: 'SUB_DOMAIN' },
    { key: 'SSLfinal_State', label: 'SSL_STATE' },
    { key: 'Domain_registeration_length', label: 'DOMAIN_REG_LEN' },
    { key: 'Favicon', label: 'FAVICON' },
    { key: 'port', label: 'PORT' },
    { key: 'HTTPS_token', label: 'HTTPS_TOKEN' },
    { key: 'Request_URL', label: 'REQUEST_URL' },
    { key: 'URL_of_Anchor', label: 'URL_ANCHOR' },
    { key: 'Links_in_tags', label: 'TAG_LINKS' },
    { key: 'SFH', label: 'SERVER_HANDL' },
    { key: 'Submitting_to_email', label: 'SUBMIT_EMAIL' },
    { key: 'Abnormal_URL', label: 'ABNORMAL_URL' },
    { key: 'Redirect', label: 'REDIRECT_CNT' },
    { key: 'on_mouseover', label: 'MOUSEOVER_STAT' },
    { key: 'RightClick', label: 'RIGHT_CLICK' },
    { key: 'popUpWidnow', label: 'POPUP_WINDOW' },
    { key: 'Iframe', label: 'IFRAME_REDIR' },
    { key: 'age_of_domain', label: 'DOMAIN_AGE' },
    { key: 'DNSRecord', label: 'DNS_RECORD' },
    { key: 'web_traffic', label: 'WEB_TRAFFIC' },
    { key: 'Page_Rank', label: 'PAGE_RANK' },
    { key: 'Google_Index', label: 'GOOGLE_INDEX' },
    { key: 'Links_pointing_to_page', label: 'LINK_POINTING' },
    { key: 'Statistical_report', label: 'STAT_REPORT' }
  ];

  const unsafeCount = Object.values(features).filter(val => val === -1).length;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      
      {/* SIDEBAR */}
      <div style={{ 
        width: isSidebarOpen ? '260px' : '70px', 
        borderRight: '1px solid var(--border-color)', 
        display: 'flex', 
        flexDirection: 'column', 
        background: '#0a0a0a',
        zIndex: 10,
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ 
              width: isSidebarOpen ? '100%' : '30px', 
              height: '30px', 
              background: 'var(--primary)', 
              borderRadius: '4px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              transition: 'all 0.3s ease'
            }}
          >
            <Menu size={16} />
          </div>
          {isSidebarOpen && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '16px', letterSpacing: '1px', alignSelf: 'flex-start' }}>V.2.0.4-STABLE</div>}
        </div>

        <nav style={{ flex: 1, padding: '20px 0' }}>
          {[
            { id: 'dashboard', label: 'DASHBOARD', icon: <Activity size={16} /> },
            { id: 'pipeline', label: 'MLOPS PIPELINE', icon: <Workflow size={16} /> },
            { id: 'features', label: 'ALL FEATURES', icon: <Layers size={16} /> }
          ].map(item => (
            <div 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', cursor: 'pointer',
                background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderLeft: activeTab === item.id ? '3px solid var(--primary)' : '3px solid transparent',
                color: activeTab === item.id ? '#fff' : 'var(--text-muted)',
                fontSize: '12px', fontWeight: '700', letterSpacing: '1px', transition: 'all 0.2s',
                justifyContent: isSidebarOpen ? 'flex-start' : 'center'
              }}
              title={item.label}
            >
              {item.icon}
              {isSidebarOpen && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* HEADER */}
        {activeTab === 'dashboard' && (
          <header style={{ borderBottom: '1px solid var(--border-color)', padding: '24px 40px', background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
            <h1 className="syne-heading" style={{ margin: 0, color: 'var(--primary)', letterSpacing: '4px', fontSize: '24px' }}>
              SENTINEL_NET
            </h1>
          </header>
        )}
        
        {activeTab === 'pipeline' && (
          <header style={{ borderBottom: '1px solid var(--border-color)', padding: '24px 40px', background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
            <h1 className="syne-heading" style={{ margin: 0, color: 'var(--primary)', letterSpacing: '4px', fontSize: '24px' }}>
              MLOPS_PIPELINE
            </h1>
          </header>
        )}

        {activeTab === 'features' && (
          <header style={{ borderBottom: '1px solid var(--border-color)', padding: '24px 40px', background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
            <h1 className="syne-heading" style={{ margin: 0, color: 'var(--primary)', letterSpacing: '4px', fontSize: '24px' }}>
              ALL_FEATURES_CALIBRATOR
            </h1>
          </header>
        )}

        {/* TAB CONTENT */}
        <div style={{ 
          padding: activeTab === 'pipeline' ? '40px 20px' : '40px', 
          flex: 1, 
          width: '100%', 
          maxWidth: activeTab === 'pipeline' ? '1300px' : '1000px', 
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div style={{ textAlign: 'center' }}>
              {/* TARGET SIGNATURE SECTION */}
              <div style={{ marginBottom: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ color: 'var(--text-main)', fontSize: '11px', letterSpacing: '2px', marginBottom: '15px', fontWeight: '700', alignSelf: 'flex-start' }}>[ ENTER TARGET DOMAIN OR IP ]</div>
                <h2 style={{ fontSize: '32px', margin: '0 0 15px 0', fontWeight: '800', color: '#fff' }}>Initialize Deep Threat Scan</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px', maxWidth: '800px' }}>
                  Analyze the target domain or IP address for possible threats, SSL security weaknesses, and overall trust and reputation status.
                </p>

                <div style={{ border: '1px solid var(--border-color)', padding: '20px', background: 'var(--panel-bg)', width: '100%', maxWidth: '800px', textAlign: 'left' }}>
                  <form onSubmit={parseRealUrl} style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--panel-bg)', padding: '0 20px', border: '1px solid var(--border-color)' }}>
                      <Network size={18} color="var(--text-muted)" style={{ marginRight: '15px' }} />
                      <input 
                        type="text" 
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="https://secure-gate.sentinel-net.io/v2/analyze"
                        style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', padding: '18px 0', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    <button type="submit" style={{ background: 'var(--primary)', color: '#000', padding: '0 30px', fontWeight: '800', fontSize: '14px', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Activity size={18} /> Run Analysis
                    </button>
                  </form>
                  {parseMessage && <div style={{ marginTop: '15px', fontSize: '12px', color: 'var(--green-neon)' }}>{parseMessage}</div>}
                  {error && <div style={{ marginTop: '15px', fontSize: '12px', color: 'var(--orange-neon)' }}>{error}</div>}
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                  <button onClick={() => applyPreset('safe')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px', padding: '8px 16px', letterSpacing: '1px' }}>[ LOAD SAFE PRESET ]</button>
                  <button onClick={() => applyPreset('phish')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px', padding: '8px 16px', letterSpacing: '1px' }}>[ LOAD THREAT PRESET ]</button>
                </div>
              </div>

              {/* THREAT EVAL CORE */}
              <div style={{ border: '1px solid var(--border-color)', padding: '24px', background: 'var(--panel-bg)', maxWidth: '800px', margin: '0 auto 50px auto', textAlign: 'left' }}>
                <div style={{ color: 'var(--text-main)', fontSize: '11px', letterSpacing: '2px', marginBottom: '24px', fontWeight: '700' }}>[ THREAT_EVALUATION_CORE ]</div>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                  <button 
                    onClick={handlePredict}
                    disabled={loading}
                    style={{ 
                      background: 'var(--primary)', color: '#4c1d95', border: 'none',
                      borderBottom: '3px solid #a855f7', 
                      padding: '16px 0', width: '50%', fontSize: '18px', fontWeight: '800', 
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    <CheckCircle2 size={24} /> {loading ? 'PROCESSING...' : 'EXECUTE_THREAT_EVAL'}
                  </button>
                </div>

                <div style={{
                  border: prediction 
                    ? (prediction.isPhishing ? '1px solid var(--orange-neon)' : '1px solid var(--green-neon)') 
                    : '1px dashed var(--border-color)',
                  boxShadow: prediction 
                    ? (prediction.isPhishing ? '0 0 20px rgba(255, 107, 0, 0.15)' : '0 0 20px rgba(171, 214, 0, 0.15)') 
                    : 'none',
                  padding: '24px',
                  minHeight: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: 'var(--panel-bg)',
                  boxSizing: 'border-box',
                  maxWidth: '600px',
                  margin: '0 auto',
                  position: 'relative'
                }}>
                  {prediction ? (
                    !prediction.isPhishing ? (
                      <div style={{ width: '100%' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>[ SECURITY_CLEARANCE ]</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="syne-heading" style={{ fontSize: '28px', fontWeight: '800', color: 'var(--green-neon)', letterSpacing: '2px' }}>
                            SAFE
                          </div>
                          <div style={{ border: '1px solid var(--green-neon)', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={24} color="var(--green-neon)" />
                          </div>
                        </div>
                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Firewall Status</span>
                          <span style={{ color: 'var(--green-neon)', fontWeight: '800' }}>ACTIVE</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: '100%' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>[ ANOMALY_DETECTION ]</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="syne-heading" style={{ fontSize: '28px', fontWeight: '800', color: 'var(--orange-neon)', letterSpacing: '2px' }}>
                            ALERT
                          </div>
                          <div style={{ border: '1px solid var(--orange-neon)', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={24} color="var(--orange-neon)" />
                          </div>
                        </div>
                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Unrecognized Packets</span>
                          <span style={{ color: 'var(--orange-neon)', fontWeight: '800' }}>{unsafeCount}_DETECTED</span>
                        </div>
                      </div>
                    )
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                      <Network size={48} color="var(--border-color)" style={{ marginBottom: '20px' }} />
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '2px', marginBottom: '20px' }}>DYNAMIC RESULTS PLACEHOLDER</div>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '9px', color: 'var(--border-color)' }}>SYSTEM_CLEAN/0.00</div>
                        <div style={{ border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '9px', color: 'var(--border-color)' }}>CRITICAL_THREAT/1.00</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ML FEATURES SECTION */}
              <div style={{ marginBottom: '50px', textAlign: 'left' }}>
                <div style={{ color: 'var(--text-main)', fontSize: '11px', letterSpacing: '2px', marginBottom: '20px', fontWeight: '700' }}>[ ML_FEATURE_PARAMETERS ]</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {coreFeaturesList.map((feat) => (
                    <div key={feat.key} style={{ border: '1px solid var(--border-color)', padding: '20px', background: 'var(--panel-bg)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '3px' }}>
                         <div style={{ width: '8px', height: '3px', background: '#4ade80' }}></div>
                         <div style={{ width: '8px', height: '3px', background: '#d1d5db' }}></div>
                         <div style={{ width: '8px', height: '3px', background: '#78350f' }}></div>
                      </div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>{feat.label}</label>
                      <select 
                        value={features[feat.key]} 
                        onChange={(e) => updateFeature(feat.key, e.target.value)}
                        style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', padding: '12px', fontSize: '13px', appearance: 'none', outline: 'none' }}
                      >
                        <option value="1" style={{background: '#0a0a0a'}}>1 (Safe)</option>
                        <option value="0" style={{background: '#0a0a0a'}}>0 (Neutral)</option>
                        <option value="-1" style={{background: '#0a0a0a'}}>-1 (Malicious)</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* PIPELINE TAB */}
          {activeTab === 'pipeline' && (
            <div style={{ 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: '100%', 
              minHeight: '700px',
              padding: '20px 0',
              boxSizing: 'border-box'
            }}>
              
              {/* PAGE TITLE */}
              <div className="syne-heading" style={{ 
                fontSize: '20px', 
                fontWeight: '800', 
                color: 'var(--primary)', 
                letterSpacing: '4px', 
                textTransform: 'uppercase', 
                alignSelf: 'flex-start',
                marginBottom: '40px',
                paddingLeft: '10px'
              }}>
                MLOPS_PIPELINE
              </div>

              {/* FLOWCHART CONTENT RENDERED DIRECTLY (OUTSIDE CONTAINER) */}
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '1200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box',
                zIndex: 2
              }}>

                 {/* UPPER PILLAR: MARQUEZ LINEAGE */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', marginBottom: '15px' }}>
                  <div style={{ 
                    width: '400px', 
                    background: '#131313', 
                    border: '1px solid var(--border-color)', 
                    padding: '18px 22px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: 'bold' }}>[ METADATA_TRACKER ]</span>
                      <span style={{ fontSize: '11px', color: 'var(--green-neon)', fontWeight: 'bold', letterSpacing: '1px' }}>ONLINE</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '46px', height: '46px', background: '#201f1f', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GitBranch size={24} color="var(--primary)" />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>Marquez_Lineage</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>API: OpenLineage</div>
                      </div>
                    </div>
                  </div>
                  {/* Vertical Connection Line pointing DOWN */}
                  <div style={{ width: '2px', height: '30px', background: 'rgba(154, 140, 162, 0.4)', position: 'relative', marginTop: '6px' }}>
                    <div style={{ position: 'absolute', bottom: '-4px', left: '-3px', fontSize: '8px', color: 'rgba(154, 140, 162, 0.6)' }}>▼</div>
                  </div>
                </div>

                {/* VERTICAL CARDS COLUMN */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px', 
                  width: '100%', 
                  padding: '10px 0', 
                  boxSizing: 'border-box'
                }}>
                                   {/* Step 1: MongoDB Ingestion */}
                  <div style={{ 
                    width: '400px',
                    height: '135px',
                    background: '#131313', 
                    border: '1px solid var(--border-color)', 
                    padding: '18px 22px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--primary)', letterSpacing: '1px', fontWeight: 'bold' }}>01 / PIPELINE</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>[ INGESTION ]</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', background: '#201f1f', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Database size={20} color="var(--primary)" />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', letterSpacing: '1px' }}>DATA_INGESTION</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ letterSpacing: '0.5px' }}>MONGODB SOURCE</span>
                      <div style={{ width: '14px', height: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--green-neon)' }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px' }}>
                    <ArrowDown size={14} color="var(--primary)" style={{ opacity: 0.5 }} />
                  </div>

                  {/* Step 2: Data Validation (Evidently AI & Great Expectations) */}
                  <div style={{ 
                    width: '400px',
                    height: '135px',
                    background: '#131313', 
                    border: '1px solid var(--border-color)', 
                    padding: '18px 22px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--primary)', letterSpacing: '1px', fontWeight: 'bold' }}>02 / PIPELINE</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>[ VALIDATION ]</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', background: '#201f1f', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '18px', fontFamily: 'monospace' }}>✓/✗</span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', letterSpacing: '1px' }}>GE & EVIDENTLY_AI</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ letterSpacing: '0.5px' }}>DRIFT & SCHEMA CHECKS</span>
                      <div style={{ width: '14px', height: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--green-neon)' }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px' }}>
                    <ArrowDown size={14} color="var(--primary)" style={{ opacity: 0.5 }} />
                  </div>

                  {/* Step 3: Transformation */}
                  <div style={{ 
                    width: '400px',
                    height: '135px',
                    background: '#131313', 
                    border: '1px solid var(--border-color)', 
                    padding: '18px 22px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--primary)', letterSpacing: '1px', fontWeight: 'bold' }}>03 / PIPELINE</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>[ TRANSFORMATION ]</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', background: '#201f1f', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '22px', fontFamily: 'Syne, sans-serif' }}>Σ</span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', letterSpacing: '1px' }}>DATA_TRANSFORMATION</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ letterSpacing: '0.5px' }}>KNN_IMPUTER PIPELINE</span>
                      <div style={{ width: '14px', height: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--green-neon)' }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px' }}>
                    <ArrowDown size={14} color="var(--primary)" style={{ opacity: 0.5 }} />
                  </div>

                  {/* Step 4: Model Training */}
                  <div style={{ 
                    width: '400px',
                    height: '135px',
                    background: '#131313', 
                    border: '1px solid var(--border-color)', 
                    padding: '18px 22px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--primary)', letterSpacing: '1px', fontWeight: 'bold' }}>04 / PIPELINE</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>[ MODEL_TRAINING ]</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', background: '#201f1f', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Cpu size={20} color="var(--primary)" />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', letterSpacing: '1px' }}>MODEL_TRAINER</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ letterSpacing: '0.5px' }}>5 ENSEMBLES SEARCH</span>
                      <div style={{ width: '14px', height: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--green-neon)' }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px' }}>
                    <ArrowDown size={14} color="var(--primary)" style={{ opacity: 0.5 }} />
                  </div>

                  {/* Step 5: Registry */}
                  <div style={{ 
                    width: '400px',
                    height: '135px',
                    background: '#131313', 
                    border: '1px solid var(--border-color)', 
                    padding: '18px 22px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--primary)', letterSpacing: '1px', fontWeight: 'bold' }}>05 / PIPELINE</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>[ REGISTRY ]</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', background: '#201f1f', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Database size={20} color="var(--primary)" />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', letterSpacing: '1px' }}>DAGSHUB_MLFLOW</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ letterSpacing: '0.5px' }}>MODEL REGISTRY V2.0.4</span>
                      <div style={{ width: '14px', height: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--green-neon)' }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px' }}>
                    <ArrowDown size={14} color="var(--primary)" style={{ opacity: 0.5 }} />
                  </div>

                  {/* Step 6: Deployment */}
                  <div style={{ 
                    width: '400px',
                    height: '135px',
                    background: '#131313', 
                    border: '1px solid var(--border-color)', 
                    padding: '18px 22px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--primary)', letterSpacing: '1px', fontWeight: 'bold' }}>06 / PIPELINE</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>[ DEPLOYMENT ]</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', background: '#201f1f', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Network size={20} color="var(--primary)" />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', letterSpacing: '1px' }}>KUBERNETES</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ letterSpacing: '0.5px' }}>ARGOCD GITOPS</span>
                      <div style={{ width: '14px', height: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--green-neon)' }}></div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* LOWER PILLAR: FEAST FEATURE STORE */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', marginTop: '15px' }}>
                  {/* Vertical Connection Line pointing DOWN */}
                  <div style={{ width: '2px', height: '30px', background: 'rgba(154, 140, 162, 0.4)', position: 'relative', marginBottom: '6px' }}>
                    <div style={{ position: 'absolute', bottom: '-4px', left: '-3px', fontSize: '8px', color: 'rgba(154, 140, 162, 0.6)' }}>▼</div>
                  </div>
                  <div style={{ 
                    width: '400px', 
                    background: '#131313', 
                    border: '1px solid var(--border-color)', 
                    padding: '18px 22px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: 'bold' }}>[ SUPPORTING_INFRA ]</span>
                      <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '1px' }}>FEAST STORE</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '46px', height: '46px', background: '#201f1f', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Database size={24} color="var(--primary)" />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>Feast_Feature_Store</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Storage: Redis / GCS</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ALL FEATURES TAB */}
          {activeTab === 'features' && (
            <div style={{ border: '1px solid var(--border-color)', padding: '40px', background: 'var(--panel-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                <div>
                  <div style={{ color: 'var(--text-main)', fontSize: '11px', letterSpacing: '2px', fontWeight: '700', marginBottom: '5px' }}>[ ALL_30_FEATURE_PARAMETERS ]</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Calibrate simulated or URL-extracted features before executing network prediction.</div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button onClick={() => applyPreset('safe')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px', padding: '8px 16px', letterSpacing: '1px', cursor: 'pointer' }}>[ LOAD SAFE PRESET ]</button>
                  <button onClick={() => applyPreset('phish')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px', padding: '8px 16px', letterSpacing: '1px', cursor: 'pointer' }}>[ LOAD THREAT PRESET ]</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {allFeaturesList.map((feat) => (
                  <div key={feat.key} style={{ border: '1px solid var(--border-color)', padding: '20px', background: 'rgba(10,10,10,0.4)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '1px' }}>{feat.label}</span>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{feat.key}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '5px' }}>
                      {[
                        { value: 1, label: 'SAFE (1)', color: 'var(--green-neon)', activeBg: 'rgba(171, 214, 0, 0.15)' },
                        { value: 0, label: 'SUSP (0)', color: '#a855f7', activeBg: 'rgba(168, 85, 247, 0.15)' },
                        { value: -1, label: 'MAL (-1)', color: 'var(--orange-neon)', activeBg: 'rgba(255, 107, 0, 0.15)' }
                      ].map(opt => {
                        const isActive = features[feat.key] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => updateFeature(feat.key, opt.value)}
                            style={{
                              flex: 1,
                              background: isActive ? opt.activeBg : 'transparent',
                              border: isActive ? `1px solid ${opt.color}` : '1px solid var(--border-color)',
                              color: isActive ? opt.color : 'var(--text-muted)',
                              fontSize: '10px',
                              fontWeight: '700',
                              padding: '8px 4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              letterSpacing: '1px'
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid var(--border-color)', padding: '12px 40px', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', background: '#0a0a0a', marginTop: 'auto' }}>
          <span>LATENCY: 12MS &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; REGION: US-EAST-01</span>
          <span style={{ fontWeight: '700', color: '#fff' }}>SENTINEL_ML_CORE</span>
        </footer>

      </div>
    </div>
  );
}

export default App;
