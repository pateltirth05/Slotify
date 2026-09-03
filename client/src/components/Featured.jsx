import React, { useState ,useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Featured = () => {
     const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/grounds");

        const groundData = response.data.grounds || response.data;

        setGrounds(groundData.slice(0, 3));
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

    fetchGrounds();
  }, []);

  const handleBookNow = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/grounds");
  };

  const handleLoadMore = () => {
    navigate("/grounds");
  };

  if (loading) {
    return (
      <section className="featured-grounds">
        <p>Loading grounds...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-grounds">
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="section" id="grounds">
  <div className="container">
    <div className="section__head">
      <div>
        <div className="eyebrow">AVAILABLE NEARBY</div>
        <h2>Explore Grounds</h2>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="chip" style={{ border: '1px solid var(--c-line)', background: '#fff' }}>
          Nearest first
        </button>
        <button className="chip" style={{ border: '1px solid var(--c-line)', background: '#fff' }}>
          Price: low to high
        </button>
        <button className="chip" style={{ border: '1px solid var(--c-line)', background: '#fff' }}>
          Top rated
        </button>
      </div>
    </div>

    <div className="grounds-grid">
      
  {grounds.map((ground) => (
      <div className="ground-card" key={ground.id}>
        <div className="ground-card__media">
          <span className="ground-card__price">₹{ground.price}/hr</span>
          <img src={ ground.photos?.[0] ||
                  "/placeholder-ground.jpg"} alt={ground.name} />
        </div>
        <div className="ground-card__body">
          <div className="ground-card__name">{ground.name}</div>
          <div className="ground-card__loc">📍   {ground.city ? `, ${ground.city}` :` ${ground.location}`}</div>
             {ground.facilities?.length > 0 && (
          <div className="ground-card__facilities">
             {ground.facilities.slice(0, 3).map((facility) => (
                    <span className='chip' key={facility}>
                      {facility}
                    </span>
                  ))}
          </div>
              )}
          <div className="ground-card__foot">
            <button onClick={handleBookNow} className='btn btn--primary btn--block btn--lg'>Book Now</button>
          </div>
        </div>
      </div>
  ))}
    </div>

    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <button className="btn btn--outline" onClick={handleLoadMore}>Load More Grounds</button>
    </div>
  </div>
</section>
  )
}

export default Featured