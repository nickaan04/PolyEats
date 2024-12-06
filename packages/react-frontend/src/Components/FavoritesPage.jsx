import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Styles/FavoritesPage.scss";
import logo from "../Assets/logo.png";
import "../Styles/App.scss";
import Cards from "./Cards";

// list all of the user's favorite restaurants on a page
const FavoritesPage = ({ API_PREFIX, addAuthHeader }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true); // State to track loading status

  useEffect(() => {
    // Fetch favorite restaurants
    fetch(`${API_PREFIX}/account/favorites`, {
      headers: addAuthHeader()
    })
      .then((res) => res.json())
      .then((data) => {
        setFavorites(data.favorites || []);
        setLoading(false); // Set loading to false once data is fetched
      })
      .catch((error) => {
        console.error("Error fetching favorite restaurants:", error);
        setLoading(false); // Ensure loading is false even if an error occurs
      });
  }, [API_PREFIX, addAuthHeader]);

  // Remove a restaurant from favorites
  const removeFavorite = async (restaurantId) => {
    try {
      const response = await fetch(
        `${API_PREFIX}/account/favorites/${restaurantId}`,
        {
          method: "DELETE",
          headers: addAuthHeader()
        }
      );

      // set favorites with all but removed restaurant
      if (response.ok) {
        setFavorites((prevFavorites) =>
          prevFavorites.filter((restaurant) => restaurant._id !== restaurantId)
        );
        toast.success("Restaurant removed from favorites");
      } else {
        toast.error("Error removing restaurant from favorites");
      }
    } catch (error) {
      console.error("Error removing favorite restaurant:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="favorites-page">
      <div className="top-image">
        {/* display logo at top of page */}
        <img src={logo} alt="Top Banner" />
      </div>
      <h2 className="heading">Favorites</h2>
      <div className="card-container">
        {loading ? (
          <p>Loading favorites...</p>
        ) : favorites.length > 0 ? (
          // iterate through favorite restaurants and display card for each
          favorites.map((restaurant) => (
            <Cards
              key={restaurant._id}
              image={restaurant.image}
              title={restaurant.name}
              link={`/restaurant/${restaurant._id}`}
              removeButton={
                <button
                  className="remove-favorite"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent card link navigation
                    removeFavorite(restaurant._id);
                  }}>
                  &times;
                </button>
              }
            />
          ))
        ) : (
          <p>No favorites yet</p>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
