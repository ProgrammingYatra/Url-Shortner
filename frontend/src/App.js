import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [longUrl, setlongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const ShortUrl = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:8000/url/shorten", { longUrl })
      .then((res) => {
        setShortUrl(res.data.data.shortUrl);
        console.log(res.data.data);
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
    console.log(longUrl);
  };

  useEffect(() => {});

  return (
    <>
      <div className="container">
        <form onSubmit={ShortUrl}>
          <h1>Make Your URL Short</h1>
          <input
            className="form-control"
            placeholder="Enter Your Long Url"
            value={longUrl}
            onChange={(e) => setlongUrl(e.target.value)}
          />
          <input className="btn btn-dark" type="submit" />
          <br />
          <input defaultValue={shortUrl} />
        </form>
      </div>
    </>
  );
}

export default App;
