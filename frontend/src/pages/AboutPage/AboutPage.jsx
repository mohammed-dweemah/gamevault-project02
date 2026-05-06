import React from 'react';
import './AboutPage.css';

const team = [
  { name: 'Mohammad Dweemah', avatar: '◉', color: '#7c6aff' },
  { name: 'Mohammad Tamimi',  avatar: '◈', color: '#ff6a9b' },
  { name: 'Shatha Tamimi',    avatar: '◎', color: '#6affda' },
  { name: 'Hayat Ali Hassan', avatar: '◇', color: '#f4c542' },
];

const techStack = [
  { name: 'React 18',      desc: 'Functional components, hooks, Context API' },
  { name: 'Node.js',       desc: 'JavaScript runtime for the backend server' },
  { name: 'Express.js',    desc: 'REST API, sessions, middleware, routing' },
  { name: 'MongoDB',       desc: 'NoSQL database via Mongoose ODM' },
  { name: 'express-session', desc: 'HTTP session & cookie-based auth' },
  { name: 'bcryptjs',      desc: 'Secure password hashing' },
  { name: 'Axios',         desc: 'HTTP client for API calls' },
  { name: 'Render.com',    desc: 'Full deployment (API + Static Site)' },
];

const AboutPage = () => {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero__glow" />
        <div className="about-hero__content">
          <span className="about-eyebrow">◈ About This Project</span>
          <h1 className="about-headline">GameVault</h1>
          <p className="about-tagline">
            A full MERN stack application built for the<br />
            <strong>Web Applications Programming &amp; Engineering</strong> course.
          </p>
        </div>
      </section>

      <section className="about-section about-info">
        <div className="about-section__inner">
          <h2 className="about-section__title">Project Overview</h2>
          <div className="about-info__grid">
            <div className="about-info__card">
              <span className="about-info__icon" style={{ color: '#7c6aff' }}>⬡</span>
              <h3>What We Built</h3>
              <p>
                A full-stack MERN application allowing users to register, login, and manage
                a personal game library. Features secure authentication, session management,
                and server-side authorization — only game owners can edit or delete their entries.
              </p>
            </div>
            <div className="about-info__card">
              <span className="about-info__icon" style={{ color: '#ff6a9b' }}>⬡</span>
              <h3>Technical Focus</h3>
              <p>
                Demonstrates full-stack integration: a React frontend communicates with an
                Express REST API backed by MongoDB. Implements bcrypt password hashing,
                HTTP session cookies, custom middleware logging, and Mongoose authorization queries.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section about-team">
        <div className="about-section__inner">
          <h2 className="about-section__title">The Team</h2>
          <div className="about-team__grid">
            {team.map(member => (
              <div key={member.name} className="about-team__card">
                <div className="about-team__avatar" style={{ color: member.color, borderColor: member.color }}>
                  {member.avatar}
                </div>
                <h3 className="about-team__name">{member.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-tech">
        <div className="about-section__inner">
          <h2 className="about-section__title">Tech Stack — MERN</h2>
          <div className="about-tech__grid">
            {techStack.map(tech => (
              <div key={tech.name} className="about-tech__item">
                <span className="about-tech__name">{tech.name}</span>
                <span className="about-tech__desc">{tech.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
