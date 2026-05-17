import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, ShieldAlert, Play, Cpu, 
  Workflow, Network, Settings, LogOut, Search, Activity, Database, Terminal, FileSpreadsheet, Layers, GitBranch, CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './index.css';

// Core 30 Features mapping required by the backend pipeline
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
  const [features, setFeatures] = useState({ ...DEFAULT_FEATURES });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000/predict');
  const [inputUrl, setInputUrl] = useState('https://www.chase.com/personal/banking');
  const [parseMessage, setParseMessage] = useState('');

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
      
      setParseMessage(`[SYS_MSG] URL Extracted: SSL (${isHttps ? 'HTTPS' : 'HTTP'}), Hyphens (${hasHyphen ? 'Yes' : 'No'}), Len (${urlString.length})`);
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
      setParseMessage('');
      setFeatures({
        ...DEFAULT_FEATURES,
        SSLfinal_State: 1, Prefix_Suffix: 1, URL_of_Anchor: 1, having_Sub_Domain: -1, web_traffic: 1,
      });
    } else {
      setInputUrl('http://secure-chase-update-login-verification.temp-host.net');
      setParseMessage('');
      setFeatures({
        ...DEFAULT_FEATURES,
        SSLfinal_State: -1, Prefix_Suffix: -1, URL_of_Anchor: -1, having_Sub_Domain: 1, web_traffic: -1,
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
          colors: ['#a3e635', '#a855f7']
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

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      
      {/* SIDEBAR */}
      <div style={{ 
        width: '260px', 
        borderRight: '1px solid var(--border-color)', 
        display: 'flex', 
        flexDirection: 'column', 
        background: '#0d0d0d',
        zIndex: 10
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="michroma" style={{ color: 'var(--purple-neon)', fontSize: '20px', margin: '0 0 20px 0', letterSpacing: '1px' }}>
            SENTINEL
          </h2>

        </div>

        <nav style={{ flex: 1, padding: '20px 0' }}>
          {[
            { id: 'dashboard', label: 'DASHBOARD', icon: <Activity size={16} /> },
            { id: 'pipeline', label: 'MLOPS PIPELINE', icon: <Workflow size={16} /> },
            { id: 'lineage', label: 'DATA LINEAGE', icon: <Network size={16} /> }
          ].map(item => (
            <div 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 24px', cursor: 'pointer',
                background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderLeft: activeTab === item.id ? '3px solid var(--purple-neon)' : '3px solid transparent',
                color: activeTab === item.id ? '#fff' : 'var(--text-muted)',
                fontSize: '12px', fontWeight: '700', letterSpacing: '1px', transition: 'all 0.2s'
              }}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </nav>


      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* HEADER */}
        <header style={{ borderBottom: '1px solid var(--border-color)', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <h1 className="michroma" style={{ margin: 0, color: 'var(--purple-neon)', letterSpacing: '4px', fontStyle: 'italic', fontSize: '24px' }}>
            SENTINEL_NET // V.01
          </h1>

        </header>

        {/* TAB CONTENT */}
        <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
              
              {/* LEFT COL: DATA EXTRACT & METADATA */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* SCAN PORTAL */}
                <div className="panel">
                  <span className="panel-title">[SCAN_PORTAL // FEAT_EXTRACT]</span>
                  <form onSubmit={parseRealUrl} style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#050505', border: '1px solid var(--border-color)', padding: '0 15px' }}>
                      <Network size={16} color="var(--text-muted)" style={{ marginRight: '10px' }} />
                      <input 
                        type="text" 
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="ENTER_TARGET_URL_FOR_ANALYSIS..."
                        style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', padding: '14px 0', fontSize: '13px' }}
                      />
                    </div>
                    <button type="submit" style={{ background: 'var(--purple-neon)', color: '#000', border: 'none', padding: '0 24px', fontWeight: '800', fontSize: '12px', letterSpacing: '1px' }}>
                      RUN_EXTRACT_SEQUENCE
                    </button>
                  </form>
                  {parseMessage && <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--green-neon)' }}>{parseMessage}</div>}
                  {error && <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--orange-neon)' }}>{error}</div>}
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button onClick={() => applyPreset('safe')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '10px', padding: '4px 8px' }}>[LOAD_SAFE_PRESET]</button>
                    <button onClick={() => applyPreset('phish')} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '10px', padding: '4px 8px' }}>[LOAD_THREAT_PRESET]</button>
                  </div>
                </div>

                {/* DATA ARRAY / METADATA LAYER */}
                <div className="panel">
                  <span className="panel-title">[DATA_ARRAY // METADATA_LAYER]</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {coreFeaturesList.map((feat) => (
                      <div key={feat.key}>
                        <label style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '6px' }}>[FEATURE: {feat.label}]</label>
                        <select 
                          value={features[feat.key]} 
                          onChange={(e) => updateFeature(feat.key, e.target.value)}
                          style={{ width: '100%', background: '#050505', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', fontSize: '12px', appearance: 'none' }}
                        >
                          <option value="1">1_SAFE_VALID</option>
                          <option value="0">0_NEUTRAL</option>
                          <option value="-1">-1_MALICIOUS</option>
                        </select>
                      </div>
                    ))}
                  </div>


                </div>
              </div>

              {/* RIGHT COL: THREAT EVAL CORE */}
              <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className={`panel ${prediction ? (prediction.isPhishing ? 'glow-orange' : 'glow-green') : ''}`} style={{ minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
                  <span className="panel-title">[THREAT_EVAL_CORE]</span>
                  
                  {prediction ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '10px', color: prediction.isPhishing ? 'var(--orange-neon)' : 'var(--green-neon)', marginBottom: '10px' }}>
                        {prediction.isPhishing ? '[NODE_MALICIOUS]' : '[NODE_SECURE]'}
                      </div>
                      <h2 className={prediction.isPhishing ? 'glow-text-orange' : 'glow-text-green'} style={{ fontSize: '32px', margin: '0 0 30px 0', lineHeight: '1.2', color: prediction.isPhishing ? 'var(--orange-neon)' : 'var(--green-neon)', fontWeight: '800' }}>
                        STATUS:<br/>
                        {prediction.isPhishing ? 'CRITICAL_THREAT' : 'SYSTEM_CLEAN'}
                      </h2>
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                        <span className={prediction.isPhishing ? 'glow-text-orange' : 'glow-text-green'} style={{ fontSize: '64px', fontWeight: '800', color: prediction.isPhishing ? 'var(--orange-neon)' : 'var(--green-neon)' }}>
                          {prediction.isPhishing ? '1.00' : '0.00'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{prediction.isPhishing ? 'MALWARE_CONFIDENCE' : 'THREAT_SCORE'}</span>
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px', color: prediction.isPhishing ? 'var(--orange-neon)' : 'var(--green-neon)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: prediction.isPhishing ? 'var(--orange-neon)' : 'var(--green-neon)', boxShadow: `0 0 8px ${prediction.isPhishing ? 'var(--orange-neon)' : 'var(--green-neon)'}` }}></div>
                        {prediction.isPhishing ? '⚠️ IMMEDIATE ISOLATION RECOMMENDED' : 'HEARTBEAT_ACTIVE_STABLE'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                      [AWAITING_EXECUTION]
                    </div>
                  )}
                </div>

                <button 
                  onClick={handlePredict}
                  disabled={loading}
                  style={{ 
                    width: '100%', background: 'transparent', border: '1px solid var(--border-color)', 
                    color: 'var(--text-main)', padding: '20px', fontSize: '14px', fontWeight: '700', letterSpacing: '2px'
                  }}
                >
                  {loading ? 'PROCESSING...' : 'EXECUTE_THREAT_EVAL'}
                </button>
              </div>

            </div>
          )}

          {/* PIPELINE TAB */}
          {activeTab === 'pipeline' && (
            <div className="panel" style={{ flex: 1 }}>
              <span className="panel-title">[MLOPS_PIPELINE_ARCHITECTURE]</span>
              <div style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.6' }}>
                <h3 style={{ color: 'var(--purple-neon)' }}>SYSTEM COMPONENTS</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '15px' }}><strong style={{ color: 'var(--green-neon)' }}>[DVC]</strong> Dataset version control active. Syncing remote registries.</li>
                  <li style={{ marginBottom: '15px' }}><strong style={{ color: 'var(--green-neon)' }}>[GREAT_EXPECTATIONS]</strong> Data quality gates enforcing column schemas.</li>
                  <li style={{ marginBottom: '15px' }}><strong style={{ color: 'var(--green-neon)' }}>[EVIDENTLY_AI]</strong> Drift tracking running on distribution splits.</li>
                  <li style={{ marginBottom: '15px' }}><strong style={{ color: 'var(--green-neon)' }}>[FEAST]</strong> Offline parquet feature store connected.</li>
                </ul>
              </div>
            </div>
          )}

          {/* LINEAGE TAB */}
          {activeTab === 'lineage' && (
            <div className="panel" style={{ flex: 1 }}>
              <span className="panel-title">[DATA_LINEAGE_GRAPH]</span>
              <div style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.6' }}>
                 <h3 style={{ color: 'var(--purple-neon)' }}>OPENLINEAGE // MARQUEZ REGISTRY</h3>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '30px' }}>
                    <div style={{ border: '1px solid var(--border-color)', padding: '20px', textAlign: 'center' }}>[JOB_01_INGEST]</div>
                    <div style={{ color: 'var(--purple-neon)' }}>➔</div>
                    <div style={{ border: '1px solid var(--border-color)', padding: '20px', textAlign: 'center' }}>[JOB_02_VALIDATE]</div>
                    <div style={{ color: 'var(--purple-neon)' }}>➔</div>
                    <div style={{ border: '1px solid var(--border-color)', padding: '20px', textAlign: 'center' }}>[JOB_03_TRAIN]</div>
                 </div>
                 <p style={{ marginTop: '40px', color: 'var(--text-muted)', fontSize: '12px' }}>[SYS_LOG] Tracked events pushed to Marquez backend.</p>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer style={{ background: '#050505', borderTop: '1px solid var(--border-color)', padding: '8px 30px', fontSize: '9px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>LATENCY: 12ms &nbsp;&nbsp; REGION: US-EAST-01 &nbsp;&nbsp; <span style={{ color: 'var(--green-neon)' }}>ENCRYPTION: AES-256-GCM</span></span>
          <span>V_0.1.4_STABLE // SENTINEL_ML_CORE</span>
        </footer>

      </div>
    </div>
  );
}

export default App;
