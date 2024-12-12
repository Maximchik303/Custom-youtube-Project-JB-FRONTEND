import React from 'react';
import styles from './About.module.css';
import { useNavigate } from 'react-router-dom';

const About = () => {
  document.title = "Register";
  const existingFavicon = document.querySelector('link[rel="icon"]');
  if (existingFavicon) {
      document.head.removeChild(existingFavicon);
  }
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.href = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2248%22%20height%3D%2248%22%20viewBox%3D%220%200%2024%2024%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20fill%3D%22%234CAF50%22%2F%3E%3Cpath%20fill%3D%22white%22%20d%3D%22M12%202C6.48%202%202%206.48%202%2012s4.48%2010%2010%2010%2010-4.48%2010-10S17.52%202%2012%202zm0%2018c-4.41%200-8-3.59-8-8s3.59-8%208-8%208%203.59%208%208-3.59%208-8%208zm0-10c-.83%200-1.5-.67-1.5-1.5S11.17%207%2012%207s1.5.67%201.5%201.5S12.83%2010%2012%2010zm-.5%204h1v4h-1z%22%2F%3E%3C%2Fsvg%3E';
  document.head.appendChild(favicon);
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.topNav}>
        <button 
          onClick={() => navigate('/')} 
          className={styles.navButton}
        >
          Login
        </button>
        <button 
          onClick={() => navigate('/register')} 
          className={styles.navButton}
        >
          Register
        </button>
      </div>

      <section className={styles.hero}>
        <h1 className={styles.title}>About Page</h1>
        <p className={styles.subtitle}>
          What Really is the point of the page?
        </p>
      </section>
      <section className={styles.content}>
        <div className={styles.card}>
          <h2>The website</h2>
          <p>
            Have you ever been scrolling for minutes on YouTube trying to find the perfect video?
            Sometimes there are too many videos to choose from or the algorithm is disappointing you.
            On this website, there is a selection of videos submitted by the community for the community.
            Submitted videos go through admin approval where it's decided if the video is fit for this website.
            The website has a selection of educational/fun fact-type videos from different categories that were 
            ever submitted on YouTube, new and old. Videos that are irrelevant will be removed from time to time,
            and there is also a trending section coming straight from YouTube itself.
            At the end of the day, it's a website to find videos to watch easier and more fitting to you.
          </p>
        </div>
        <div className={styles.card}>
          <h2>My Contacts</h2>
          <ul>
            <li>
              <a 
                href="https://github.com/Maximchik303" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
                Github
              </a>
              Maximchik303
            </li>
            <li>
              <a 
                href="https://www.linkedin.com/in/maxim-voropaev-8080a632b/" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
                LinkedIn
              </a>
              Maxim Voropaev
            </li>
            <li style={{ marginTop: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>Gmail: maximchik303@gmail.com</span> 
              <button
                onClick={() =>
                  window.open(
                    `https://mail.google.com/mail/?view=cm&fs=1&to=Maximchik303@gmail.com&su=Hello&body=Your%20message%20here`,
                    '_blank'
                  )
                }
                style={{
                  color: 'white',
                  backgroundColor: '#4285F4',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Email Me
              </button>
            </li>
          </ul>
        </div>
      </section>
      <footer className={styles.footer}>
        <p>All made by me</p>
      </footer>
    </div>
  );
};

export default About;
