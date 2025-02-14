// latestDrops.jsx
import React from "react";

const LatestDrops = () => {
  return (
    <div>
      <h2>Latest Drops</h2> <br></br>
      <h5>Brought to you by: Steven Armstrong</h5>
      <ul>
        <li>
          Air Jordan 5 <br />
          "Black Metallic" <br />
          SNKRS <br />
          2/12/2025
        </li>
        <br />
        <li>
          Air Jordan 1 Low <br />
          "Game Royal" <br />
          SNKRS <br />
          12/4/2024
        </li>
        <br />
        <li>
          New Balance <br />
          "Action Bronson" <br />
          NB <br />
          11/23/2024
        </li>
        <br />
        <li>
          Adidas Gazelle <br />
          "Bad Bunny" <br />
          <a
            href="https://Adidas.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Adidas.com
          </a>{" "}
          {/* Added target="_blank" and rel="noopener noreferrer" */}
          <br />
          10/31/2024
        </li>
        <br />
        <li>
          Air Jordan 1 <br />
          "Black Toe Reimagined" <br />
          SNKRS <br></br>
          2/14/2025
        </li>
        <br />
      </ul>
    </div>
  );
};

export default LatestDrops;
