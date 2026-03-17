import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Profile = () => {
  const { user } = useAuth();
  const [skinFile, setSkinFile] = useState(null);
  const [capeFile, setCapeFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserTextures, setCurrentUserTextures] = useState({ skin: null, cape: null });

  useEffect(() => {
    const fetchUserTextures = async () => {
      if (user?.uuid) {
        try {
          const response = await axios.get(`${API_URL}/textures/${user.uuid}`);
          const textureData = JSON.parse(atob(response.data.properties[0].value));
          const skinUrl = textureData.textures.SKIN?.url ? `${API_URL}${textureData.textures.SKIN.url}` : null;
          const capeUrl = textureData.textures.CAPE?.url ? `${API_URL}${textureData.textures.CAPE.url}` : null;
          setCurrentUserTextures({
            skin: skinUrl,
            cape: capeUrl,
          });
        } catch (err) {
          console.error('Failed to fetch user textures', err);
        }
      }
    };

    fetchUserTextures();
  }, [user]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'skin') {
      setSkinFile(files[0]);
    } else if (name === 'cape') {
      setCapeFile(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!skinFile && !capeFile) {
      setError('Please select a skin or cape to upload.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    if (skinFile) {
      formData.append('skin', skinFile);
    }
    if (capeFile) {
      formData.append('cape', capeFile);
    }

    try {
      const response = await axios.post(`${API_URL}/textures/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`,
        },
      });
      setSuccess(response.data.message || 'Textures uploaded successfully!');
      // Refresh textures with full URL
      if (response.data.skin) {
        setCurrentUserTextures(prev => ({ ...prev, skin: `${API_URL}${response.data.skin}` }));
      }
      if (response.data.cape) {
        setCurrentUserTextures(prev => ({ ...prev, cape: `${API_URL}${response.data.cape}` }));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload textures.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.name}!</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Textures</CardTitle>
            <CardDescription>Upload a new skin or cape. Files must be in .png format.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              {error && <p className="text-destructive text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              <div className="grid gap-2">
                <Label htmlFor="skin">Skin (.png)</Label>
                <Input id="skin" name="skin" type="file" accept=".png" onChange={handleFileChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cape">Cape (.png)</Label>
                <Input id="cape" name="cape" type="file" accept=".png" onChange={handleFileChange} />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload'}
              </Button>
            </CardContent>
          </form>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current Textures</CardTitle>
            <CardDescription>Your current in-game skin and cape.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-around items-center">
            <div className="text-center">
              <h3 className="font-bold mb-2">Skin</h3>
              {currentUserTextures.skin ? (
                <img src={currentUserTextures.skin} alt="Current Skin" className="w-32 h-64 object-contain bg-muted rounded-md" />
              ) : (
                <div className="w-32 h-64 flex items-center justify-center bg-muted rounded-md text-muted-foreground">No Skin</div>
              )}
            </div>
            <div className="text-center">
              <h3 className="font-bold mb-2">Cape</h3>
              {currentUserTextures.cape ? (
                <img src={currentUserTextures.cape} alt="Current Cape" className="w-32 h-64 object-contain bg-muted rounded-md" />
              ) : (
                <div className="w-32 h-64 flex items-center justify-center bg-muted rounded-md text-muted-foreground">No Cape</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
