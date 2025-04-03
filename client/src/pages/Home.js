import React from 'react';

const Home = () => {
    return (
        <div>
            <header>
                <h1>Welcome to SPOC-LMSC</h1>
                <p>Your new destination for online learning</p>
            </header>
            <main>
                <section>
                    <h2>Get Started</h2>
                    <p>Sign up or log in to start learning today!</p>
                    <a href="/sign"><button>Sign-in</button></a>
                    <a href="/sign"><button>Sign-up</button></a>
                </section>
                <section>
                    <h2>Featured Courses</h2>
                    <p>Explore our most popular courses and start learning today!</p>
                    {/* Add course components or links here */}
                </section>
                <section>
                    <h2>About Us</h2>
                    <p>SPOC-LMSC is dedicated to providing high-quality online education to learners around the world.</p>
                </section>
            </main>
            <footer>
                <p>&copy; 2025 SPOC-LMSC. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;