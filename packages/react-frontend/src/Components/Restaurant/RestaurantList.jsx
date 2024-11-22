import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Cards from "../Cards";
import "../../Styles/App.scss";
import campusMarketImage from "../../assets/campus_market.jpg";
import logo from "../../Assets/logo.png";

const colors = ["https://s.yimg.com/ny/api/res/1.2/vC5pSQw7jTnl4vNgBKFjwg--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTM2MA--/https://media.zenfs.com/en/aol_san_luis_obispo_tribune_mcclatchy_563/bbd69ec93b79b04c540e2d46f584b139",
 "https://www.asi.calpoly.edu/wp-content/uploads/2020/01/megaMenu_facilities.jpg",
  "#https://ssgse.com/ssg/wp-content/uploads/SSG-CalPoly-CampusMktUU-3-1024x541.jpg",
   "#https://www.calpoly.edu/sites/calpoly.edu/files/styles/width_345px/public/2020-10/News_2020_vista-grande_header.jpg?itok=AAbJOuFs",
    "#https://www.calpolyconferences.org/wp-content/uploads/2017/03/pcvbanner-672x280.jpg",
     "https://pbs.twimg.com/media/F8FxD3ZXoAABKBm?format=jpg&name=4096x4096",
      "#https://cdnassets.hw.net/dims4/GG/979e18c/2147483647/thumbnail/300x200%3E/quality/90/?url=https%3A%2F%2Fcdnassets.hw.net%2F7e%2F52%2F6e7713a047e4a1ee6447c99e4aae%2F0d0f27881b1a447f830d6468e9c1c1e0.jpg",
       "https://www.sundt.com/wp-content/uploads/2019/07/CalPolyComplete.jpg",
        "https://ceng.calpoly.edu/wp-content/uploads/2024/04/Dexter-Lawn-Students.png"];


const RestaurantList = ({ API_PREFIX, addAuthHeader }) => {
  const { complexId } = useParams();
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetch(`${API_PREFIX}/complexes/${complexId}/restaurants`, {
      headers: addAuthHeader()
    })
      .then((res) => (res.status === 200 ? res.json() : undefined))
      .then((json) => setRestaurants(json ? json.restaurants_list : []))
      .catch((error) => console.log(error));
  }, [complexId, API_PREFIX, addAuthHeader]);

  return (
    <div>
      <div className="top-image">
        <img src={logo} alt="Top Banner" />
      </div>
      <h2>Restaurants</h2>
      <div className="card-container">
      {restaurants.map((restaurant, index) => (
        <Cards
          key={index} 
          color={colors[index % colors.length] || campusMarketImage}  // Fallback to campusMarketImage
          title={restaurant.name}
          link={`/restaurant/${restaurant._id}`}          // Link to each item’s unique page
        />
      ))}
    </div>
    </div>
  );
};

export default RestaurantList;
