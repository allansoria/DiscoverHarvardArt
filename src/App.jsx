import { useState } from 'react'
import './App.css'

const apiKey = import.meta.env.VITE_API_KEY;

const BAN_FIELDS = [
  { field: 'century', label: 'Century' },
  { field: 'classification', label: 'Classification' },
  { field: 'culture', label: 'Culture' },
  { field: 'medium', label: 'Medium' },
];

const BATCH_SIZE = 10;
const MAX_BATCH_FETCHES = 3;

function App() {
  const [currentDiscovery, setCurrentDiscovery] = useState(null)
  const [history, setHistory] = useState([])             // [record, ...]  newest first
  const [banList, setBanList] = useState([])             // [{ field, value }]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function matchesBanList(record) {
    return banList.some(({ field, value }) => record[field] === value);
  }

  async function fetchBatch() {
    const params = new URLSearchParams({
      apikey: apiKey,
      hasimage: 1,
      size: BATCH_SIZE,
      sort: 'random',
    });
    const response = await fetch(`https://api.harvardartmuseums.org/object?${params}`);
    const data = await response.json();
    return data.records || [];
  }

  async function discoverContent() {
    setLoading(true);
    setError(null);

    try {
      let found = null;
      for (let attempt = 0; attempt < MAX_BATCH_FETCHES; attempt++) {
        const batch = await fetchBatch();
        if (batch.length === 0) break;
        const available = batch.filter(record => !matchesBanList(record));
        if (available.length > 0) {
          found = available[Math.floor(Math.random() * available.length)];
          break;
        }
      }

      if (found) {
        // Push the current card into history before replacing it
        if (currentDiscovery) setHistory(h => [currentDiscovery, ...h]);
        setCurrentDiscovery(found);
      } else {
        setError('Every card in the last few pulls was on your excluded list. Free up a tag and try again.');
      }
    } catch (err) {
      console.error(err);
      setError("Couldn't pull a card from the stacks. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function isBanned(field, value) {
    return banList.some(b => b.field === field && b.value === value);
  }
  function moveToBanList(field, value) {
    if (!value || isBanned(field, value)) return;
    setBanList([...banList, { field, value }]);
  }
  function removeFromBanList(field, value) {
    setBanList(banList.filter(b => !(b.field === field && b.value === value)));
  }

  function displayContent(content) {
    const attributes = BAN_FIELDS
      .map(({ field, label }) => ({ field, label, value: content[field] }))
      .filter(({ value }) => Boolean(value));

    return (
      <article className="artifact">
        {content.images && content.images[0] && (
          <img className="artifact-image" src={content.images[0].baseimageurl} alt={content.title || 'Artwork'} />
        )}
        <h2 className="artifact-title">{content.title || 'Untitled'}</h2>
        <p className="tags-label">Tags — tap one to exclude it</p>
        <ul className="metadata-row">
          {attributes.map(({ field, label, value }) => (
            <li key={field}>
              <button
                className="tag-button"
                onClick={() => moveToBanList(field, value)}
                disabled={isBanned(field, value)}
              >
                {label}: {value}
              </button>
            </li>
          ))}
        </ul>
      </article>
    )
  }

  function displayBanList() {
    return (
      <section className="tag-tray-section">
        <h2 className="eyebrow">Excluded Tags</h2>
        {banList.length === 0 ? (
          <p className="tag-tray-empty">Nothing excluded yet.</p>
        ) : (
          <ul className="tag-tray">
            {banList.map(({ field, value }) => (
              <li key={`${field}-${value}`} className="tag-stub">
                {value}
                <button onClick={() => removeFromBanList(field, value)} aria-label={`Remove ${value}`}>✕</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  function displayHistory() {
    return (
      <aside className="history-panel">
        <h2 className="eyebrow history-eyebrow">Previously Seen</h2>
        {history.length === 0 ? (
          <p className="history-empty">Cards you've pulled will appear here.</p>
        ) : (
          <ul className="history-list">
            {history.map((record, i) => (
              <li key={`${record.id}-${i}`} className="history-item">
                {record.images && record.images[0] && (
                  <img
                    className="history-thumb"
                    src={record.images[0].baseimageurl}
                    alt={record.title || 'Artwork'}
                  />
                )}
                <div className="history-meta">
                  <p className="history-title">{record.title || 'Untitled'}</p>
                  {record.century && <p className="history-detail">{record.century}</p>}
                  {record.culture && <p className="history-detail">{record.culture}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    );
  }

  return (
    <div className="gallery">
      <header className="gallery-header">
        <p className="eyebrow">Harvard Art Museums — Object Discovery</p>
        <h1 className="gallery-title">Card Catalog</h1>
        <p className="gallery-subtitle">Pull a record at random. Tap any tag to keep that attribute out of future pulls.</p>
      </header>

      <div className="gallery-body">
        <div className="gallery-main">
          <section className="catalog-card" aria-live="polite">
            <span className="punch-hole" aria-hidden="true"></span>
            {error && <p className="catalog-error">{error}</p>}
            {!error && (currentDiscovery ? displayContent(currentDiscovery) : <p className="catalog-empty">No discovery yet — give it a pull.</p>)}
          </section>

          <div className="actions">
            <button className="stamp-button" onClick={discoverContent} disabled={loading}>
              {loading ? 'Pulling…' : 'Discover'}
            </button>
          </div>

          {displayBanList()}
        </div>

        {displayHistory()}
      </div>
    </div>
  )
}

export default App