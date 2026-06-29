import { useState } from 'react'
import './App.css'

const apiKey = import.meta.env.VITE_API_KEY;
const baseUrlAPI = 'https://api.harvardartmuseums.org'


function App() {

  const [currentDiscovery, setCurrentDiscovery] = useState(null)
  const [historyDiscovered, setHistoryDiscovered] = useState([])
  const [banList, setBanList] = useState([])

  function discoverContent() {
    const params = new URLSearchParams({
      apikey: apiKey,
      hasimage: 1,
      title: 1,
      image: 'any',
      sort: 'random'
    });

    console.log(`https://api.harvardartmuseums.org/object?${params}`);

    fetch(`https://api.harvardartmuseums.org/object?${params}`)
      .then(response => response.json())
      .then(data => setCurrentDiscovery(data));

  }

  function moveToBanList(item) {
    setBanList([...banList, item]);
  }
  function removeFromBanList(item) {
    setBanList(banList.filter(i => i !== item));
  }

  function displayContent(content) {

    return (
      <div className="content-discovered">
        <h2> {content ? content.title : 'No content available'} </h2>
        <ul>
          {[content.century, content.classification, content.culture, content.medium].map((item, index) => <button onClick={() => moveToBanList(item)} key={index}>{item}</button>)}
        </ul>
        {/* <img src={content ? content.images[0].baseimageurl : ''} alt="Artwork" /> */}
      </div>)
  }

  function displayBanList() {
    return (
      <div className="banlist">
        <h2>Ban List</h2>
        <p>Items in the ban list will be excluded from future discoveries.</p>
        <ul>
          {banList.map((item, index) => <li key={index}>{<button onClick={() => removeFromBanList(item)}>{item}</button>}</li>)}
        </ul>
      </div>
    );
  }


  return (
    <div className="App">
      <h1>Welcome to the Discover Harvard Art App</h1>
      <section id="HistoryDiscovered">
        <h2>History of Discovered Art</h2>
      </section>
      <section id="Discovery">

        <div id="DiscoveryTitle">
          <h1> Harvard's Art Museums Discovery</h1>
          <p>Explore the rich collection of art at Harvard's museums</p>
        </div>

        <div id="DiscoveryContent">
          {currentDiscovery ? displayContent(currentDiscovery['records'][0]) : <p>No discovery yet</p>}
          {console.log(currentDiscovery)}
        </div>

        <div id="DiscoveryActions">

          <button onClick={() => discoverContent()}> Discover</button>
        </div>

      </section>
      <section id="Banlist">
        {displayBanList()}
      </section>
    </div>
  )
}

export default App
