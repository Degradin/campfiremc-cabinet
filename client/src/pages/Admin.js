import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

// TODO: Use environment variable for API URL
const API_URL = 'http://localhost:5000';

const Admin = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API_URL}/news`);
      setNews(response.data);
    } catch (err) {
      setError('Failed to load news.');
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleCreateNews = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${API_URL}/news`, 
        { title, content, author_id: user.id }, 
        { headers: { 'Authorization': `Bearer ${user.token}` } }
      );
      setTitle('');
      setContent('');
      setSuccess('News article created successfully!');
      fetchNews(); // Refresh news list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create news article.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await axios.delete(`${API_URL}/news/${articleId}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        setSuccess('Article deleted successfully.');
        fetchNews(); // Refresh news list
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete article.');
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Panel - News Management</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create News Article</CardTitle>
            <CardDescription>Write and publish a new article for the community.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateNews}>
            <CardContent className="grid gap-4">
              {error && <p className="text-destructive text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content (HTML supported)</Label>
                <Textarea 
                  id="content" 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  required 
                  rows={10}
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? 'Publishing...' : 'Publish Article'}
              </Button>
            </CardContent>
          </form>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Published Articles</CardTitle>
            <CardDescription>Manage existing news articles.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {news.length > 0 ? (
              news.map((article) => (
                <div key={article.id} className="flex justify-between items-center p-2 border rounded-md">
                  <span>{article.title}</span>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteNews(article.id)}>
                    Delete
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No articles published yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
