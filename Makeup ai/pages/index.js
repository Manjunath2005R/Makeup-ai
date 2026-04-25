import Head from 'next/head';
import { useMemo, useRef, useState } from 'react';
import {
  Camera,
  ChefHat,
  Droplets,
  Gem,
  Heart,
  Loader2,
  Quote,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wand2
} from 'lucide-react';

const tabs = [
  { id: 'beauty', label: 'Beauty AI', icon: Sparkles },
  { id: 'menu', label: 'Recipe Menu', icon: ChefHat },
  { id: 'caption', label: 'Captions', icon: Quote }
];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Shell({ activeTab, setActiveTab, children }) {
  return (
    <div className="appShell">
      <header className="topbar">
        <button className="brandMark" onClick={() => setActiveTab('home')} aria-label="Go home">
          <span className="brandIcon"><Gem size={18} /></span>
          <span>
            <strong>Spoorthi Beauty AI</strong>
            <small>Created with admiration</small>
          </span>
        </button>

        <nav className="navTabs" aria-label="App navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'navTab active' : 'navTab'}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={17} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>
      {children}
    </div>
  );
}

function Landing({ onStart }) {
  return (
    <main className="hero">
      <img className="heroImage" src="/assets/spoorthi-beauty-hero.png" alt="Premium beauty-tech vanity scene" />
      <div className="heroVeil" />
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, index) => <span key={index} />)}
      </div>

      <section className="heroContent">
        <p className="eyebrow"><Heart size={16} /> Created with admiration for Spoorthi</p>
        <h1>Spoorthi, Your Beauty is Beyond Measure ✨</h1>
        <p className="heroCopy">
          A warm AI beauty experience made to celebrate confidence, grace, glow,
          and the rare presence that makes you unforgettable.
        </p>
        <div className="heroActions">
          <button className="primaryButton large" onClick={onStart}>
            <Sparkles size={19} />
            Start Your Beauty Journey
          </button>
          <span className="heroNote">Because true beauty deserves celebration</span>
        </div>
        <div className="heroPreviewStrip" aria-label="Experience highlights">
          <span><Sparkles size={16} /> Beauty glow</span>
          <span><ChefHat size={16} /> Comfort menu</span>
          <span><Quote size={16} /> Poetic captions</span>
        </div>
      </section>
    </main>
  );
}

function UploadPanel({ title, subtitle, image, onImage, compact = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await fileToDataUrl(file);
    onImage(dataUrl);
  }

  return (
    <section
      className={dragging ? 'uploadPanel dragging' : 'uploadPanel'}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFile(event.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        className="hiddenInput"
        type="file"
        accept="image/*"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <div className={compact ? 'uploadGrid compact' : 'uploadGrid'}>
        <div className="uploadCopy">
          <span className="sectionIcon"><UploadCloud size={18} /></span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <button className="secondaryButton" onClick={() => inputRef.current?.click()}>
            <Camera size={17} />
            Choose Image
          </button>
        </div>
        <button className="previewFrame" onClick={() => inputRef.current?.click()} aria-label="Choose image">
          {image ? <img src={image} alt="Uploaded preview" /> : (
            <span>
              <UploadCloud size={38} />
              Drop a face image here
            </span>
          )}
        </button>
      </div>
    </section>
  );
}

function BeautyAnalyzer() {
  const [image, setImage] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  async function runAnalysis() {
    if (!image) return;
    setLoading(true);
    setNotice('');
    try {
      const response = await fetch('/api/beauty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: image })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Analysis failed.');
      setAnalysis(data.analysis);
      setNotice(data.setupRequired ? data.message : '');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  const scoreStyle = useMemo(() => ({
    background: `conic-gradient(#c28a34 ${analysis?.beautyScore || 0}%, rgba(255,255,255,.24) 0)`
  }), [analysis]);

  return (
    <main className="workspace">
      <section className="introBand">
        <p className="eyebrow"><Sparkles size={16} /> AI Face Beauty Analyzer</p>
        <h1>Spoorthi, your presence itself is beautiful</h1>
        <p>
          Upload a photo to receive a graceful beauty score, warm appreciation,
          refined skincare guidance, and elegant confidence notes.
        </p>
      </section>

      <UploadPanel
        title="Upload a glowing portrait"
        subtitle="Choose a clear face image and let the experience celebrate beauty with care."
        image={image}
        onImage={(value) => {
          setImage(value);
          setAnalysis(null);
          setNotice('');
        }}
      />

      <div className="actionRow">
        <button className="primaryButton" disabled={!image || loading} onClick={runAnalysis}>
          {loading ? <Loader2 className="spin" size={18} /> : <Wand2 size={18} />}
          {loading ? 'Analyzing Glow' : 'Analyze Beauty'}
        </button>
        {notice && <span className="softNotice">{notice}</span>}
      </div>

      {analysis && (
        <section className="analysisGrid">
          <article className="scorePanel">
            <div className="scoreRing" style={scoreStyle}>
              <div>
                <strong>{analysis.beautyScore}</strong>
                <span>/100</span>
              </div>
            </div>
            <h2>Beauty Score ✨</h2>
            <p>{analysis.summary}</p>
          </article>

          <article className="resultPanel">
            <span className="sectionIcon"><Heart size={18} /></span>
            <h2>Beauty Appreciation</h2>
            <ul className="softList">
              {analysis.compliments.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>

          <article className="resultPanel">
            <span className="sectionIcon"><Droplets size={18} /></span>
            <h2>Skin Care Tips</h2>
            <ul className="softList">
              {analysis.skincareTips.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>

          <article className="resultPanel">
            <span className="sectionIcon"><ShieldCheck size={18} /></span>
            <h2>Elegant Comparisons</h2>
            <ul className="softList">
              {analysis.comparisons.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}

function RecipeMenu() {
  const [category, setCategory] = useState('South');
  const [recipe, setRecipe] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  async function generateRecipe() {
    setLoading(true);
    setNotice('');
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, avoidList: history })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Recipe failed.');
      setRecipe(data.recipe);
      setHistory((items) => [data.recipe.name, ...items].slice(0, 12));
      setNotice(data.setupRequired ? data.message : '');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="workspace">
      <section className="introBand warm">
        <p className="eyebrow"><ChefHat size={16} /> Recipe Menu</p>
        <h1>Comfort, care, and something lovely for Spoorthi</h1>
        <p>A graceful food companion for warm evenings, thoughtful cravings, and simple joy.</p>
      </section>

      <section className="toolBand">
        <div className="segmented">
          {['North', 'South', 'Snacks'].map((item) => (
            <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>
        <button className="primaryButton" onClick={generateRecipe} disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : <ChefHat size={18} />}
          {loading ? 'Curating Menu' : 'Create Recipe'}
        </button>
        {notice && <span className="softNotice">{notice}</span>}
      </section>

      {recipe && (
        <section className="recipeLayout">
          <article className="recipeHero">
            <p className="eyebrow">{recipe.region}</p>
            <h2>{recipe.name}</h2>
            <p>{recipe.description}</p>
            <div className="metaPills">
              <span>{recipe.serves}</span>
              <span>{recipe.prepTime}</span>
              <span>{recipe.cookTime}</span>
            </div>
          </article>
          <article className="resultPanel">
            <h2>Ingredients</h2>
            <ul className="softList">
              {recipe.ingredients.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <article className="resultPanel wide">
            <h2>Method</h2>
            <ol className="stepsList">
              {recipe.steps.map((item) => <li key={item}>{item}</li>)}
            </ol>
            <p className="tipLine"><Sparkles size={16} /> {recipe.tip}</p>
          </article>
        </section>
      )}
    </main>
  );
}

function CaptionGenerator() {
  const [image, setImage] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  async function generateCaption(regenerate = false) {
    if (!image) return;
    setLoading(true);
    setNotice('');
    try {
      const response = await fetch('/api/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: image, regenerate, avoid: caption })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Caption failed.');
      setCaption(data.caption);
      setNotice(data.setupRequired ? data.message : '');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="workspace">
      <section className="introBand plum">
        <p className="eyebrow"><Quote size={16} /> Caption Generator</p>
        <h1>Words that make Spoorthi's moments feel cinematic</h1>
        <p>One polished line for moments that deserve to feel remembered.</p>
      </section>

      <UploadPanel
        compact
        title="Upload a moment"
        subtitle="Choose any image and let the caption oracle write one polished line."
        image={image}
        onImage={(value) => {
          setImage(value);
          setCaption('');
          setNotice('');
        }}
      />

      <div className="actionRow">
        <button className="primaryButton" disabled={!image || loading} onClick={() => generateCaption(Boolean(caption))}>
          {loading ? <Loader2 className="spin" size={18} /> : caption ? <RefreshCw size={18} /> : <Wand2 size={18} />}
          {caption ? 'Regenerate Caption' : 'Generate Caption'}
        </button>
        {notice && <span className="softNotice">{notice}</span>}
      </div>

      {caption && (
        <section className="captionResult">
          <Quote size={30} />
          <p>{caption}</p>
          <span>For Spoorthi, with warmth and admiration</span>
        </section>
      )}
    </main>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <>
      <Head>
        <title>Spoorthi Beauty AI</title>
        <meta
          name="description"
          content="A premium AI beauty analysis, caption, and recipe app created with admiration for Spoorthi."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'home' && <Landing onStart={() => setActiveTab('beauty')} />}
        {activeTab === 'beauty' && <BeautyAnalyzer />}
        {activeTab === 'menu' && <RecipeMenu />}
        {activeTab === 'caption' && <CaptionGenerator />}
      </Shell>
    </>
  );
}
