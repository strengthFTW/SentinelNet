import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  GitBranch, 
  Settings, 
  Activity, 
  Database, 
  Workflow, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  FileSpreadsheet,
  Network,
  Cpu,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Core 30 Features of SentinelNet
const FEATURE_LABELS = {
  having_IP_Address: "IP Address in URL",
  URL_Length: "URL Length",
  Shortining_Service: "URL Shortening Service",
  having_At_Symbol: "At Symbol (@)",
  double_slash_redirecting: "Double Slash Redirect (//)",
  Prefix_Suffix: "Prefix/Suffix in Domain (-)",
  having_Sub_Domain: "Sub-Domain Presence",
  SSLfinal_State: "SSL Final State (HTTPS)",
  Domain_registeration_length: "Domain Registration Length",
  Favicon: "Favicon Loaded Ext",
  port: "Non-standard Port",
  HTTPS_token: "HTTPS Token in URL",
  Request_URL: "Request URL Source",
  URL_of_Anchor: "Anchor URL Source",
  Links_in_tags: "Links in Meta Tags",
  SFH: "Server Form Handler (SFH)",
  Submitting_to_email: "Submit to Email",
  Abnormal_URL: "Abnormal URL Structure",
  Redirect: "Redirect Count",
  on_mouseover: "On Mouseover Status Alert",
  RightClick: "Right Click Disabled",
  popUpWidnow: "Pop-up Window Status",
  Iframe: "Iframe Redirection",
  age_of_domain: "Age of Domain",
  DNSRecord: "DNS Record Status",
  web_traffic: "Web Traffic Rank",
  Page_Rank: "Page Rank Value",
  Google_Index: "Google Search Indexed",
  Links_pointing_to_page: "Links Pointing to Page",
  Statistical_report: "Statistical Report Presence"
};

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
  Redirect: 0,
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
  const [features, setFeatures] = useState({ ...DEFAULT_FEATURES });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000/predict');
  
  // Real-world URL parser states
  const [inputUrl, setInputUrl] = useState('https://www.chase.com/personal/banking');
  const [parseMessage, setParseMessage] = useState('');

  // Quick feature updater
  const updateFeature = (key, value) => {
    setFeatures(prev => ({
      ...prev,
      [key]: parseInt(value)
    }));
  };

  // Real-world URL feature extraction logic
  const parseRealUrl = () => {
    if (!inputUrl) {
      setError("Please enter a valid website URL first.");
      return;
    }
    
    try {
      let cleanUrl = inputUrl.trim();
      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'http://' + cleanUrl;
      }
      
      const parsed = new URL(cleanUrl);
      const hostname = parsed.hostname;
      const urlString = parsed.href;
      
      // 1. IP Address
      const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
      
      // 2. URL Length (Phishing usually > 54 chars)
      const isSuspiciousLength = urlString.length > 54;
      
      // 3. Shortening Services
      const isShort = /bit\.ly|tinyurl|t\.co|goo\.gl|rebrand\.ly|tiny\.cc|is\.gd|cli\.gs|yfrog\.com|migre\.me|ff\.im|tiny\.one/.test(hostname);
      
      // 4. @ symbol
      const hasAt = urlString.includes('@');
      
      // 5. Double Slash Redirecting (beyond the protocol)
      const hasDoubleSlash = urlString.lastIndexOf('//') > 7;
      
      // 6. Prefix-Suffix (Hyphen in domain)
      const hasHyphen = hostname.includes('-');
      
      // 7. Subdomains (checks number of dot separations)
      const dots = hostname.split('.').filter(Boolean).length;
      let subdomainValue = 0; // Neutral
      if (dots > 3) {
        subdomainValue = -1; // Malicious (Too many subdomains)
      } else if (dots <= 2) {
        subdomainValue = 1; // Safe
      }
      
      // 8. SSL Final State (HTTPS vs HTTP)
      const isHttps = urlString.startsWith('https');

      // Populate features state!
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
      }));
      
      setParseMessage(`✅ URL Analyzed! Extracted 8 core features: SSL (${isHttps ? 'HTTPS' : 'HTTP'}), Hyphens (${hasHyphen ? 'Yes' : 'No'}), Length (${urlString.length} chars). Selectors have been auto-configured below!`);
      setError(null);
      
      // Flash confetti for successful parse
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.8 }
      });
      
    } catch (err) {
      console.error(err);
      setError(`Failed to parse URL: ${err.message}. Please enter a valid format, e.g., google.com or http://phish-login.net`);
      setParseMessage('');
    }
  };

  // Set preset templates for testing
  const applyPreset = (type) => {
    if (type === 'safe') {
      setInputUrl('https://www.chase.com/personal/banking');
      setParseMessage('');
      setFeatures({
        ...DEFAULT_FEATURES,
        SSLfinal_State: 1,
        Prefix_Suffix: 1,
        URL_of_Anchor: 1,
        having_Sub_Domain: -1,
        web_traffic: 1,
      });
    } else {
      setInputUrl('http://secure-chase-update-login-verification.temp-host.net');
      setParseMessage('');
      setFeatures({
        ...DEFAULT_FEATURES,
        SSLfinal_State: -1,
        Prefix_Suffix: -1,
        URL_of_Anchor: -1,
        having_Sub_Domain: 1,
        web_traffic: -1,
      });
    }
  };

  // Perform prediction POST request to FastAPI server
  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Map React state values into standard model parameters payload
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(features),
      });

      if (!response.ok) {
        throw new Error(`Server returned code ${response.status}`);
      }

      const data = await response.json();
      
      // Assume output is standard { 'prediction': [0] } or { 'result': 1 } or similar based on backend model trainer
      // SentinelNet prediction output value: 1 = Phishing, 0 or -1 = Safe
      const val = data.prediction !== undefined ? data.prediction[0] : data.result;
      const isPhishing = val === -1 || val === 0;



      setPrediction({
        isPhishing,
        rawResult: data
      });

      // Confetti burst on safe prediction!
      if (!isPhishing) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#8b5cf6']
        });
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to connect to FastAPI endpoint: ${err.message}. Please check if app.py is running locally!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 16px', boxSizing: 'border-box' }}>
      {/* HEADER HERO SECTION */}
      <header className="animate-slideup" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(139, 92, 246, 0.15)', padding: '8px 16px', borderRadius: '30px', border: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: '16px' }}>
          <ShieldCheck size={20} color="#8b5cf6" />
          <span style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#c084fc' }}>
            SentinelNet MLOps Core Platform
          </span>
        </div>
        <h1 style={{ fontSize: '42px', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-1px', background: 'linear-gradient(to right, #f3f4f6, #8b5cf6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Real-time Network Phishing Sentinel
        </h1>
        <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '0 auto', fontSize: '16px', lineHeight: '1.5' }}>
          Enterprise machine learning serving architecture utilizing full DVC dataset versioning, Feast offline/online stores, Great Expectations validation, and Evidently AI drift diagnostics.
        </p>
      </header>



      {/* MAIN CONTAINER CONTENT */}
      <main className="animate-slideup" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', backdropFilter: 'blur(16px)', padding: '32px', boxSizing: 'border-box' }}>
        
        {/* ==========================================
            🔮 REAL-TIME PREDICTOR
            ========================================== */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
              
              {/* Endpoint Settings */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <Settings size={20} color="#8b5cf6" />
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '4px' }}>
                    FASTAPI SERVING PREDICTION ENDPOINT
                  </label>
                  <input 
                    type="text" 
                    value={apiEndpoint} 
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f3f4f6', padding: '6px 12px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => applyPreset('safe')}
                    style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Preset Safe URL
                  </button>
                  <button 
                    onClick={() => applyPreset('phish')}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Preset Phishing
                  </button>
                </div>
              </div>

              {/* REAL-WORLD INTERACTIVE URL PARSER */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(139, 92, 246, 0.04)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#c084fc', fontWeight: '700', letterSpacing: '0.5px' }}>
                  ⚡ TEST ANY REAL-WORLD WEBSITE URL (FEATURE EXTRACTOR)
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="text" 
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Paste website address here, e.g., http://my-secure-bank-login.com/login.html"
                    style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', color: '#f3f4f6', padding: '10px 16px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                  <button 
                    type="button"
                    onClick={parseRealUrl}
                    style={{ background: 'linear-gradient(to right, #8b5cf6, #3b82f6)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)' }}
                  >
                    Extract website Features
                  </button>
                </div>
                {parseMessage && (
                  <div style={{ color: '#10b981', fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>
                    {parseMessage}
                  </div>
                )}
              </div>


              {/* Form Grid */}
              <form onSubmit={handlePredict}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  {/* Curated list of most critical features shown by default */}
                  {Object.keys(DEFAULT_FEATURES)
                    .filter((key, idx) => showAdvanced || idx < 8)
                    .map(key => (
                      <div key={key} style={{ background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#f3f4f6', marginBottom: '8px' }}>
                          {FEATURE_LABELS[key]}
                        </label>
                        <select
                          value={features[key]}
                          onChange={(e) => updateFeature(key, e.target.value)}
                          style={{
                            width: '100%',
                            background: '#1a1b23',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#f3f4f6',
                            padding: '8px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="1">1 (Safe / True)</option>
                          <option value="0">0 (Neutral / Unknown)</option>
                          <option value="-1">-1 (Malicious / False)</option>
                        </select>
                      </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{ background: 'none', border: 'none', color: '#8b5cf6', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    {showAdvanced ? "Show Less Features" : "Configure Advanced Model Features (All 30)"}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(to right, #8b5cf6, #10b981)',
                      color: '#f3f4f6',
                      border: 'none',
                      padding: '14px 32px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '16px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    <Play size={18} fill="#f3f4f6" />
                    {loading ? "Analyzing..." : "Evaluate Domain Security"}
                  </button>
                </div>
              </form>
            </div>

            {/* PREDICTION RESULTS PANEL */}
            {prediction && (
              <div 
                className="animate-slideup" 
                style={{ 
                  background: prediction.isPhishing ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)', 
                  border: prediction.isPhishing ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)', 
                  borderRadius: '16px', 
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  boxShadow: prediction.isPhishing ? '0 0 20px rgba(239, 68, 68, 0.1)' : '0 0 20px rgba(16, 185, 129, 0.1)'
                }}
              >
                <div style={{ background: prediction.isPhishing ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', padding: '16px', borderRadius: '50%' }}>
                  {prediction.isPhishing ? (
                    <ShieldAlert size={48} color="#ef4444" />
                  ) : (
                    <ShieldCheck size={48} color="#10b981" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'inline-flex', background: prediction.isPhishing ? '#ef4444' : '#10b981', color: '#fff', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px' }}>
                    {prediction.isPhishing ? "PHISHING DETECTED" : "VERIFIED SAFE"}
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0', color: '#f3f4f6' }}>
                    {prediction.isPhishing ? "High Risk Cyber Threat Alert!" : "Domain Structure Is Clean"}
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.4' }}>
                    {prediction.isPhishing 
                      ? "The evaluated link profile exhibits anomalies strongly correlated with credential theft pages and DNS record spoofing. Do not supply user input."
                      : "The evaluated domain parameters are highly verified and aligned with premium, trusted internet certificates. Safe to load."
                    }
                  </p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: '10px', color: '#9ca3af', fontWeight: '700' }}>MODEL SCORE</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'monospace', color: prediction.isPhishing ? '#ef4444' : '#10b981' }}>
                    {prediction.isPhishing ? "1.00" : "0.00"}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div 
                className="animate-slideup" 
                style={{ 
                  background: 'rgba(239, 68, 68, 0.05)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#fca5a5',
                  fontSize: '14px'
                }}
              >
                <AlertTriangle size={20} color="#ef4444" />
                <span>{error}</span>
              </div>
            )}
          </div>

      </main>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', marginTop: '48px', paddingBottom: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
        <p style={{ color: '#4b5563', fontSize: '13px' }}>
          SentinelNet Network Security Pipeline &copy; 2026. Built with Vite, ReactJS, FastAPI, and Scikit-Learn.
        </p>
      </footer>
    </div>
  );
}

export default App;
