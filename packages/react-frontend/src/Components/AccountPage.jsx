import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Reviews from "./Reviews";
import "react-toastify/dist/ReactToastify.css";
import "../Styles/AccountPage.scss";
import logo from "../Assets/logo.png";
import "../Styles/App.scss";

// display for account page; user image, name, list of reviews, sign out,
// delete account
const AccountPage = ({ API_PREFIX, addAuthHeader, logoutUser }) => {
  const [account, setAccount] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfilePicOptions, setShowProfilePicOptions] = useState(false);
  const navigate = useNavigate();
  // blank profile picture
  const DEFAULT_PROFILE_PIC =
    "https://polyeats1901.blob.core.windows.net/images/profile-pictures/defaultprofilepic.jpeg";

  useEffect(() => {
    // access account info from database
    fetch(`${API_PREFIX}/account/details`, {
      headers: addAuthHeader()
    })
      .then((res) => res.json())
      .then((data) => {
        setAccount(data.account);
      })
      .catch((error) =>
        console.error("Error fetching account details:", error)
      );

    // access reviews submitted by user
    fetch(`${API_PREFIX}/account/reviews`, {
      headers: addAuthHeader()
    })
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []); // This now includes the updated profile_pic
      })
      .catch((error) => console.error("Error fetching reviews:", error));
  }, [API_PREFIX, addAuthHeader]);

  // Handle file upload for profile picture
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // initiate empty formData list and add file containing image
    const formData = new FormData();
    formData.append("profile_pic", file);

    try {
      // try adding image to profile-pic field in database
      const response = await fetch(`${API_PREFIX}/account/profile-pic`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        // update account with new profile pic
        setAccount((prevAccount) => ({
          ...prevAccount,
          profile_pic: data.profile_pic
        }));
        // update reviews with new profile pic
        setReviews((prevReviews) =>
          prevReviews.map((review) => ({
            ...review,
            author: {
              ...review.author,
              profile_pic: data.profile_pic
            }
          }))
        );
        toast.success("Profile picture updated successfully");
        setShowProfilePicOptions(false);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading profile picture");
    }
  };

  // Remove profile picture
  const removeProfilePicture = async () => {
    try {
      // send request to remove from profile-pic field in database
      const response = await fetch(`${API_PREFIX}/account/profile-pic/remove`, {
        method: "POST",
        headers: addAuthHeader()
      });
      const data = await response.json();
      if (response.ok) {
        // update account with default profile pic
        setAccount((prevAccount) => ({
          ...prevAccount,
          profile_pic: data.profile_pic
        }));

        // Update reviews with the default profile picture
        setReviews((prevReviews) =>
          prevReviews.map((review) => ({
            ...review,
            author: {
              ...review.author,
              profile_pic: data.profile_pic
            }
          }))
        );

        toast.success("Profile picture removed successfully");
        setShowProfilePicOptions(false);
      } else {
        toast.error("Error removing profile picture");
      }
    } catch (error) {
      console.error("Error removing profile picture:", error);
      toast.error("Error removing profile picture");
    }
  };

  // Handle profile picture click
  const handleProfilePicClick = () => {
    if (account.profile_pic === DEFAULT_PROFILE_PIC) {
      document.getElementById("profile-pic-upload").click();
    } else {
      setShowProfilePicOptions(true);
    }
  };

  const handleLogout = (bool = true) => {
    logoutUser(bool, () => navigate("/")); // Pass a callback to navigate
  };

  // Handle account deletion
  const deleteAccount = async () => {
    try {
      const response = await fetch(`${API_PREFIX}/account/delete`, {
        method: "DELETE",
        headers: addAuthHeader()
      });
      if (response.ok) {
        toast.success("Account deleted successfully");
        handleLogout(false); // Log the user out
      } else {
        toast.error("Error deleting account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Error deleting account");
    }
  };

  return (
    <div>
      {/* add logo to top of accounts page */}
      <div className="top-image">
        <img src={logo} alt="Top Banner" /> 
      </div>
      {/* add account title */}
      <h2 className="heading">Account</h2>
      <div className="account-page">
        {!account ? (
          <p>Loading account details...</p> // Display this while loading
        ) : (
          <>
            <div className="account-header">
              {/* display profile picture */}
              <img
                src={`${account.profile_pic}`}
                alt="Profile"
                className="profile-pic"
                onClick={handleProfilePicClick}
              />
              {/* handle pressing image upload button */}
              <input
                type="file"
                id="profile-pic-upload"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <h2>
                {/* display user's name */}
                {account.firstname} {account.lastname}
              </h2>
              {/* display email */}
              <p className="email-text">{account.calpoly_email}</p>
            </div>

            {showProfilePicOptions && (
              <div className="modal">
                <div className="modal-content">
                  {/* display buttons to edit/remove profile picture */}
                  <p>Edit Profile Picture</p>
                  <button
                    onClick={() => {
                      removeProfilePicture();
                    }}>
                    Remove Profile Picture
                  </button>
                  <button
                    onClick={() =>
                      document.getElementById("profile-pic-upload").click()
                    }>
                    Change Profile Picture
                  </button>
                  <button onClick={() => setShowProfilePicOptions(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {/* display all of user's reviews */}
            <div className="reviews-section">
              <Reviews
                reviews={reviews}
                setReviews={setReviews}
                API_PREFIX={API_PREFIX}
                editable={false}
                addAuthHeader={addAuthHeader}
                loggedInUserId={account._id}
              />
            </div>

            {/* delete account button */}
            <div className="account-actions">
              <button onClick={handleLogout}>Sign Out</button>
              <button onClick={() => setShowDeleteModal(true)}>
                Delete Account
              </button>
            </div>

            {/* double check if user wants to delete account */}
            {showDeleteModal && (
              <div className="modal">
                <div className="modal-content">
                  <p>Are you sure you want to delete your account?</p>
                  <button onClick={deleteAccount}>Yes, Delete</button>
                  <button onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
