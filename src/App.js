import React, { useState } from 'react';
import './App.css';
import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const GEMINI_API_KEY = 'AIzaSyCMZ01HsTcBM8wECu5Nlr5ous0_yt7iDhI';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
const GEMINI_TEXT_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState(null);
  const [error, setError] = useState('');
  const [foodResult, setFoodResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setDownloadURL(null);
      setError('');
      setFoodResult(null);
      setRecipe(null);
      setRecipeError('');
    }
  };

  const handleUpload = () => {
    if (!image) return;
    setUploading(true);
    setProgress(0);
    setError('');
    setFoodResult(null);
    setRecipe(null);
    setRecipeError('');
    const storageRef = ref(storage, `uploads/${image.name}-${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (err) => {
        setError('Upload failed. Please try again.');
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setDownloadURL(url);
          setUploading(false);
          analyzeImage(url);
        });
      }
    );
  };

  const analyzeImage = async (imageUrl) => {
    setAnalyzing(true);
    setFoodResult(null);
    setError('');
    setRecipe(null);
    setRecipeError('');
    try {
      // Fetch the image as base64 (Gemini expects inline image data)
      const imgRes = await fetch(imageUrl);
      const blob = await imgRes.blob();
      const base64 = await blobToBase64(blob);
      // Prepare Gemini API request
      const body = {
        contents: [
          {
            parts: [
              {
                text: 'Identify the food items in this image. List them as a comma-separated list.'
              },
              {
                inlineData: {
                  mimeType: blob.type,
                  data: base64.replace(/^data:[^,]+,/, '')
                }
              }
            ]
          }
        ]
      };
      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Gemini API error');
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No result';
      setFoodResult(text);
      // Automatically generate recipe after food items are identified
      if (text && text !== 'No result') {
        generateRecipeWithFoodItems(text);
      }
    } catch (err) {
      setError('Failed to analyze image.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper to generate recipe with provided food items
  const generateRecipeWithFoodItems = async (foodItems) => {
    setRecipeLoading(true);
    setRecipeError('');
    setRecipe(null);
    try {
      const prompt = `Generate a detailed recipe using the following food items: ${foodItems}. Include a title, ingredients, and step-by-step instructions. Format the instructions as a numbered list.`;
      const body = {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      };
      const res = await fetch(`${GEMINI_TEXT_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Gemini API error');
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No recipe found.';
      setRecipe(text);
    } catch (err) {
      setRecipeError('Failed to generate recipe.');
    } finally {
      setRecipeLoading(false);
    }
  };

  // Generate recipe using Gemini text API (kept for button, but now not used automatically)
  const generateRecipe = async () => {
    if (!foodResult) return;
    generateRecipeWithFoodItems(foodResult);
  };

  // Helper: convert Blob to base64
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Snap2Chef</h1>
        <p>AI-powered recipes from your photos or voice!</p>
        <div style={{ margin: '2rem 0' }}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploading || analyzing || recipeLoading}
              style={{ display: 'block', margin: '0 auto 1rem' }}
            />
            {preview && (
              <img src={preview} alt="Preview" style={{ maxWidth: 200, borderRadius: 8, marginBottom: 8 }} />
            )}
            <button
              style={{ fontSize: '1.1rem', margin: '0.5rem' }}
              onClick={handleUpload}
              disabled={!image || uploading || analyzing || recipeLoading}
            >
              {uploading ? `Uploading... (${progress}%)` : analyzing ? 'Analyzing...' : 'Upload & Analyze'}
            </button>
            {downloadURL && foodResult && (
              <div style={{ color: 'lightgreen', marginTop: 8 }}>
                <strong>Identified food items:</strong><br />
                {foodResult}
                {/* Recipe is now generated automatically, so button is hidden */}
                {/* <div style={{ marginTop: 12 }}>
                  <button
                    style={{ fontSize: '1.1rem', margin: '0.5rem' }}
                    onClick={generateRecipe}
                    disabled={recipeLoading}
                  >
                    {recipeLoading ? 'Generating Recipe...' : 'Generate Recipe'}
                  </button>
                </div> */}
              </div>
            )}
            {recipe && (
              <div style={{ background: '#222', color: '#fff', borderRadius: 8, padding: 16, marginTop: 16, textAlign: 'left', maxWidth: 400 }}>
                <strong>Recipe:</strong>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>{recipe}</pre>
              </div>
            )}
            {recipeError && <div style={{ color: 'salmon', marginTop: 8 }}>{recipeError}</div>}
            {downloadURL && analyzing && (
              <div style={{ color: '#ccc', marginTop: 8 }}>Analyzing image...</div>
            )}
            {downloadURL && !foodResult && !analyzing && !error && (
              <div style={{ color: '#ccc', marginTop: 8 }}>No food items identified.</div>
            )}
            {error && <div style={{ color: 'salmon', marginTop: 8 }}>{error}</div>}
          </div>
          <button style={{ fontSize: '1.2rem', margin: '1rem' }} disabled>
            🎤 Use Voice Command (coming soon)
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
          (Image upload, food recognition, and recipe generation are live! Voice and video features coming soon)
        </p>
      </header>
    </div>
  );
}

export default App;
