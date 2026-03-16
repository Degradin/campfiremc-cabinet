import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// TODO: Use environment variable for API URL
const API_URL = 'http://localhost:5000';

const Home = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${API_URL}/news`);
        setNews(response.data);
      } catch (err) {
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div>Loading news...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-8">News & Updates</h1>
      <div className="grid gap-6">
        {news.length > 0 ? (
          news.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <CardTitle>{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No news to display at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
