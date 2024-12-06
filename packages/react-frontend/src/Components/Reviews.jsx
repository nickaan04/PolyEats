import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "../Styles/Reviews.scss";
import ImageList from "./Restaurant/ImageList.jsx";

// display all existing reviews on restaurant's page
const Reviews = ({
  reviews,
  setReviews,
  API_PREFIX,
  editable = false, // Optional: Allow adding reviews only where necessary
  restaurantId = null, // Optional: Only needed if creating new reviews
  addAuthHeader,
  setRestaurant,
  loggedInUserId
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    item: "",
    review: "",
    rating: "",
    pictures: []
  });
  const [showImageList, setShowImageList] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const navigate = useNavigate();

  // adjust reviewData with review submissions details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData({ ...reviewData, [name]: value });
  };

  // adjust reviewData with uploaded images
  const handlePicturesChange = (e) => {
    setReviewData({ ...reviewData, pictures: Array.from(e.target.files) });
  };

  // display clicked scope of images
  const handleImageClick = (pictures) => {
    setCurrentImages(pictures);
    setShowImageList(true);
  };

  // handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // define formdata and add new review info
    const formData = new FormData();
    formData.append("item", reviewData.item);
    formData.append("review", reviewData.review);
    formData.append("rating", reviewData.rating);
    formData.append("restaurant", restaurantId);

    // Add each picture to the FormData
    if (reviewData.pictures.length > 0) {
      reviewData.pictures.forEach((file) => formData.append("pictures", file));
    }

    try {
      // post new review info with formData
      const response = await fetch(`${API_PREFIX}/review`, {
        method: "POST",
        headers: addAuthHeader(),
        body: formData
      });

      // set reviewData with new review info
      if (response.ok) {
        const newReview = await response.json();
        setReviews((prevReviews) => [newReview, ...prevReviews]);
        toast.success("Review added successfully");
        setShowReviewForm(false);
        setReviewData({ item: "", review: "", rating: "", pictures: [] });

        // Refresh restaurant details to update the average rating
        const restaurantResponse = await fetch(
          `${API_PREFIX}/restaurant/${restaurantId}`,
          { headers: addAuthHeader() }
        );
        if (restaurantResponse.ok) {
          const data = await restaurantResponse.json();
          setRestaurant(data.restaurant.restaurant);
          setReviews(data.restaurant.reviews);
        }
      } else {
        const errorText = await response.text();
        console.error("Response Error:", errorText);
        toast.error("Error adding review");
      }
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Error adding review");
    }
  };

  // Handle deleting a review
  const handleDeleteReview = async (reviewId) => {
    try {
      // try to remove review from database
      const response = await fetch(`${API_PREFIX}/review/${reviewId}`, {
        method: "DELETE",
        headers: addAuthHeader()
      });

      // update reviewData without the deleted review
      if (response.ok) {
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review._id !== reviewId)
        );
        toast.success("Review deleted successfully");

        // Only refresh restaurant details if restaurantId is provided
        if (restaurantId) {
          const restaurantResponse = await fetch(
            `${API_PREFIX}/restaurant/${restaurantId}`,
            { headers: addAuthHeader() }
          );
          if (restaurantResponse.ok) {
            const data = await restaurantResponse.json();
            setRestaurant(data.restaurant.restaurant);
            setReviews(data.restaurant.reviews);
          }
        }
      } else {
        toast.error("Error deleting review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Error deleting review");
    }
  };

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2>Reviews</h2>
        {/* display button to add new reviews */}
        {editable && (
          <button
            className="add-review-button"
            onClick={() => setShowReviewForm(true)}>
            Add Review
          </button>
        )}
      </div>
      {reviews.length > 0 ? (
        // iterate through all reviews and display each review
        reviews.map((review) => (
          <div
            key={review._id}
            className="review-card"
            onClick={() => navigate(`/restaurant/${review.restaurant}`)}>
              {/* delete button for review author */}
            {review.author._id === loggedInUserId && (
              <button
                className="delete-review-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteReview(review._id);
                }}>
                &times;
              </button>
            )}
            {/* display review author information */}
            <div className="header">
              <img
                src={`${review.author?.profile_pic}`}
                alt="Author"
                className="review-author-pic"
              />
              <div className="author-info">
                {review.author?.firstname} {review.author?.lastname}
              </div>
            </div>
            {/* display reviewed item's info */}
            <div className="top-row">
              <div className="item-name">{review.item}</div>
              <div className="review-date">
                {new Date(review.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </div>
            </div>
            <div className="stars">
              {/* fill stars with rating value, leave rest empty*/}
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </div>
            {/* display review and images */}
            <div className="review-body">{review.review}</div>
            {review.pictures && review.pictures.length > 0 && (
              <div
                className="review-pictures-container"
                onClick={() => handleImageClick(review.pictures)}>
                <img
                  src={review.pictures[0]} // Display the first picture
                  alt="Review Thumbnail"
                  className="review-thumbnail"
                />
                {review.pictures.length > 1 && (
                  <div className="overlay">
                    <span>See More</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No reviews yet</p>
      )}

      {/* display review form and handle review submission */}
      {editable && showReviewForm && (
        <div className="modal">
          <div className="modal-content">
            {/* save item info */}
            <form onSubmit={handleSubmitReview}>
              <label>
                Item:
                <input
                  type="text"
                  name="item"
                  value={reviewData.item}
                  onChange={handleInputChange}
                  required
                />
              </label>
              {/* save review info */}
              <label>
                Review:
                <textarea
                  name="review"
                  value={reviewData.review}
                  onChange={handleInputChange}
                  required></textarea>
              </label>
              {/* save rating value */}
              <label>
                Rating:
                <input
                  type="number"
                  name="rating"
                  value={reviewData.rating}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  required
                />
              </label>
              {/* save images */}
              <label>
                Pictures:
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePicturesChange}
                />
              </label>
              <button type="submit">Submit Review</button>
              <button type="button" onClick={() => setShowReviewForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {showImageList && (
        // display images within review card
        <ImageList
          photos={currentImages}
          onClose={() => setShowImageList(false)}
        />
      )}
    </div>
  );
};

export default Reviews;
