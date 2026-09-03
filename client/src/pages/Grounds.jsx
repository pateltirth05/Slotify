import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../style/exploreGrounds.css";

import Navbard from "../components/Navbard";
import Footer from "../components/Footer";

import api from "../services/api.js";

const Grounds = () => {
  const [grounds, setGrounds] = useState([]);

  const [filters, setFilters] = useState({
    city: "",
    sport: "",
    minPrice: "",
    maxPrice: "",
  });

  const [cities, setCities] = useState([]);
  const [sports, setSports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [visibleCount, setVisibleCount] = useState(6);

  const fetchGrounds = async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (currentFilters.city) {
        params.city = currentFilters.city;
      }

      if (currentFilters.sport) {
        params.sport = currentFilters.sport;
      }

      if (currentFilters.minPrice) {
        params.min_price = currentFilters.minPrice;
      }

      if (currentFilters.maxPrice) {
        params.max_price = currentFilters.maxPrice;
      }

      const response = await api.get("/grounds", {
        params,
      });

      const groundData =
        response.data.grounds ||
        response.data.data ||
        response.data;

      const groundList = Array.isArray(groundData)
        ? groundData
        : [];

      setGrounds(groundList);
      setVisibleCount(6);

      /*
        Build city options dynamically from the database response.
      */
      const uniqueCities = [
        ...new Set(
          groundList
            .map((ground) => ground.city)
            .filter(Boolean)
        ),
      ].sort();

      setCities(uniqueCities);

      /*
        Build sport options dynamically from active resources.
      */
      const uniqueSports = [
        ...new Set(
          groundList
            .flatMap((ground) => ground.resources || [])
            .map((resource) => resource.sport_type)
            .filter(Boolean)
        ),
      ].sort();

      setSports(uniqueSports);
    } catch (error) {
      console.error("Fetch grounds error:", error);

      setError(
        error.response?.data?.message ||
        "Unable to load grounds."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrounds();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();

    fetchGrounds(filters);
  };

  const handleLoadMore = () => {
    setVisibleCount((previous) => previous + 6);
  };

  return (
    <>
      <Navbard />

      {/* Explore Hero */}
      <header className="exploreHero">
        <div className="exploreHeroInner">
          <div className="exploreEyebrow">
            120+ VENUES ACROSS GUJARAT
          </div>

          <h1 className="exploreTitle">
            Explore Grounds
          </h1>

          <p className="exploreSubtitle">
            Search by city, sport and budget to find your next
            playing slot.
          </p>
        </div>
      </header>

      {/* Filters */}
      <section className="filterSection">
        <div className="filterInner">

          <form
            className="filterBar"
            onSubmit={handleApplyFilters}
          >

            {/* City */}
            <div className="filterField">
              <label
                className="filterLabel"
                htmlFor="city"
              >
                City
              </label>

              <select
                className="filterInput"
                id="city"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
              >
                <option value="">
                  All Cities
                </option>

                {cities.map((city) => (
                  <option
                    value={city}
                    key={city}
                  >
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Sport */}
            <div className="filterField">
              <label
                className="filterLabel"
                htmlFor="sport"
              >
                Sport
              </label>

              <select
                className="filterInput"
                id="sport"
                name="sport"
                value={filters.sport}
                onChange={handleFilterChange}
              >
                <option value="">
                  All Sports
                </option>

                {sports.map((sport) => (
                  <option
                    value={sport}
                    key={sport}
                  >
                    {sport}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum price */}
            <div className="filterField">
              <label
                className="filterLabel"
                htmlFor="minPrice"
              >
                Min Price
              </label>

              <input
                className="filterInput"
                type="number"
                id="minPrice"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="₹0"
                min="0"
              />
            </div>

            {/* Maximum price */}
            <div className="filterField">
              <label
                className="filterLabel"
                htmlFor="maxPrice"
              >
                Max Price
              </label>

              <input
                className="filterInput"
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="₹2000"
                min="0"
              />
            </div>

            <button
              type="submit"
              className="filterSubmit"
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "Apply Filters"}
            </button>

          </form>

        </div>
      </section>

      {/* Grounds */}
      <main className="exploreMain">
        <div className="exploreMainInner">

          <div className="groundsHeader">
            <p>
              {loading
                ? "Loading grounds..."
                : `${grounds.length} grounds found`}
            </p>
          </div>

          {error && (
            <p className="groundsError">
              {error}
            </p>
          )}

          {!loading &&
            !error &&
            grounds.length === 0 && (
              <p className="groundsEmpty">
                No grounds found for the selected filters.
              </p>
            )}

          <div className="groundsGrid">

            {grounds
              .slice(0, visibleCount)
              .map((ground) => (

                <article
                  className="groundCard"
                  key={ground.id}
                >

                  {/* Image */}
                  <div className="groundCardMedia">
                    <img
                      className="groundCardImage"
                      src={
                        ground.photos?.[0] ||
                        "/placeholder-ground.jpg"
                      }
                      alt={ground.name}
                    />
                  </div>

                  {/* Card body */}
                  <div className="groundCardBody">

                    <h3 className="groundCardName">
                      {ground.name}
                    </h3>

                    <div className="groundCardLocation">
                      📍 {ground.location}
                      {ground.city
                        ? `, ${ground.city}`
                        : ""}
                    </div>

                    {/* Facilities */}
                    {ground.facilities?.length > 0 && (
                      <div className="groundCardFacilities">

                        {ground.facilities
                          .slice(0, 3)
                          .map((facility) => (
                            <span
                              className="facilityChip"
                              key={facility}
                            >
                              {facility}
                            </span>
                          ))}

                      </div>
                    )}

                    {/* Sports and prices */}
                    {ground.resources?.length > 0 && (
                      <ul className="sportPriceList">

                        {ground.resources.map(
                          (resource) => (
                            <li
                              className="sportPriceItem"
                              key={resource.id}
                            >
                              <span className="sportPriceLabel">
                                {resource.sport_type}
                              </span>

                              <span className="sportPriceValue">
                                ₹
                                {Number(
                                  resource.price_per_hour
                                ).toLocaleString("en-IN")}
                                /hr
                              </span>
                            </li>
                          )
                        )}

                      </ul>
                    )}

                    {/* Details button */}
                    <div className="groundCardFoot">

                      <Link
                        to={`/grounds/${ground.id}`}
                        className="viewDetailsBtn"
                      >
                        View Details
                      </Link>

                    </div>

                  </div>

                </article>

              ))}

          </div>

          {/* Load more */}
          {visibleCount < grounds.length && (
            <div className="loadMoreWrap">

              <button
                type="button"
                className="loadMoreBtn"
                onClick={handleLoadMore}
              >
                Load More Grounds
              </button>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
};

export default Grounds;