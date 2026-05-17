import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, ShieldAlert, Play, Cpu, 
  Workflow, Network, Settings, LogOut, Search, Activity, Database, Terminal, FileSpreadsheet, Layers, GitBranch, CheckCircle2
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
          colors: ['#a3e635', '#d8b4fe']
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
        background: '#0a0a0a',
        zIndex: 10
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="michroma" style={{ color: '#d8b4fe', fontSize: '18px', margin: '0', letterSpacing: '2px' }}>
            SENTINEL_NET
          </h2>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', letterSpacing: '1px' }}>V.2.0.4-STABLE</div>
        </div>

        <nav style={{ flex: 1, padding: '20px 0' }}>
          {[
            { id: 'dashboard', label: 'DASHBOARD', icon: <Activity size={16} /> },
            { id: 'pipeline', label: 'MLOPS PIPELINE', icon: <Workflow size={16} /> },
            { id: 'lineage', label: 'DATA LINEAGE', icon: <Database size={16} /> }
          ].map(item => (
            <div 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', cursor: 'pointer',
                background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderLeft: activeTab === item.id ? '3px solid #d8b4fe' : '3px solid transparent',
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
        {activeTab === 'dashboard' && (
          <header style={{ borderBottom: '1px solid var(--border-color)', padding: '24px 40px', background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
            <h1 className="michroma" style={{ margin: 0, color: '#d8b4fe', letterSpacing: '4px', fontSize: '24px' }}>
              SCANNER_MODULE
            </h1>
          </header>
        )}
        
        {activeTab === 'pipeline' && (
          <header style={{ borderBottom: '1px solid var(--border-color)', padding: '24px 40px', background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
            <h1 className="michroma" style={{ margin: 0, color: '#d8b4fe', letterSpacing: '4px', fontSize: '24px' }}>
              MLOPS_PIPELINE
            </h1>
          </header>
        )}

        {activeTab === 'lineage' && (
          <header style={{ borderBottom: '1px solid var(--border-color)', padding: '24px 40px', background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
            <h1 className="michroma" style={{ margin: 0, color: '#d8b4fe', letterSpacing: '4px', fontSize: '24px' }}>
              DATA_LINEAGE
            </h1>
          </header>
        )}

        {/* TAB CONTENT */}
        <div style={{ padding: '40px', flex: 1, maxWidth: '1000px' }}>
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div>
              {/* TARGET SIGNATURE SECTION */}
              <div style={{ marginBottom: '50px' }}>
                <div style={{ color: 'var(--text-main)', fontSize: '11px', letterSpacing: '2px', marginBottom: '15px', fontWeight: '700' }}>[ ENTER TARGET SIGNATURE ]</div>
                <h2 style={{ fontSize: '32px', margin: '0 0 15px 0', fontWeight: '800', color: '#fff' }}>Initialize Network Deep-Scan</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px', maxWidth: '800px' }}>
                  Deploy the Sentinel heuristic engine to identify vulnerabilities, SSL integrity, and reputation metrics for the specified domain or IP address.
                </p>

                <div style={{ border: '1px solid var(--border-color)', padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                  <form onSubmit={parseRealUrl} style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#050505', padding: '0 20px', border: '1px solid var(--border-color)' }}>
                      <Network size={18} color="var(--text-muted)" style={{ marginRight: '15px' }} />
                      <input 
                        type="text" 
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="https://secure-gate.sentinel-net.io/v2/analyze"
                        style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', padding: '18px 0', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    <button type="submit" style={{ background: '#d8b4fe', color: '#000', padding: '0 30px', fontWeight: '800', fontSize: '14px', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
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

              {/* ML FEATURES SECTION */}
              <div style={{ marginBottom: '50px' }}>
                <div style={{ color: 'var(--text-main)', fontSize: '11px', letterSpacing: '2px', marginBottom: '20px', fontWeight: '700' }}>[ ML_FEATURE_PARAMETERS ]</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {coreFeaturesList.map((feat) => (
                    <div key={feat.key} style={{ border: '1px solid var(--border-color)', padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
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

              {/* THREAT EVAL CORE */}
              <div style={{ border: '1px solid var(--border-color)', padding: '40px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ color: 'var(--text-main)', fontSize: '11px', letterSpacing: '2px', marginBottom: '30px', fontWeight: '700' }}>[ THREAT_EVALUATION_CORE ]</div>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                  <button 
                    onClick={handlePredict}
                    disabled={loading}
                    style={{ 
                      background: '#d8b4fe', color: '#000', border: 'none', 
                      padding: '20px 0', width: '60%', fontSize: '20px', fontWeight: '800', 
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    <CheckCircle2 size={24} /> {loading ? 'PROCESSING...' : 'EXECUTE_THREAT_EVAL'}
                  </button>
                </div>

                <div style={{ border: '1px dashed var(--border-color)', padding: '40px', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  {prediction ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', color: prediction.isPhishing ? 'var(--orange-neon)' : 'var(--green-neon)', marginBottom: '15px', letterSpacing: '2px' }}>
                        {prediction.isPhishing ? '[NODE_MALICIOUS]' : '[NODE_SECURE]'}
                      </div>
                      <h2 className={prediction.isPhishing ? 'glow-text-orange' : 'glow-text-green'} style={{ fontSize: '42px', margin: '0 0 10px 0', color: prediction.isPhishing ? 'var(--orange-neon)' : 'var(--green-neon)', fontWeight: '800' }}>
                        {prediction.isPhishing ? 'CRITICAL_THREAT' : 'SYSTEM_CLEAN'}
                      </h2>
                      <div className={prediction.isPhishing ? 'glow-text-orange' : 'glow-text-green'} style={{ fontSize: '32px', fontWeight: '800', color: prediction.isPhishing ? 'var(--orange-neon)' : 'var(--green-neon)' }}>
                        / {prediction.isPhishing ? '1.00' : '0.00'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <Network size={48} color="var(--border-color)" style={{ marginBottom: '20px' }} />
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '2px' }}>DYNAMIC RESULTS PLACEHOLDER</div>
                    </>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* PIPELINE TAB */}
          {activeTab === 'pipeline' && (
            <div style={{ border: '1px solid var(--border-color)', padding: '40px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ color: 'var(--text-main)', fontSize: '11px', letterSpacing: '2px', marginBottom: '30px', fontWeight: '700' }}>[ MLOPS_PIPELINE_ARCHITECTURE ]</div>
              <div style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.6' }}>
                <h3 style={{ color: '#d8b4fe' }}>SYSTEM COMPONENTS</h3>
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
            <div style={{ border: '1px solid var(--border-color)', padding: '40px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ color: 'var(--text-main)', fontSize: '11px', letterSpacing: '2px', marginBottom: '30px', fontWeight: '700' }}>[ DATA_LINEAGE_GRAPH ]</div>
              <div style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.6' }}>
                 <h3 style={{ color: '#d8b4fe' }}>OPENLINEAGE // MARQUEZ REGISTRY</h3>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '30px' }}>
                    <div style={{ border: '1px solid var(--border-color)', padding: '20px', textAlign: 'center' }}>[JOB_01_INGEST]</div>
                    <div style={{ color: '#d8b4fe' }}>➔</div>
                    <div style={{ border: '1px solid var(--border-color)', padding: '20px', textAlign: 'center' }}>[JOB_02_VALIDATE]</div>
                    <div style={{ color: '#d8b4fe' }}>➔</div>
                    <div style={{ border: '1px solid var(--border-color)', padding: '20px', textAlign: 'center' }}>[JOB_03_TRAIN]</div>
                 </div>
                 <p style={{ marginTop: '40px', color: 'var(--text-muted)', fontSize: '12px' }}>[SYS_LOG] Tracked events pushed to Marquez backend.</p>
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
