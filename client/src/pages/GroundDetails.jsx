import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import "../style/GroundDetails.css";
import "../style/style.css";

import Navbard from "../components/Navbard";
import Footer from "../components/Footer";

import api from "../services/api.js";

const GroundDetails = () => {
  const { id } = useParams();

  const [ground, setGround] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroundDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/grounds/${id}`);

        const groundData =
          response.data.ground ||
          response.data.data ||
          response.data;

        setGround(groundData);
      } catch (error) {
        console.error("Fetch ground details error:", error);

        setError(
          error.response?.data?.message ||
          "Unable to load ground details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroundDetails();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbard />

        <main className="venueBody">
          <div className="venueLayout">
            <p>Loading ground details...</p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (error || !ground) {
    return (
      <>
        <Navbard />

        <main className="venueBody">
          <div className="venueLayout">
            <p className="groundsError">
              {error || "Ground not found."}
            </p>

            <Link to="/grounds">
              ← Back to search results
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const resources = ground.resources || [];

  const allSports = [
    ...new Set(
      resources
        .map((resource) => resource.sport_type)
        .filter(Boolean)
    ),
  ];

  const allFacilities = ground.facilities || [];

  const firstPhoto =
    ground.photos?.[0] ||
    "/placeholder-ground.jpg";

  const secondPhoto =
    ground.photos?.[1] ||
    firstPhoto;

  const thirdPhoto =
    ground.photos?.[2] ||
    firstPhoto;

  return (
    <>
      <Navbard />

      {/* Venue Hero */}
      <section className="venueHero">

        <img
          src={firstPhoto}
          alt={ground.name}
        />

        <div className="venueHeroOverlay">

          <div className="venueHeroContent">

            <Link
              to="/grounds"
              className="venueHeroBack"
            >
              ← Back to search results
            </Link>

            <div className="venueHeroTitleRow">

              <div>

                <div className="venueHeroName">
                  {ground.name}
                </div>

                <div className="venueHeroMeta">

                  <span>
                    📍 {ground.location}
                    {ground.city
                      ? `, ${ground.city}`
                      : ""}
                  </span>

                  {resources.length > 0 && (
                    <span>
                      🏟️ {resources.length}{" "}
                      {resources.length === 1
                        ? "resource"
                        : "resources"}
                    </span>
                  )}

                </div>

                {/* Sports */}
                {allSports.length > 0 && (
                  <div className="venueSportTags">

                    {allSports.map((sport) => (
                      <span
                        className="sportTag"
                        key={sport}
                      >
                        {sport}
                      </span>
                    ))}

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Venue Body */}
      <div className="venueBody">

        <div className="venueLayout">

          {/* Main Content */}
          <div>

            {/* Description */}
            <p className="venueAbout">
              {ground.description || "About this ground"}
            </p>

            {/* Resources */}
            <div className="groundList">

              {resources.length === 0 ? (
                <p className="groundsEmpty">
                  No active resources are available at this ground.
                </p>
              ) : (
                resources.map((resource) => (

                  <div
                    className="groundListItem"
                    key={resource.id}
                  >

                    {/* Resource image */}
                    <div className="groundListMedia">

                      <span className="sportBadge">
                        {resource.sport_type}
                      </span>

                      <img
                        src={
                          resource.photos?.[0] ||
                          firstPhoto
                        }
                        alt={resource.name}
                      />

                    </div>

                    {/* Resource details */}
                    <div className="groundListBody">

                      <div className="groundListTop">

                        <div>

                          <div className="groundListName">
                            {resource.name}
                          </div>

                          <div className="groundListSpecs">

                            <span>
                              🕐{" "}
                              {resource.opening_time} –{" "}
                              {resource.closing_time}
                            </span>

                            <span>
                              {resource.sport_type}
                            </span>

                          </div>

                        </div>

                        {/* Price */}
                        <div className="groundListPrice">

                          <b>
                            ₹
                            {Number(
                              resource.price_per_hour
                            ).toLocaleString("en-IN")}
                          </b>

                          <span>
                            per hour
                          </span>

                        </div>

                      </div>

                      {/* Resource facilities */}
                      {allFacilities.length > 0 && (
                        <div className="groundListFacilities">

                          {allFacilities
                            .slice(0, 3)
                            .map((facility) => (

                              <span
                                className="chip"
                                key={facility}
                              >
                                {facility}
                              </span>

                            ))}

                        </div>
                      )}

                      {/* Resource footer */}
                      <div className="groundListFoot">

                        <span className="availabilityText">
                          <span className="availabilityDot"></span>
                          Check availability
                        </span>

                        <Link
                          to={`/grounds/${ground.id}/resources/${resource.id}`}
                          className="btn btn--primary btn--sm"
                        >
                          View & Book
                        </Link>

                      </div>

                    </div>

                  </div>

                ))
              )}

            </div>

          </div>

          {/* Sidebar */}
          <aside>

            {/* Venue Information */}
            <div className="venueSidebarCard">

              <div className="venueSidebarTitle">
                Venue Information
              </div>

              {/* Address */}
              <div className="venueInfoRow">

                <div className="venueInfoIcon">
                  📍
                </div>

                <div>

                  <div className="venueInfoLabel">
                    Address
                  </div>

                  <div className="venueInfoValue">
                    {ground.location}
                    {ground.city
                      ? `, ${ground.city}`
                      : ""}
                  </div>

                </div>

              </div>

              {/* Hours */}
              {resources.length > 0 && (
                <div className="venueInfoRow">

                  <div className="venueInfoIcon">
                    🕐
                  </div>

                  <div>

                    <div className="venueInfoLabel">
                      Hours
                    </div>

                    <div className="venueInfoValue">
                      {resources[0].opening_time} –{" "}
                      {resources[0].closing_time}
                    </div>

                  </div>

                </div>
              )}

              {/* Facilities */}
              {allFacilities.length > 0 && (
                <div className="venueInfoRow">

                  <div className="venueInfoIcon">
                    🏟️
                  </div>

                  <div>

                    <div className="venueInfoLabel">
                      Facilities
                    </div>

                    <div className="venueInfoValue">
                      {allFacilities.join(", ")}
                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* Additional Photos */}
            {(ground.photos?.length > 1) && (
              <div className="venueSidebarCard">

                <div className="venueSidebarTitle">
                  More Photos
                </div>

                <div className="venuePhotoGrid">

                  <img
                    src={secondPhoto}
                    alt={`${ground.name} view`}
                  />

                  {ground.photos?.length > 2 && (
                    <img
                      src={thirdPhoto}
                      alt={`${ground.name} view`}
                    />
                  )}

                </div>

              </div>
            )}

            {/* Owner */}
            {ground.owner_name && (
              <div
                className="venueSidebarCard"
                style={{ position: "static" }}
              >

                <div className="venueSidebarTitle">
                  Venue Owner
                </div>

                <div className="ownerCard">

                  <div className="ownerAvatar">
                    {ground.owner_name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div>
                    <b>{ground.owner_name}</b>
                  </div>

                </div>

              </div>
            )}

          </aside>

        </div>

      </div>

      <Footer />
    </>
  );
};

export default GroundDetails;