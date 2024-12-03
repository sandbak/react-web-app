import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  location: string;
  joinDate: string;
  avatarUrl?: string;
}

const defaultProfile: UserProfile = {
  name: '',
  email: '',
  bio: '',
  location: '',
  joinDate: new Date().toLocaleDateString(),
};

export const Profile: React.FC = () => {
  const [profile, setProfile] = React.useState<UserProfile>(defaultProfile);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedProfile, setEditedProfile] = React.useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      
      try {
        const docRef = doc(db, 'profiles', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile({ ...docSnap.data() as UserProfile });
          setEditedProfile({ ...docSnap.data() as UserProfile });
        } else {
          // Initialize with default profile and email from auth
          const initialProfile = {
            ...defaultProfile,
            email: currentUser.email || '',
            name: currentUser.displayName || '',
          };
          setProfile(initialProfile);
          setEditedProfile(initialProfile);
          await setDoc(docRef, initialProfile);
        }
      } catch (err) {
        setError('Failed to load profile');
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setError('');
      const docRef = doc(db, 'profiles', currentUser.uid);
      console.log('Saving profile for user:', currentUser.uid);
      console.log('Profile data:', editedProfile);
      
      await setDoc(docRef, {
        ...editedProfile,
        updatedAt: new Date().toISOString()
      });
      
      setProfile(editedProfile);
      setIsEditing(false);
      setSaveSuccess(true);
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
    setSaveSuccess(false);
    setError('');
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>Profile saved successfully!</Alert>}
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  margin: '0 auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                }}
                src={profile.avatarUrl}
              >
                {profile.name.charAt(0)}
              </Avatar>
              {!isEditing && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  Edit Profile
                </Button>
              )}
            </Grid>
            <Grid item xs={12} sm={8}>
              {isEditing ? (
                <Box component="form" noValidate>
                  <TextField
                    fullWidth
                    label="Name"
                    value={editedProfile.name}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, name: e.target.value })
                    }
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={editedProfile.email}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, email: e.target.value })
                    }
                    margin="normal"
                    disabled
                  />
                  <TextField
                    fullWidth
                    label="Bio"
                    value={editedProfile.bio}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, bio: e.target.value })
                    }
                    margin="normal"
                    multiline
                    rows={3}
                  />
                  <TextField
                    fullWidth
                    label="Location"
                    value={editedProfile.location}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, location: e.target.value })
                    }
                    margin="normal"
                  />
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                      sx={{ mr: 1 }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Typography variant="h4" gutterBottom>
                    {profile.name || 'Your Name'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {profile.email}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Bio"
                        secondary={profile.bio || 'Tell us about yourself'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Location"
                        secondary={profile.location || 'Your location'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Member Since"
                        secondary={profile.joinDate}
                      />
                    </ListItem>
                  </List>
                </>
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
