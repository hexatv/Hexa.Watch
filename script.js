const { useState, useEffect, useRef, useCallback } = React;
        const { BrowserRouter, Route, Link, Switch, useParams } = ReactRouterDOM;

        const axios = axios;
        const API_KEY = '8908a80d66eae13bd34f357ec5bc1db8';
        const BASE_URL = 'https://api.themoviedb.org/3';
        const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

        const WatchlistContext = React.createContext({
            watchlist: [],
            updateWatchlist: () => {}
        });

        const WatchProgressContext = React.createContext({
            progress: {},
            updateProgress: () => {}
        });

        function WatchlistProvider({ children }) {
            const [watchlist, setWatchlist] = useState([]);

            useEffect(() => {
                const savedWatchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
                setWatchlist(savedWatchlist);
            }, []);

            const updateWatchlist = (newWatchlist) => {
                setWatchlist(newWatchlist);
                localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
            };

            return (
                <WatchlistContext.Provider value={{ watchlist, updateWatchlist }}>
                    {children}
                </WatchlistContext.Provider>
            );
        }

        function WatchProgressProvider({ children }) {
            const [progress, setProgress] = useState({});

            useEffect(() => {
                try {
                    const savedProgress = JSON.parse(localStorage.getItem('watchProgress') || '{}');
                    setProgress(savedProgress);
                } catch (error) {
                    console.error('Failed to load watch progress:', error);
                    setProgress({});
                }
            }, []);

            const updateProgress = useCallback((mediaId, data) => {
                if (!mediaId || !data) return;
                
                setProgress(prev => {
                    const updated = {
                        ...prev,
                        [mediaId]: {
                            ...data,
                            lastUpdated: new Date().toISOString()
                        }
                    };
                    try {
                        localStorage.setItem('watchProgress', JSON.stringify(updated));
                    } catch (error) {
                        console.error('Failed to save watch progress:', error);
                    }
                    return updated;
                });
            }, []);

            return (
                <WatchProgressContext.Provider value={{ progress, updateProgress }}>
                    {children}
                </WatchProgressContext.Provider>
            );
        }

        function InstallPWA() {
            const [installPrompt, setInstallPrompt] = useState(null);
            const [isInstalled, setIsInstalled] = useState(false);

            useEffect(() => {
                const handleBeforeInstallPrompt = (e) => {
                    e.preventDefault();
                    setInstallPrompt(e);
                };

                window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
                
                if (window.matchMedia('(display-mode: standalone)').matches) {
                    setIsInstalled(true);
                }

                return () => {
                    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
                };
            }, []);

            const handleInstallClick = async () => {
                if (!installPrompt) return;
                const result = await installPrompt.prompt();
                if (result.outcome === 'accepted') {
                    setIsInstalled(true);
                    setInstallPrompt(null);
                }
            };

            if (!installPrompt || isInstalled) return null;

            return (
                <button
                    onClick={handleInstallClick}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] hover:shadow-lg hover:shadow-[#4facfe]/20 transition-all duration-300 flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Install App</span>
                </button>
            );
        }
        function App() {
            return (
                <BrowserRouter>
                    <WatchlistProvider>
                        <WatchProgressProvider>
                            <div className="min-h-screen bg-gray-900 text-white">
                                <Header />
                                <main className="container mx-auto px-4 py-6">
                                    <Switch>
                                        <Route exact path="/" component={Home} />
                                        <Route exact path="/home" component={Home} />
                                        <Route exact path="/search" component={Search} />
                                        <Route exact path="/movies" component={MovieList} />
                                        <Route exact path="/tv" component={TVShowList} />
                                        <Route path="/watchlist" component={Watchlist} />
                                        <Route path="/movie/:id" component={MovieDetails} />
                                        <Route path="/tv/:id" component={TVDetails} />
                                        <Route path="/continue-watching" component={ContinueWatching} />
                                    </Switch>
                                </main>
                                <Footer />
                            </div>
                        </WatchProgressProvider>
                    </WatchlistProvider>
                </BrowserRouter>
            );
        }

        function Header() {
            const [isMenuOpen, setIsMenuOpen] = useState(false);

            return (
                <header className="fixed w-full z-50 backdrop-blur">
                    <div className="absolute inset-0 bg-black/90"></div>
                    <nav className="container mx-auto px-4 py-4 relative">
                        <div className="flex justify-between items-center">
                            <Link to="/" className="flex items-center space-x-2">
                                <span className="text-3xl md:text-4xl font-bold gradient-text tracking-tight animate-float">Hexa Watch</span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">V2</span>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center space-x-6">
                                <SearchBar />
                                <Link to="/movies" className="text-gray-300 hover:text-white transition-colors">Movies</Link>
                                <Link to="/tv" className="text-gray-300 hover:text-white transition-colors">TV Shows</Link>
                                <Link to="/watchlist" className="text-gray-300 hover:text-white transition-colors">Watchlist</Link>
                                <Link to="/continue-watching" className="text-gray-300 hover:text-white transition-colors">Continue Watching</Link>
                                <InstallPWA />
                                <a 
                                    href="https://discord.gg/fF7TwrjR6T" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-full bg-[#5865F2] hover:bg-[#4752C4] transition-colors flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                                    </svg>
                                    <span>Discord</span>
                                </a>
                                <a 
                                    href="https://api.hexa.watch" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] hover:shadow-lg hover:shadow-[#4facfe]/20 transition-all duration-300 flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    <span>API</span>
                                </a>
                            </div>

                            {/* Mobile Menu Button */}
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>

                        {/* Mobile Menu */}
                        <div className={`md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg transition-all duration-300 ${isMenuOpen ? 'max-h-screen py-4' : 'max-h-0 overflow-hidden'}`}>
                            <div className="flex flex-col space-y-4 px-4">
                                <SearchBar />
                                <nav className="flex flex-col space-y-2">
                                    <Link to="/" className="hover:text-[#4facfe] transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
                                    <Link to="/movies" className="hover:text-[#4facfe] transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Movies</Link>
                                    <Link to="/tv" className="hover:text-[#4facfe] transition-colors py-2" onClick={() => setIsMenuOpen(false)}>TV Shows</Link>
                                    <Link to="/watchlist" className="hover:text-[#4facfe] transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Watchlist</Link>
                                    <Link to="/continue-watching" className="hover:text-[#4facfe] transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Continue Watching</Link>
                                </nav>
                                <div className="flex flex-col space-y-4">
                                    <a 
                                        href="https://discord.gg/fF7TwrjR6T" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-full bg-[#5865F2] hover:bg-[#4752C4] transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                                        </svg>
                                        <span>Discord</span>
                                    </a>
                                    <a 
                                        href="https://api.hexa.watch" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] hover:shadow-lg hover:shadow-[#4facfe]/20 transition-all duration-300 flex items-center justify-center space-x-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        <span>API</span>
                                    </a>
                                    <InstallPWA />
                                </div>
                            </div>
                        </div>
                    </nav>
                </header>
            );
        }

        function Home() {
            const [featured, setFeatured] = useState(null);
            const [sections, setSections] = useState({});
            const [activeSection, setActiveSection] = useState('trending');
            const [pages, setPages] = useState({});
            const [hasMore, setHasMore] = useState({});
            const [loading, setLoading] = useState({});

            const sectionTitles = {
                trendingMoviesWeek: "Trending Movies This Week",
                trendingTVWeek: "Trending TV Shows This Week",
                trendingMoviesDay: "Trending Movies Today",
                trendingTVDay: "Trending TV Shows Today",
                topRatedMovies: "Top Rated Movies",
                topRatedTV: "Top Rated TV Shows",
                upcoming: "Upcoming Movies",
                popularMovies: "Popular Movies",
                popularTV: "Popular TV Shows",
                nowPlaying: "Now Playing",
                airingToday: "TV Shows Airing Today",
                onTheAir: "Currently Airing TV Shows",
                action: "Action Movies",
                comedy: "Comedy Movies",
                horror: "Horror Movies",
                documentary: "Documentaries"
            };

            const getContentType = (section, item) => {
                // TV-specific sections
                if (['topRatedTV', 'popularTV', 'airingToday', 'onTheAir'].includes(section)) {
                    return 'tv';
                }
                
                // Movie-specific sections
                if (['topRatedMovies', 'popularMovies', 'upcoming', 'nowPlaying', 'action', 'comedy', 'horror', 'documentary'].includes(section)) {
                    return 'movie';
                }
                
                // For trending sections, we need more precise detection
                if (['trending', 'trendingDay'].includes(section)) {
                    // First check media_type from API
                    if (item.media_type) {
                        return item.media_type;
                    }
                    // Then check for TV-specific properties
                    if (item.first_air_date || item.name) {
                        return 'tv';
                    }
                    // Then check for Movie-specific properties
                    if (item.release_date || item.title) {
                        return 'movie';
                    }
                }
                
                // Default fallback - do thorough property check
                if (item.first_air_date || item.name) {
                    return 'tv';
                }
                return 'movie';
            };

            const renderSection = (sectionKey) => {
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">{sectionTitles[sectionKey]}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {sections[sectionKey] && sections[sectionKey].map(item => (
                                <MovieCard 
                                    key={item.id} 
                                    item={item} 
                                    type={getContentType(sectionKey, item)}
                                />
                            ))}
                        </div>
                    </div>
                );
            };

            useEffect(() => {
                Promise.all([
                    axios.get(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/trending/tv/day?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/tv/popular?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/tv/airing_today?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/tv/on_the_air?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`),
                    axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`),
                    axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27`),
                    axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=99`)
                ]).then(([
                    trendingMoviesWeekRes,
                    trendingTVWeekRes,
                    trendingMoviesDayRes,
                    trendingTVDayRes,
                    topRatedMoviesRes,
                    upcomingRes,
                    popularMoviesRes,
                    nowPlayingRes,
                    topRatedTVRes,
                    popularTVRes,
                    airingTodayRes,
                    onTheAirRes,
                    actionRes,
                    comedyRes,
                    horrorRes,
                    documentaryRes
                ]) => {
                    setFeatured(trendingMoviesWeekRes.data.results[0]);
                    setSections({
                        trendingMoviesWeek: trendingMoviesWeekRes.data.results.slice(1),
                        trendingTVWeek: trendingTVWeekRes.data.results,
                        trendingMoviesDay: trendingMoviesDayRes.data.results,
                        trendingTVDay: trendingTVDayRes.data.results,
                        topRatedMovies: topRatedMoviesRes.data.results,
                        topRatedTV: topRatedTVRes.data.results,
                        upcoming: upcomingRes.data.results,
                        popularMovies: popularMoviesRes.data.results,
                        popularTV: popularTVRes.data.results,
                        nowPlaying: nowPlayingRes.data.results,
                        airingToday: airingTodayRes.data.results,
                        onTheAir: onTheAirRes.data.results,
                        action: actionRes.data.results,
                        comedy: comedyRes.data.results,
                        horror: horrorRes.data.results,
                        documentary: documentaryRes.data.results
                    });
                });
            }, []);

            return (
                <div className="space-y-12">
                    {featured && <FeaturedHero item={featured} />}
                    
                    {/* Section Navigation */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        {Object.keys(sectionTitles).map(section => (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                                    activeSection === section
                                        ? 'bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-white'
                                        : 'premium-glass hover:bg-white/10'
                                }`}
                            >
                                {sectionTitles[section]}
                            </button>
                        ))}
                    </div>

                    {/* Active Section Content */}
                    <div className="space-y-12">
                        {sections[activeSection] && (
                            <CategorySlider 
                                title={sectionTitles[activeSection]} 
                                items={sections[activeSection]}
                                type={getContentType(activeSection, sections[activeSection][0])}
                            />
                        )}
                    </div>
                </div>
            );
        }

        function FeaturedHero({ item }) {
            const [featured, setFeatured] = useState([]);
            const [currentIndex, setCurrentIndex] = useState(0);
            const [progress, setProgress] = useState(0);
            const [isTransitioning, setIsTransitioning] = useState(false);
            const CYCLE_DURATION = 8000;
            const TRANSITION_DURATION = 1000;

            const formatRating = (rating) => {
                return rating ? rating.toFixed(1) : 'N/A';
            };

            useEffect(() => {
                Promise.all([
                    axios.get(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/trending/tv/day?api_key=${API_KEY}`)
                ]).then(([movieRes, tvRes]) => {
                    const movies = movieRes.data.results.slice(0, 3).map(m => ({ ...m, media_type: 'movie' }));
                    const shows = tvRes.data.results.slice(0, 3).map(s => ({ ...s, media_type: 'tv' }));
                    setFeatured([...movies, ...shows]);
                });
            }, []);

            useEffect(() => {
                if (featured.length === 0) return;

                const progressInterval = setInterval(() => {
                    setProgress(prev => {
                        if (prev >= 100) {
                            setIsTransitioning(true);
                            setTimeout(() => {
                                setCurrentIndex(current => (current + 1) % featured.length);
                                setTimeout(() => {
                                    setIsTransitioning(false);
                                }, TRANSITION_DURATION / 2);
                            }, TRANSITION_DURATION / 2);
                            return 0;
                        }
                        return prev + (100 / (CYCLE_DURATION / 100));
                    });
                }, 100);

                return () => clearInterval(progressInterval);
            }, [featured]);

            if (featured.length === 0) return null;

            const currentItem = featured[currentIndex];

            return (
                <div className="relative h-[85vh] pt-40">
                    <div className="absolute inset-x-0 top-40 bottom-0 mx-4">
                        <div className={`relative h-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-1000 ${
                            isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                        }`}>
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img 
                                    src={`https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`}
                                    alt={currentItem.title || currentItem.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                            </div>

                            {/* Progress Indicators */}
                            <div className="absolute top-8 right-8 flex items-center space-x-3">
                                {featured.map((_, idx) => (
                                    <div key={idx} 
                                        className={`relative h-1 bg-white/20 rounded-full overflow-hidden transition-all duration-300 ${
                                            idx === currentIndex ? 'w-16' : 'w-4'
                                        }`}
                                    >
                                        <div 
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] rounded-full shimmer"
                                            style={{
                                                width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 p-16 flex items-end">
                                <div className="max-w-3xl space-y-6">
                                    <h1 className="text-7xl font-bold text-gradient-animated leading-tight">
                                        {currentItem.title || currentItem.name}
                                    </h1>
                                    <div className="flex items-center space-x-4">
                                        <span className="flex items-center text-yellow-400">
                                            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {formatRating(currentItem.vote_average)}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-300">{new Date(currentItem.release_date || currentItem.first_air_date).getFullYear()}</span>
                                    </div>
                                    <p className="text-gray-300 text-lg line-clamp-3">{currentItem.overview}</p>
                                    <div className="flex items-center space-x-4">
                                        <Link 
                                            to={`/${currentItem.media_type}/${currentItem.id}`}
                                            className="group px-8 py-4 rounded-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-white font-semibold hover:shadow-lg hover:shadow-[#4facfe]/20 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>More Info</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        function CategorySlider({ title, items, type, onLoadMore, hasMore, loading }) {
            const containerRef = useRef(null);
            const observerRef = useRef(null);

            useEffect(() => {
                const options = {
                    root: null,
                    rootMargin: '20px',
                    threshold: 0.1
                };

                observerRef.current = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && hasMore && !loading) {
                        onLoadMore();
                    }
                }, options);

                const container = containerRef.current;
                if (container) {
                    observerRef.current.observe(container);
                }

                return () => {
                    if (observerRef.current) {
                        observerRef.current.disconnect();
                    }
                };
            }, [hasMore, loading, onLoadMore]);

            return (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {items.map((item, index) => (
                            <MovieCard key={item.id} item={item} type={type} />
                        ))}
                        {loading && (
                            [...Array(5)].map((_, i) => (
                                <div key={`skeleton-${i}`} className="loading-skeleton aspect-[2/3] rounded-xl" />
                            ))
                        )}
                        <div ref={containerRef} style={{ gridColumn: '1/-1', height: '10px' }} />
                    </div>
                </div>
            );
        }

        function ContentList({ type }) {
            const [items, setItems] = useState([]);
            const [page, setPage] = useState(1);
            const [loading, setLoading] = useState(true);

            useEffect(() => {
                axios.get(`${BASE_URL}/${type}/popular?api_key=${API_KEY}&page=${page}`)
                    .then(response => {
                        if (page === 1) {
                            setItems(response.data.results);
                        } else {
                            setItems(prev => [...prev, ...response.data.results]);
                        }
                        setLoading(false);
                    });
            }, [type, page]);

            if (loading && page === 1) {
                return (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] rounded-xl loading-skeleton" />
                        ))}
                    </div>
                );
            }

            return (
                <div className="space-y-8">
                    <h1 className="text-4xl font-bold text-gradient-animated">
                        {type === 'movie' ? 'Movies' : 'TV Shows'}
                    </h1>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {items.map(item => (
                            <MovieCard 
                                key={item.id} 
                                item={item} 
                                type={type}
                            />
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <button 
                            onClick={() => setPage(prev => prev + 1)}
                            className="px-8 py-3 rounded-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-white font-semibold hover:shadow-lg hover:shadow-[#4facfe]/20 transition-all duration-300 transform hover:scale-105"
                        >
                            Load More
                        </button>
                    </div>
                </div>
            );
        }

        function MovieList() {
            return <ContentList type="movie" />;
        }

        function TVShowList() {
            return <ContentList type="tv" />;
        }

        function MovieDetails() {
            const { id } = useParams();
            const [movie, setMovie] = useState(null);
            const [cast, setCast] = useState([]);
            const [similar, setSimilar] = useState([]);
            const [loading, setLoading] = useState(true);
            const [showPlayer, setShowPlayer] = useState(false);

            const formatRating = (rating) => {
                return rating ? rating.toFixed(1) : 'N/A';
            };

            useEffect(() => {
                Promise.all([
                    axios.get(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}`)
                ]).then(([movieRes, creditsRes, similarRes]) => {
                    setMovie(movieRes.data);
                    setCast(creditsRes.data.cast.slice(0, 10));
                    setSimilar(similarRes.data.results.slice(0, 6));
                    setLoading(false);
                });
            }, [id]);

            if (loading || !movie) {
                return (
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="loading-skeleton w-full max-w-6xl h-[70vh] rounded-xl" />
                    </div>
                );
            }

            return (
                <div className="min-h-screen bg-gray-900">
                    {/* Hero Section with Backdrop */}
                    <div className="relative">
                        <div className="absolute inset-0 h-[90vh]">
                            <img 
                                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80" />
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60" />
                        </div>

                        <div className="relative pt-40 pb-20 px-4 container mx-auto">
                            <div className="flex flex-col md:flex-row gap-12">
                                {/* Left Column - Poster and Actions */}
                                <div className="w-full md:w-1/3">
                                    <div className="sticky top-24 space-y-6">
                                        <div className="premium-card rounded-xl overflow-hidden shadow-2xl shadow-blue-500/10">
                                            <img 
                                                src={`${IMG_BASE_URL}${movie.poster_path}`}
                                                alt={movie.title}
                                                className="w-full rounded-xl hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex flex-col gap-4">
                                            <button 
                                                onClick={() => setShowPlayer(true)}
                                                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-white rounded-xl 
                                                    hover:shadow-lg hover:shadow-[#4facfe]/20 transition-all duration-300 hover:scale-105 
                                                    flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Play Movie
                                            </button>
                                            <WatchlistButton 
                                                item={{...movie, media_type: 'movie'}} 
                                                className="w-full py-4 text-lg font-semibold premium-glass rounded-xl hover:scale-105 transition-all duration-300" 
                                            />
                                        </div>

                                        {/* Movie Info Cards */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="premium-glass rounded-xl p-4 text-center">
                                                <p className="text-gray-400 text-sm">Rating</p>
                                                <p className="text-white font-semibold mt-1">
                                                    {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="premium-glass rounded-xl p-4 text-center">
                                                <p className="text-gray-400 text-sm">Runtime</p>
                                                <p className="text-white font-semibold mt-1">
                                                    {movie.runtime} min
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Content */}
                                <div className="w-full md:w-2/3 text-white space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="px-2 py-1 rounded-md bg-white/10">
                                                {new Date(movie.release_date).getFullYear()}
                                            </span>
                                            {movie.genres && movie.genres.map(genre => (
                                                <span key={genre.id} className="px-2 py-1 rounded-md bg-white/10">
                                                    {genre.name}
                                                </span>
                                            ))}
                                        </div>

                                        <h1 className="text-6xl font-bold text-gradient-animated leading-tight">
                                            {movie.title}
                                        </h1>

                                        <p className="text-xl text-gray-300 leading-relaxed">
                                            {movie.overview}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Video Player Modal */}
                    {showPlayer && (
                        <VideoPlayer 
                            type="movie"
                            tmdbId={id}
                            onClose={() => setShowPlayer(false)}
                        />
                    )}
                </div>
            );
        }

        function TVDetails() {
            const { id } = useParams();
            const [show, setShow] = useState(null);
            const [selectedSeason, setSelectedSeason] = useState(1);
            const [seasonDetails, setSeasonDetails] = useState(null);
            const [cast, setCast] = useState([]);
            const [similar, setSimilar] = useState([]);
            const [loading, setLoading] = useState(true);
            const [showPlayer, setShowPlayer] = useState(null);

            const formatRating = (rating) => {
                return rating ? rating.toFixed(1) : 'N/A';
            };

            useEffect(() => {
                Promise.all([
                    axios.get(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/tv/${id}/credits?api_key=${API_KEY}`),
                    axios.get(`${BASE_URL}/tv/${id}/similar?api_key=${API_KEY}`)
                ]).then(([showRes, creditsRes, similarRes]) => {
                    setShow(showRes.data);
                    setCast(creditsRes.data.cast.slice(0, 10));
                    setSimilar(similarRes.data.results.slice(0, 6));
                    setLoading(false);
                });
            }, [id]);

            useEffect(() => {
                if (show && selectedSeason) {
                    axios.get(`${BASE_URL}/tv/${id}/season/${selectedSeason}?api_key=${API_KEY}`)
                        .then(response => setSeasonDetails(response.data));
                }
            }, [id, selectedSeason, show]);

            if (loading || !show) {
                return (
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="loading-skeleton w-full max-w-6xl h-[70vh] rounded-xl" />
                    </div>
                );
            }

            return (
                <div className="min-h-screen bg-gray-900">
                    {/* Hero Section */}
                    <div className="relative">
                        <div className="absolute inset-0 h-[90vh]">
                            <img 
                                src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
                                alt={show.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80" />
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60" />
                        </div>

                        <div className="relative pt-40 pb-20 px-4 container mx-auto">
                            <div className="flex flex-col lg:flex-row gap-12">
                                {/* Left Sidebar */}
                                <div className="w-full lg:w-1/4">
                                    <div className="sticky top-24 space-y-6">
                                        <div className="premium-card rounded-xl overflow-hidden shadow-2xl shadow-blue-500/10">
                                            <img 
                                                src={`${IMG_BASE_URL}${show.poster_path}`}
                                                alt={show.name}
                                                className="w-full rounded-xl hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        
                                        <WatchlistButton 
                                            item={{...show, media_type: 'tv'}} 
                                            className="w-full py-4 text-lg font-semibold premium-glass rounded-xl hover:scale-105 transition-all duration-300" 
                                        />

                                        {/* Show Stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="premium-glass rounded-xl p-4 text-center">
                                                <p className="text-gray-400 text-sm">Rating</p>
                                                <p className="text-white font-semibold mt-1">
                                                    {formatRating(show.vote_average)}
                                                </p>
                                            </div>
                                            <div className="premium-glass rounded-xl p-4 text-center">
                                                <p className="text-gray-400 text-sm">Episodes</p>
                                                <p className="text-white font-semibold mt-1">
                                                    {show.number_of_episodes}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="w-full lg:w-3/4 text-white space-y-8">
                                    {/* Show Title & Info */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm flex-wrap">
                                            <span className="px-2 py-1 rounded-md bg-white/10">
                                                {new Date(show.first_air_date).getFullYear()}
                                            </span>
                                            {show.genres && show.genres.map(genre => (
                                                <span key={genre.id} className="px-2 py-1 rounded-md bg-white/10">
                                                    {genre.name}
                                                </span>
                                            ))}
                                        </div>

                                        <h1 className="text-5xl font-bold text-gradient-animated leading-tight">
                                            {show.name}
                                        </h1>

                                        <p className="text-xl text-gray-300 leading-relaxed">
                                            {show.overview}
                                        </p>
                                    </div>

                                    {/* Season Selector */}
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-semibold">Seasons</h2>
                                        <div className="flex gap-3 overflow-x-auto pb-4 premium-scrollbar">
                                            {Array.from({ length: show.number_of_seasons }, (_, i) => i + 1).map(season => (
                                                <button
                                                    key={season}
                                                    onClick={() => setSelectedSeason(season)}
                                                    className={`flex-shrink-0 px-6 py-3 rounded-xl transition-all duration-300 ${
                                                        selectedSeason === season
                                                            ? 'bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-white shadow-lg shadow-[#4facfe]/20'
                                                            : 'premium-glass text-gray-400 hover:text-white'
                                                    }`}
                                                >
                                                    Season {season}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Episodes Grid */}
                                    {seasonDetails && (
                                        <div className="space-y-6">
                                            <h2 className="text-2xl font-semibold">Episodes</h2>
                                            <div className="grid gap-4">
                                                {seasonDetails.episodes.map(episode => (
                                                    <div key={episode.id} 
                                                        className="premium-glass rounded-xl overflow-hidden hover:scale-[1.01] transition-transform duration-300"
                                                    >
                                                        <div className="flex flex-col md:flex-row gap-6 p-4">
                                                            <div className="relative md:w-64 flex-shrink-0">
                                                                {episode.still_path ? (
                                                                    <img 
                                                                        src={`${IMG_BASE_URL}${episode.still_path}`}
                                                                        alt={episode.name}
                                                                        className="w-full aspect-video object-cover rounded-lg"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                                                                        <span className="text-gray-500">No Preview</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                                                    <h3 className="text-xl font-semibold">
                                                                        {episode.episode_number}. {episode.name}
                                                                    </h3>
                                                                    <button 
                                                                        onClick={() => setShowPlayer({ season: selectedSeason, episode: episode.episode_number })}
                                                                        className="px-6 py-2 rounded-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] 
                                                                            text-white font-semibold hover:shadow-lg hover:shadow-[#4facfe]/20 
                                                                            transition-all duration-300 transform hover:scale-105
                                                                            flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                        </svg>
                                                                        Play
                                                                    </button>
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                                    <span>{new Date(episode.air_date).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Similar Shows */}
                                    {similar.length > 0 && (
                                        <div className="space-y-6">
                                            <h3 className="text-2xl font-semibold">Similar Shows</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6">
                                                {similar.map(show => (
                                                    <MovieCard key={show.id} item={show} type="tv" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Video Player */}
                    {showPlayer && (
                        <VideoPlayer 
                            type="tv"
                            tmdbId={id}
                            season={showPlayer.season}
                            episode={showPlayer.episode}
                            onClose={() => setShowPlayer(null)}
                        />
                    )}
                </div>
            );
        }

        function Footer() {
            return (
                <footer className="bg-[#1a1a1a] text-gray-300 py-16">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-wrap justify-between">
                            <div className="w-full md:w-1/3 mb-8 md:mb-0">
                                <h3 className="text-3xl font-bold gradient-text mb-4">Hexa</h3>
                                <p className="text-gray-400">Your premium destination for the latest movies and TV shows. Stream anywhere, anytime.</p>
                            </div>
                            <div className="w-full md:w-1/3 mb-8 md:mb-0">
                                <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
                                <ul className="space-y-2">
                                    <li><Link to="/" className="text-gray-400 hover:text-[#4facfe] transition duration-300">Home</Link></li>
                                    <li><Link to="/movies" className="text-gray-400 hover:text-[#4facfe] transition duration-300">Movies</Link></li>
                                    <li><Link to="/tv" className="text-gray-400 hover:text-[#4facfe] transition duration-300">TV Shows</Link></li>
                                </ul>
                            </div>
                            <div className="w-full md:w-1/3">
                                <h4 className="text-xl font-semibold mb-4">Connect With Us</h4>
                                <div className="flex space-x-4">
                                    {/* Social media icons here */}
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
                            <p>&copy; 2024 Hexa. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            );
        }

        function MovieCard({ item, type }) {
            const [isHovered, setIsHovered] = useState(false);
            
            const formatRating = (rating) => rating ? rating.toFixed(1) : 'N/A';
            
            // Determine media type with more precise logic
            const getMediaType = () => {
                // If type is explicitly provided and valid, use it
                if (type === 'tv' || type === 'movie') {
                    return type;
                }
                // If item has explicit media_type, use it
                if (item.media_type && (item.media_type === 'tv' || item.media_type === 'movie')) {
                    return item.media_type;
                }
                // Deduce from item properties
                if (item.first_air_date || item.name) {
                    return 'tv';
                }
                if (item.release_date || item.title) {
                    return 'movie';
                }
                // Final fallback
                return 'movie';
            };
            
            const mediaType = getMediaType();
            const path = `/${mediaType}/${item.id}`;
            const title = mediaType === 'tv' ? item.name : item.title;
            
            return (
                <Link 
                    to={path}
                    className="group relative block overflow-hidden rounded-xl transition-transform duration-300 hover:-translate-y-2"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="relative aspect-[2/3]">
                        <img 
                            src={`${IMG_BASE_URL}${item.poster_path}`}
                            alt={title}
                            className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                        />
                        {isHovered && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col justify-end p-4 space-y-2 rounded-xl">
                                <h3 className="text-white font-semibold">{title}</h3>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-300">{item.release_date || item.first_air_date}</span>
                                    <span className="text-gray-300">{formatRating(item.vote_average)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </Link>
            );
        }

        function WatchlistButton({ item, className = "" }) {
            const [inWatchlist, setInWatchlist] = useState(false);
            const { watchlist, updateWatchlist } = React.useContext(WatchlistContext);

            useEffect(() => {
                setInWatchlist(watchlist.some(i => i.id === item.id));
            }, [item.id, watchlist]);

            const toggleWatchlist = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                let newWatchlist;
                if (inWatchlist) {
                    newWatchlist = watchlist.filter(i => i.id !== item.id);
                } else {
                    newWatchlist = [...watchlist, { ...item }];
                }
                
                updateWatchlist(newWatchlist);
                setInWatchlist(!inWatchlist);
            };

            return (
                <button
                    onClick={toggleWatchlist}
                    className={`p-2 rounded-full transition-all duration-300 ${
                        inWatchlist ? 'bg-[#4facfe] text-white' : 'bg-gray-800/80 text-gray-400'
                    } hover:scale-110 ${className}`}
                >
                    <svg 
                        className="w-6 h-6" 
                        fill="currentColor" 
                        viewBox="0 0 24 24" 
                        strokeWidth="2"
                    >
                        {inWatchlist ? (
                            // Filled bookmark icon
                            <path d="M5 5c0-1.1.9-2 2-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        ) : (
                            // Outline bookmark icon
                            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3.5L19 21V5c0-1.1-.9-2-2-2zm0 15l-5-2.5L7 18V5h10v13z" />
                        )}
                    </svg>
                </button>
            );
        }

        function Watchlist() {
            const { watchlist } = React.useContext(WatchlistContext);

            return (
                <div className="pt-4">
                    <h2 className="text-4xl font-bold mb-8 text-gradient-animated">My Watchlist</h2>
                    {watchlist.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-2xl text-gray-400 mb-4">Your watchlist is empty</h3>
                            <Link to="/" className="text-[#4facfe] hover:text-white transition-colors duration-300">
                                Browse content →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {watchlist.map(item => (
                                <MovieCard key={item.id} item={item} type={item.media_type} />
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        function VideoPlayer({ type, tmdbId, season, episode, onClose }) {
            const { progress, updateProgress } = React.useContext(WatchProgressContext);
            const iframeRef = useRef(null);
            
            const iframeSrc = type === 'movie' 
                ? `https://api.hexa.watch/movie/${tmdbId}`
                : `https://api.hexa.watch/tv/${tmdbId}/${season}/${episode}`;

            useEffect(() => {
                const handleMessage = (event) => {
                    if (!event.origin.includes('api.hexa.watch')) return;
                    
                    if (event.data && event.data.type === 'MEDIA_DATA') {
                        updateProgress(tmdbId, {
                            id: tmdbId,
                            type: type,
                            season: season,
                            episode: episode,
                            progress: event.data.data
                        });
                    }
                    
                    if (event.data && event.data.type === 'REQUEST_WATCH_PROGRESS') {
                        const savedProgress = progress[tmdbId];
                        if (savedProgress && iframeRef.current) {
                            iframeRef.current.contentWindow.postMessage({
                                type: 'WATCH_PROGRESS_DATA',
                                data: savedProgress.progress
                            }, '*');
                        }
                    }
                };

                window.addEventListener('message', handleMessage);
                return () => window.removeEventListener('message', handleMessage);
            }, [tmdbId, type, season, episode, progress, updateProgress]);

            return (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
                    <div className="relative w-full h-full max-w-7xl max-h-[80vh] mx-4">
                        <button 
                            onClick={onClose}
                            className="absolute -top-12 right-0 text-white hover:text-[#4facfe] transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <iframe 
                            ref={iframeRef}
                            src={iframeSrc}
                            className="w-full h-full rounded-xl"
                            frameBorder="0" 
                            allowFullScreen
                        />
                    </div>
                </div>
            );
        }

        function Search() {
            const [results, setResults] = useState([]);
            const [loading, setLoading] = useState(false);
            const [page, setPage] = useState(1);
            const [hasMore, setHasMore] = useState(true);
            const location = ReactRouterDOM.useLocation();
            const observer = useRef();
            
            const lastElementRef = useCallback(node => {
                if (loading) return;
                if (observer.current) observer.current.disconnect();
                observer.current = new IntersectionObserver(entries => {
                    if (entries[0].isIntersecting && hasMore) {
                        setPage(prevPage => prevPage + 1);
                    }
                });
                if (node) observer.current.observe(node);
            }, [loading, hasMore]);

            useEffect(() => {
                const params = new URLSearchParams(location.search);
                const searchQuery = params.get('q');
                if (searchQuery) {
                    setPage(1);
                    setResults([]);
                    performSearch(searchQuery, 1, true);
                }
            }, [location.search]);

            useEffect(() => {
                const params = new URLSearchParams(location.search);
                const searchQuery = params.get('q');
                if (page > 1 && searchQuery) {
                    performSearch(searchQuery, page, false);
                }
            }, [page]);

            const performSearch = (searchQuery, pageNum, reset) => {
                setLoading(true);
                const searchEndpoint = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${pageNum}`;

                axios.get(searchEndpoint)
                    .then(response => {
                        const filteredResults = response.data.results.filter(item => item.poster_path);
                        setResults(prev => reset ? filteredResults : [...prev, ...filteredResults]);
                        setHasMore(response.data.page < response.data.total_pages);
                    })
                    .finally(() => setLoading(false));
            };

            const params = new URLSearchParams(location.search);
            const searchQuery = params.get('q');

            return (
                <div className="space-y-8 pt-20">
                    {results.length > 0 && (
                        <CategorySlider 
                            title={`Search Results for "${searchQuery}"`}
                            items={results}
                            type="both"
                            loadMore={hasMore ? lastElementRef : null}
                        />
                    )}

                    {loading && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="aspect-[2/3] rounded-xl loading-skeleton" />
                            ))}
                        </div>
                    )}

                    {!loading && results.length === 0 && searchQuery && (
                        <div className="text-center text-gray-400 py-12">
                            No results found
                        </div>
                    )}
                </div>
            );
        }

        function SearchBar() {
            const [query, setQuery] = useState('');
            const [isOpen, setIsOpen] = useState(false);
            const searchRef = useRef(null);

            return (
                <div ref={searchRef} className="relative w-full md:w-auto z-50">
                    <div className="premium-glass rounded-full overflow-hidden flex items-center">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setIsOpen(true);
                            }}
                            placeholder="Search movies & TV shows..."
                            className="w-full md:w-64 px-6 py-2 bg-transparent outline-none text-white placeholder-gray-400"
                        />
                        <Link 
                            to={query.length >= 2 ? `/search?q=${encodeURIComponent(query)}` : '/search'}
                            className="px-4 hover:text-[#4facfe] transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </Link>
                    </div>
                </div>
            );
        }

        function ContinueWatching() {
            const { progress } = React.useContext(WatchProgressContext);
            const [items, setItems] = useState([]);
            const [loading, setLoading] = useState(true);

            useEffect(() => {
                const fetchDetails = async () => {
                    setLoading(true);
                    const progressItems = Object.values(progress).sort((a, b) => 
                        new Date(b.lastUpdated) - new Date(a.lastUpdated)
                    );

                    const detailedItems = await Promise.all(
                        progressItems.map(async (item) => {
                            const endpoint = item.type === 'movie' ? 'movie' : 'tv';
                            try {
                                const response = await axios.get(
                                    `${BASE_URL}/${endpoint}/${item.id}?api_key=${API_KEY}`
                                );
                                return {
                                    ...response.data,
                                    progress: item.progress,
                                    type: item.type,
                                    season: item.season,
                                    episode: item.episode
                                };
                            } catch (error) {
                                console.error('Error fetching details:', error);
                                return null;
                            }
                        })
                    );

                    setItems(detailedItems.filter(item => item !== null));
                    setLoading(false);
                };

                fetchDetails();
            }, [progress]);

            const formatProgress = (progress) => {
                const percentage = (progress.watched / progress.duration) * 100;
                return Math.round(percentage);
            };

            return (
                <div className="pt-4">
                    <h2 className="text-4xl font-bold mb-8 text-gradient-animated">Continue Watching</h2>
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4facfe]"></div>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-2xl text-gray-400 mb-4">No items in progress</h3>
                            <Link to="/" className="text-[#4facfe] hover:text-white transition-colors duration-300">
                                Browse content →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {items.map((item) => (
                                <Link 
                                    key={`${item.type}-${item.id}`}
                                    to={`/${item.type}/${item.id}`}
                                    className="group relative block overflow-hidden rounded-xl transition-transform duration-300 hover:-translate-y-2"
                                >
                                    <div className="relative aspect-[2/3]">
                                        <img 
                                            src={`${IMG_BASE_URL}${item.poster_path}`}
                                            alt={item.title || item.name}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
                                            <h3 className="text-white font-semibold mb-1">{item.title || item.name}</h3>
                                            {item.type === 'tv' && (
                                                <p className="text-sm text-gray-300 mb-1">
                                                    S{item.season} E{item.episode}
                                                </p>
                                            )}
                                            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                                                <div 
                                                    className="bg-[#4facfe] h-full rounded-full"
                                                    style={{ width: `${formatProgress(item.progress)}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatProgress(item.progress)}% completed
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        ReactDOM.render(<App />, document.getElementById('root'));  

